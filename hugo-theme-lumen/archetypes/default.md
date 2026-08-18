+++
title = '{{ replace .File.Name "-" " " | title }}'
date = '{{ .Date }}      # 发布时间（方案三：头部信息区）'
draft = true
description = ''           # 文章摘要，用于 SEO（方案二：自动生成 OG 标签）
keywords = []
tags = []
categories = []

# 单文独立配置（方案六第 3 条：单文独立配置层级）
[params]
  showToc = true           # 当前页是否显示目录（方案二：智能自动目录）
  showReadingTime = true   # 是否显示阅读时长
  showWordCount = true     # 是否显示字数
  showBreadcrumb = true    # 是否显示面包屑（方案二：层级面包屑）
  showCopyCode = true      # 代码块是否支持一键复制
  cover = ''               # 文章封面图，配合杂志布局使用
  password = ''             # 单文加密保护（方案二进阶功能，前端 AES 解密）
  comment = true            # 是否启用评论
+++

<!-- 内容主体 -->
