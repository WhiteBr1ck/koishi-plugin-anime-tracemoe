import { Context, Schema, h } from 'koishi'

export const name = 'trace-moe'
export const using = ['http'] as const

interface TraceMoeTitle { native: string; romaji?: string; english?: string; }
interface TraceMoeAnilist { id: number; title: TraceMoeTitle; isAdult: boolean; genres?: string[]; coverImage?: { large?: string; medium?: string; }; startDate?: { year: number; month: number; day: number; }; }
interface TraceMoeResult { anilist: TraceMoeAnilist; episode: number | string; from: number; similarity: number; video?: string; image: string; }

export interface Config {
  apiKey: string; cutBorders: boolean; minSimilarity: number; showRomanjiTitle: boolean; useForward: boolean; logDetails: boolean; sendCoverImage: boolean; sendScenePreview: boolean;
}
export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string().description('（可选，留空则使用默认的 trace.moe API）你的 trace.moe API 密钥，用于提高搜索速率限制。'),
  minSimilarity: Schema.number().min(0).max(100).default(87).description('最低相似度 (0-100)。'),
  cutBorders: Schema.boolean().default(true).description('是否自动裁剪视频黑边。'),
  showRomanjiTitle: Schema.boolean().default(true).description('是否在原生标题旁显示罗马音标题。'),
  sendCoverImage: Schema.boolean().default(true).description('是否发送番剧的封面（海报）图。'),
  sendScenePreview: Schema.boolean().default(true).description('是否发送识别出的场景预览（视频或截图）。'),
  useForward: Schema.boolean().default(false).description('是否使用合并转发的形式发送结果（仅在 QQ 平台下效果最佳）。'),
  logDetails: Schema.boolean().default(false).description('是否在控制台输出详细的调试日志。'),
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('trace-moe')

  ctx.command('以图识番 <message:text>', '根据图片识别动漫番剧')
    .action(async ({ session }, message) => {
      const imgUrl = h.select(message, 'img').map((img) => img.attrs.src)[0]
      if (!imgUrl) return '请在指令后附上需要识别的图片。'
      
      if (config.logDetails) logger.info(`[1/6] 收到搜番指令，提取到图片URL: ${imgUrl}`)
      let placeholderMessageIds: string[]
      try {
        const quote = h('quote', { id: session.messageId })
        placeholderMessageIds = await session.send(h('message', quote, '正在识别中，请稍候...'))

        const apiUrl = new URL('https://api.trace.moe/search');
        apiUrl.searchParams.append('url', imgUrl);
        apiUrl.searchParams.append('anilistInfo', '');
        if (config.cutBorders) apiUrl.searchParams.append('cutBorders', '');
        if (config.logDetails) logger.info(`[2/6] 构造的API请求URL: ${apiUrl.href}`)
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (config.apiKey) headers['x-trace-key'] = config.apiKey;
        const data = await ctx.http.get<{ result: TraceMoeResult[] }>(apiUrl.href, { headers });
        if (config.logDetails) logger.info(`[3/6] 收到 trace.moe API 的原始响应。`)

        if (!data.result || data.result.length === 0) return '未能识别出任何结果。';
        const topResult = data.result[0];
        const similarity = parseFloat((topResult.similarity * 100).toFixed(2));
        if (config.logDetails) logger.info(`[4/6] 解析最高匹配结果。相似度: ${similarity}%, 设定阈值: ${config.minSimilarity}%`)
        if (similarity < config.minSimilarity) return `相似度最高的匹配结果 (${similarity}%) 也低于设定的阈值 (${config.minSimilarity}%)。`;
        
        const { anilist, episode, from } = topResult;

        const finalElements: (h | string)[] = [] // 数组类型是 (h | string)[]

        // 元素 1: 标题，用 <p> 保证它独占一行
        finalElements.push(h('p', '【识别结果】'))

        // 元素 2: 封面图 (如果启用)
        if (config.sendCoverImage && anilist?.coverImage?.large) {
          finalElements.push(h.image(anilist.coverImage.large))
        }

        // 元素 3: 包含所有文字信息的【纯字符串】
        const textLines: string[] = []
        let titleLine = anilist.title.native
        if (config.showRomanjiTitle && anilist.title.romaji && anilist.title.native !== anilist.title.romaji) {
          titleLine += `\n${anilist.title.romaji}`
        }
        textLines.push(`🎬 番剧名称:\n${titleLine}`)
        if (anilist.genres && anilist.genres.length > 0) {
          textLines.push(`🎭 番剧类型: ${anilist.genres.join(' / ')}`)
        }
        if (anilist.startDate?.year) {
          const { year, month, day } = anilist.startDate
          textLines.push(`🗓️ 放送时间: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
        }
        const formatTime = (t: number) => `${Math.floor(t / 60).toString().padStart(2, '0')}:${Math.floor(t % 60).toString().padStart(2, '0')}`
        textLines.push(`🎞️ 集数: ${episode || '未知'}`)
        textLines.push(`⏱️ 场景时间: ${formatTime(from)}`)
        textLines.push(`📈 相似度: ${similarity}%`)
        finalElements.push(textLines.join('\n'))

        // 元素 4: 场景预览 (如果启用)
        if (config.sendScenePreview) {
          const videoUrl = (typeof topResult.video === 'string' && topResult.video.length > 0) ? topResult.video : null
          if (videoUrl) {
            finalElements.push(h.video(videoUrl))
          } else {
            finalElements.push(h.image(topResult.image))
          }
        }
        
        if (config.logDetails) logger.info(`[5/6] 发送方式决策: useForward=${config.useForward && session.platform === 'onebot'}.`)
        
        if (config.useForward && session.platform === 'onebot') {
          return h('figure', {}, finalElements)
        } else {
          return h('message', {}, finalElements)
        }
        
      } catch (error) {
        logger.error('调用 trace.moe API 时发生错误:', error)
        return '识别失败，可能是网络问题或 API 暂时不可用。'
      } finally {
        if (placeholderMessageIds && placeholderMessageIds.length > 0) {
          if (config.logDetails) logger.info(`[6/6] 任务完成，准备删除占位消息。`)
          await session.bot.deleteMessage(session.channelId, placeholderMessageIds[0])
        }
      }
    })
}