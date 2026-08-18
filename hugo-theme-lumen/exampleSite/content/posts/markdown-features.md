+++
title = 'Markdown 基础元素演示'
date = 2026-02-15T10:30:00+08:00
draft = false
description = 'Markdown 各类基础元素在 Lumen 主题下的渲染效果，便于排版校对。'
tags = ['Markdown', '排版']
categories = ['使用文档']
weight = 1
+++

本页用于核对 Markdown 元素渲染细节。

## 文本样式

正文段落；**加粗**；*斜体*；~~删除线~~；`行内代码`；[超链接](https://gohugo.io)。

## 列表

- 无序项 A
- 无序项 B
  - 嵌套项 B1
  - 嵌套项 B2
- 无序项 C

1. 有序项 1
2. 有序项 2
3. 有序项 3

## 引用

> 名言第一句。
>
> 名言第二句。

## 表格

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `id` | int | 主键 |
| `name` | string | 名称 |
| `created_at` | datetime | 创建时间 |

## 代码块（带行号语义）

```python
def fib(n: int) -> int:
    """计算斐波那契数。"""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## 分隔线

---

## 任务清单

- [x] 已完成项
- [ ] 未完成项
- [ ] 另一项

## 数学与脚注

文章支持外接 KaTeX/MathJax，这里仅演示普通段落。

正文可附脚注[^1]。

[^1]: 脚注内容。

正文末尾。
