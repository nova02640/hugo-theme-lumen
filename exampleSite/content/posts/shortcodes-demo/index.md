---
title: "短代码三件套：note / figure / gallery 用法指南"
description: "Lumen 内置提示框、图片注释、瀑布流相册三个短代码，本文通过完整示例演示它们的全部用法。"
date: 2026-07-20
categories: ["指南"]
tags: ["短代码", "相册"]
cover: "cover.png"
---

短代码（Shortcode）是 Hugo 的组件化机制：把常用的 HTML 片段封装成易写的标记。Lumen 内置三件套，覆盖写作中的高频场景。

## 提示框 note

四种语义类型，自动适配明暗主题，内容支持任意 Markdown：

```text
{{</* note type="info" title="信息" */>}}
**信息提示**：支持行内代码与 [链接](https://gohugo.io)。
{{</* /note */>}}
```

{{< note type="info" title="信息" >}}
**信息提示**：用于补充说明、背景知识，支持行内代码 `hugo server` 与 [链接](https://gohugo.io)。
{{< /note >}}

{{< note type="tip" title="技巧" >}}
技巧提示：推荐的最佳实践。默认类型就是 tip 之外的 info，不传 `type` 时显示为 info 样式。
{{< /note >}}

{{< note type="warn" title="注意" >}}
注意提示：可能有坑的地方，比如 Hugo 模板中 `{` 与空白裁剪的配合。
{{< /note >}}

{{< note type="danger" >}}
危险提示：`type="danger"` 且省略 `title` 参数，标题行自动隐藏。
{{< /note >}}

## 图片注释 figure

`figure` 会把页面资源自动处理为 **WebP + srcset 响应式**，并支持灯箱：

```text
{{</* figure src="images/g1.png" caption="图 1：生成的渐变示例图" width="800" lightbox="true" */>}}
```

{{< figure src="images/g1.png" caption="图 1：构建期生成的渐变示例图，点击可放大" width="800" lightbox="true" >}}

参数说明：

- `src`：图片路径，优先按页面资源解析（本页 `images/` 目录），找不到则按静态路径处理
- `caption`：图注，支持 Markdown
- `width`：最大输出宽度，超出时自动缩小
- `lightbox="true"`：点击打开灯箱

## 相册 gallery

`gallery` 采用 CSS 多列瀑布流布局，缩略图点击后进入灯箱，支持键盘方向键翻页：

```text
{{</* gallery */>}}
images/g1.png
images/g2.png
images/g3.png
images/g4.png
images/g5.png
images/g6.png
{{</* /gallery */>}}
```

{{< gallery >}}
images/g1.png
images/g2.png
images/g3.png
images/g4.png
images/g5.png
images/g6.png
{{< /gallery >}}

也可以在一行内用逗号分隔：`{{</* gallery "images/g1.png, images/g2.png" */>}}`。

{{< note type="tip" title="灯箱快捷键" >}}
打开灯箱后：<kbd>←</kbd> <kbd>→</kbd> 翻页，<kbd>Esc</kbd> 关闭，点击空白处同样关闭。
{{< /note >}}

## 组合示例

把三个短代码组合起来，就是一篇图文并茂的游记骨架：

{{< note type="info" >}}
先放一张大图定调，再挂相册，中间用 note 插入碎碎念，最后 figure 收尾——这是 Lumen 示例站最常用的图文模板。
{{< /note >}}

{{< figure src="images/g6.png" caption="图 2：竖构图同样适配瀑布流" width="700" >}}
