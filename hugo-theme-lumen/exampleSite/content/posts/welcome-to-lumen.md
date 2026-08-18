+++
title = '欢迎来到 Lumen 主题示例站'
date = 2026-01-01T09:00:00+08:00
draft = false
description = '一篇示例文章：演示 Lumen 主题的目录、代码块、提示框与图片注释等核心功能。'
keywords = ['Lumen', '示例', '功能演示']
tags = ['公告', '主题']
categories = ['主题介绍']
cover = '/images/welcome-cover.svg'

[params]
  showToc = true
  showReadingTime = true
  comment = true
+++

> **Lumen（流明）** 是面向技术写作者的极简、高性能、开箱即用 Hugo 博客主题。本站即为示例站点。

本文档演示 Lumen 主题的常用功能，方便你快速上手。所有功能均按方案设计实现，无需额外构建链。

## 一、视觉与排版

正文以 720px 居中窄屏呈现，行高 1.7，配合 8px 基线网格、单层柔和阴影、统一 8-12px 圆角，兼顾简约质感与专业调性。中英文混排间距经专属优化，避免拥挤。

字体使用系统原生字体栈，无外部字体请求，彻底消除 FOIT / FOUT 文字闪烁。

## 二、智能自动目录

右侧侧栏自动同步本文层级（方案二·智能自动目录）：

- 滚动实时高亮当前章节
- 支持折叠 / 展开
- 移动端以悬浮入口呈现

## 三、高级代码高亮

基于 Hugo Chroma 原生高亮，支持 150+ 编程语言、行号开关与一键复制：

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Lumen!")
}
```

```bash
hugo server -D --bind=0.0.0.0
```

代码块右上角的「复制」按钮（方案二·高级代码高亮）由 `main.js` 渐进增强，无 JS 环境下仍可正常浏览。

## 四、提示框短代码

{{< note type="info" title="提示" >}}使用 `note` 短代码即可生成此提示框，支持 info / warning / error / success 四种语义。{{< /note >}}

{{< note type="warning" title="注意" >}}深色模式下提示框颜色自动切换，无需任何配置。{{< /note >}}

{{< note type="success" title="成功" >}}开箱即用，零依赖构建。{{< /note >}}

## 五、图片注释短代码

{{< figure src="/images/welcome-cover.svg" alt="Lumen 主题封面" caption="Lumen 主题封面示意（SVG 占位图）" >}}

## 六、明暗双主题

顶部右侧主题切换按钮支持三态循环（方案二·明暗双主题）：

1. `auto`：跟随系统设置
2. `light`：强制浅色（米白底 + 深灰字）
3. `dark`：强制深色（深灰底 + 浅白字）

页面刷新通过内联防闪烁脚本保持状态无跳变。

## 七、性能与无障碍

- 整体 JS 体积 < 20KB（方案一·脚本策略）
- 90% 视觉交互依托 CSS 实现（方案七·低耦合极简架构）
- 遵循 WCAG 2.1 色彩对比度，支持全键盘导航
- 阅读进度条实时展示全文进度（顶部超细进度条）

更多细节参见仓库根目录的 `hugo-Lumen-设计方案.md`。
