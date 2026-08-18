---
title: "中文排版实战：用现代 CSS 打磨阅读体验"
description: "从标点挤压、行高节奏到中英混排，梳理一套可落地的中文 Web 排版方案，并解释 Lumen 主题做了哪些针对性的优化。"
date: 2026-07-28
categories: ["设计"]
tags: ["CSS", "排版", "中文"]
cover: "cover.png"
---

中文 Web 排版长期是被忽视的领域：西文排版工具链成熟，而中文特有的标点、字距、混排问题，往往只能靠「感觉」调。本文梳理一套可复用的方案。

## 为什么中文更难排

中文是方块字，没有西文的 x-height 与小写字母节奏，因此：

- 行长对阅读舒适度的影响更敏感
- 标点占格导致视觉上的「空洞」
- 中英混排时基线对齐与间距需要额外处理

Lumen 主题的方案是：**720px 版心 + 1.7 行高 + 系统字体栈**，先保证骨架正确，再做细节。

## 标点挤压

标点挤压（punctuation compression）指的是压缩标点两侧的留白。传统做法依赖字体本身的 OpenType 特性（如 `halt` / `vhal`），Web 侧直到最近才有了原生能力：

```css
.article-content p {
  /* Chrome 123+ 支持，其他浏览器自动忽略（渐进增强） */
  text-spacing-trim: trim-auto;
}
```

`text-spacing-trim: trim-auto` 会自动修剪：

- 行首的全角开括号
- 连续标点之间的空隙
- 句号、逗号等收尾标点的右侧空间

{{< note type="info" title="兼容性" >}}
截至 2026 年，`text-spacing-trim` 已在 Chromium 系浏览器全面落地。对不支持的浏览器，行首悬挂标点可用 `hanging-punctuation` 兜底。
{{< /note >}}

## 行高与段落节奏

中文正文的舒适行高在 **1.6–1.8** 之间。Lumen 取 1.7，并在 8px 基线网格上安排段落间距：

```css
.article-content p { margin-bottom: 16px; }   /* 一档基线 */
.article-content h2 { margin: 64px 0 16px; }  /* 标题前留足呼吸感 */
.article-content h3 { margin: 32px 0 12px; }
```

标题前的留白**大于**标题后的留白，符合格式塔的接近性原则：标题与下文绑定，与上文分离。

## 中英混排间距

理想状态是中文与拉丁字符之间自动插入 1/4 em 空隙。目前 CSS 尚无跨浏览器方案，两个务实选择：

1. **依赖字体**：思源黑体 / Noto Sans SC 自带混排间距优化
2. **写作时处理**：在 Markdown 源文中手动加空格（如本文）

如果希望更激进，可以用极轻量的脚本做后处理——但 Lumen 的选择是**不做**：为 1px 的视觉增益引入运行时成本，违背「无感交互」原则。

## 数字与等宽特性

统计数字、日期、代码片段混排时，开启等宽数字能显著提升对齐感：

```css
.post-meta time,
.archive-item time {
  font-variant-numeric: tabular-nums;
}
```

配合 `font-feature-settings` 可以进一步控制旧式数字、分数等 OpenType 特性。

## 文本排版新特性清单

| 特性 | 作用 | 浏览器支持 |
| ---- | ---- | ---- |
| `text-wrap: balance` | 标题折行平衡 | 现代浏览器全支持 |
| `text-wrap: pretty` | 段落避免孤字成行 | Chromium 系 |
| `text-spacing-trim` | 中文标点挤压 | Chromium 123+ |
| `hyphens: auto` | 西文长词断词 | 需配合 `lang` 属性 |
| `letter-spacing` 负值 | 大标题收紧字距 | 全支持 |

## 结语

排版是「看不见的设计」：做对了读者无感，做错了读者留不下来。中文排版不需要奇技淫巧，把行高、行长、留白三件事做对，就已经超过 90% 的博客了。
