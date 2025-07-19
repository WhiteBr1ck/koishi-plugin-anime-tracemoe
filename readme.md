# koishi-plugin-anime-tracemoe

[![NPM version](https://img.shields.io/npm/v/koishi-plugin-anime-tracemoe.svg)](https://www.npmjs.com/package/koishi-plugin-anime-tracemoe)
[![License](https://img.shields.io/npm/l/koishi-plugin-anime-tracemoe.svg)](https://www.npmjs.com/package/koishi-plugin-anime-tracemoe)

> 一款用于 Koishi 的以图识番插件，基于 [trace.moe](https://trace.moe) API。

## ✨ 特性

*   **高精度识别**: 利用 `trace.moe` 的强大引擎，精准定位番剧、集数和场景时间。
*   **信息丰富**: 结果中包含番剧封面、多语言标题、类型、放送日期等详细信息。
*   **视频预览**: 直接发送识别出的场景视频预览。
*   **高度可定制**: 提供丰富的配置项，自由控制发送内容，节约流量。
*   **智能发送**: 支持在 QQ 平台下自动切换为体验更佳的合并转发模式。

## 🚀 安装

通过 Koishi 插件市场搜索 `anime-tracemoe` 并安装。

## 📖 使用

启用插件后，在机器人所在的任意聊天中，发送指令并附上图片即可。QQ 平台直接对图片进行引用也可识别。

```
/以图识番 [此处附上图片]
```

机器人将会回复一个包含详细信息的卡片或合并转发消息。

## ⚙️ 配置项


| 配置项 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `apiKey` | （可选，留空则使用默认的 trace.moe API）你的 trace.moe API 密钥，用于提高搜索速率限制。 | `(空)` |
| `minSimilarity` | 最低相似度 (0-100)。只有高于此值的匹配结果才会被显示。 | `87` |
| `cutBorders` | 是否自动裁剪视频黑边，可以提高大多数情况下的识别精度。 | `true` |
| `showRomanjiTitle` | 是否在原生标题旁显示罗马音标题。 | `true` |
| `sendCoverImage` | 是否发送番剧的封面（海报）图。 | `true` |
| `sendScenePreview` | 是否发送识别出的场景预览（视频或截图）。 | `true` |
| `useForward` | 是否使用合并转发的形式发送结果（仅在 QQ 平台下效果最佳）。 | `false` |
| `logDetails` | 是否在控制台输出详细的调试日志，方便反馈问题。 | `false` |

## ⚠️ 免责声明

*   本插件是基于 `trace.moe` 公开 API 开发的第三方工具，仅供学习和技术交流使用。
*   插件的所有识别结果均由 `trace.moe` 提供，开发者不对其内容的准确性、合法性、可用性负责。
*   请用户自觉遵守 `trace.moe` 的相关使用协议。开发者不对因使用本插件而产生的任何直接或间接的损失负责。
*   下载、安装或使用本插件，即表示您同意并接受本免责声明。

## 🙏 鸣谢

*   **[Koishi](https://koishi.chat)** - 插件所依赖的强大、可扩展的机器人框架。
*   **[trace.moe](https://trace.moe) by [soruly](https://github.com/soruly)** - 提供了本插件功能实现的核心 API 服务。
*   特别感谢： Google Gemini 2.5 Pro 。

## ✍️ 作者

**koishi-plugin-anime-tracemoe** © [WhiteBr1ck](https://github.com/WhiteBr1ck), Released under the MIT License.


---
