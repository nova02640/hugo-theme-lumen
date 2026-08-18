# Lumen（流明）

> 面向技术写作者的**现代极简、高性能、开箱即用** Hugo 博客主题 —— 内容为王、无感交互、极致性能。

[![Hugo](https://img.shields.io/badge/Hugo-≥0.156-blue?logo=hugo)](https://gohugo.io)
[![License](https://img.shields.io/badge/License-MIT-green)](/LICENSE)
[![JavaScript](https://img.shields.io/badge/JS-13KB%20min-brightgreen)](/assets/js)
[![No Node](https://img.shields.io/badge/Build-Zero%20Dependency-red)](#零依赖构建)

## ✨ 特性

### 标配基础功能（开箱即用）

- 🌗 **明暗双主题**：亮 / 暗 / 自动三态切换，跟随系统设置，内联脚本保证**页面刷新无闪烁**
- 📱 **全响应式布局**：移动端 / 平板 / 桌面三档断点，移动端单列阅读优先
- 🔍 **全文检索**：Fuse.js 客户端搜索，标题 + 正文模糊匹配，毫秒级响应（无 Fuse 时自动降级内置打分器）
- 📑 **智能自动目录**：滚动实时高亮当前章节，可折叠 / 展开，移动端悬浮抽屉入口
- 💻 **高级代码高亮**：Hugo Chroma 原生高亮（150+ 语言），一键复制、行号开关，明暗自适应
- 🔎 **全套 SEO**：OG 标签、Twitter Card、JSON-LD 结构化数据、Sitemap、全文 RSS
- 🧭 **层级面包屑**：首页 / 分类 / 文章三级导航路径
- 📊 **阅读进度条**：顶部超细渐变进度条，实时展示阅读进度
- 📝 **文章数据统计**：字数（千分位）与预估阅读时长（中文基准可配 `readingSpeed`）

### 可选进阶功能（配置开关控制）

| 功能 | 开关 | 说明 |
| ---- | ---- | ---- |
| 多端评论 | `enableComments` | 默认 Giscus，兼容 Waline、Disqus，滚动到可视区域才初始化 |
| 单文加密 | Front Matter `password` | Web Crypto AES-GCM 前端加解密，支持明文或 SHA-256 哈希密码 |
| PWA | `enablePWA` | manifest + Service Worker（SWR 缓存策略）、离线缓存、桌面快捷添加 |
| 高清相册 | `gallery` 短代码 | CSS 瀑布流 + 灯箱预览，键盘方向键翻页 |
| 标准化友链 | `layout: friends` | 统一卡片样式：头像 / 昵称 / 简介 |
| 全站公告 | `params.announcement` | 顶部可关闭公告栏（会话级记忆） |
| 首页双布局 | `homeLayout` | `list` 经典列表 / `card` 杂志卡片（首篇大图置顶 + 网格） |

### 设计亮点

- **精细化中文阅读优化**：`text-spacing-trim` 标点挤压、1.7 行高、720px 舒适行宽、等宽数字
- **低耦合极简架构**：90% 视觉交互依托 CSS，JS 仅做渐进增强，**禁用 JS 亦可完整浏览**
- **零依赖构建**：Hugo Pipes 压缩全部资源，无需 Node.js 构建链
- **轻量化高性能**：核心 JS 13KB（min），CSS 全量内联零阻塞请求，WebP + srcset 响应式图片

## 🚀 快速开始

### 方式一：直接使用示例站

```bash
# 克隆主题后，进入示例站点
cd hugo-theme-lumen/exampleSite
hugo server -D
# 访问 http://localhost:1313
```

### 方式二：接入已有站点

```bash
# 1. 安装主题
git submodule add https://github.com/nova02640/hugo-theme-lumen.git themes/hugo-theme-lumen

# 2. 合并配置（以下为必需项，完整示例见 exampleSite/hugo.toml）
cat >> hugo.toml << 'EOF'
theme = "hugo-theme-lumen"
[markup.highlight]
  noClasses = false
  lineNos = true
[markup.tableOfContents]
  startLevel = 2
  endLevel = 4
[outputs]
  home = ["HTML", "RSS", "searchindex", "manifest", "sw"]
[mediaTypes."application/javascript"]
  suffixes = ["js"]
[mediaTypes."application/manifest+json"]
  suffixes = ["webmanifest"]
[outputFormats.searchindex]
  mediaType = "application/json"
  baseName = "index"
  isPlainText = true
  notAlternative = true
[outputFormats.manifest]
  mediaType = "application/manifest+json"
  baseName = "manifest"
  isPlainText = true
  notAlternative = true
[outputFormats.sw]
  mediaType = "application/javascript"
  baseName = "sw"
  isPlainText = true
  notAlternative = true
EOF

# 3. 创建基础页面
hugo new posts/hello.md
hugo new search.md   # front matter 加 layout: "search"
hugo new friends.md  # front matter 加 layout: "friends"
hugo new archives.md # front matter 加 layout: "archives"
```

## ⚙️ 三级配置体系

1. **主题默认配置**：`theme.toml` 内置最优默认值，开箱即用
2. **站点全局配置**：通过站点 `hugo.toml` 的 `[params]` 覆盖
3. **单文独立配置**：文章 Front Matter 单独控制

### 核心全局配置

```toml
[params]
  # 外观设置
  defaultTheme = "auto"      # auto / light / dark
  showToc = true
  showReadingTime = true
  showWordCount = true
  showBreadcrumb = true
  homeLayout = "card"        # list / card
  readingSpeed = 400         # 中文阅读速度基准（字/分钟）

  # 功能开关
  enableSearch = true
  enablePWA = false
  enableComments = false

  # 社交链接（页脚图标）
  social = [
    { name = "GitHub", url = "https://github.com/you" },
    { name = "Email", url = "mailto:hi@example.com" }
  ]

  # Giscus 评论
  [params.giscus]
    repo = "you/repo"
    repoId = ""
    category = "Announcements"
    categoryId = ""

  # 版权声明
  [params.license]
    enabled = true
    name = "CC BY-NC-SA 4.0"
    url = "https://creativecommons.org/licenses/by-nc-sa/4.0/"

  # 全站公告
  [params.announcement]
    enabled = false
    text = "公告内容"
    url = ""                  # 可选链接
    dismissible = true
```

### 单文 Front Matter

```yaml
---
title: "文章标题"
date: 2026-08-18
categories: ["技术"]
tags: ["Hugo"]
cover: "cover.png"       # 页面资源（自动 WebP + srcset）或静态路径
toc: false               # 覆盖全局目录开关
comments: true           # 覆盖全局评论开关
password: "secret"       # 单文加密：明文或 64 位 SHA-256 哈希
---
```

## 🧩 短代码

| 短代码 | 用法 |
| ---- | ---- |
| 提示框 | `{{</* note type="info\|tip\|warn\|danger" title="标题" */>}}内容{{</* /note */>}}` |
| 图片注释 | `{{</* figure src="x.png" caption="图注" width="1440" lightbox="true" */>}}` |
| 相册 | `{{</* gallery "a.png, b.png" */>}}` 或包裹式多行列表 |

## 📁 目录结构

```
hugo-theme-lumen/
├── archetypes/default.md      # 文章模板（含全部功能注释）
├── assets/
│   ├── css/
│   │   ├── _variables.css     # 设计变量（配色 / 间距 / 圆角 / 阴影）
│   │   ├── _code.css          # Chroma 语法高亮 + 代码块工具条
│   │   └── main.css           # 全局主样式
│   └── js/
│       ├── theme.js           # 主题切换（auto/light/dark）
│       ├── main.js            # 全局交互（进度条 / 目录 / 灯箱 / 评论懒加载…）
│       ├── search.js          # 全文检索（Fuse.js，含降级打分器）
│       ├── encrypt.js         # 单文 AES-GCM 加密
│       └── vendor/fuse.js     # Fuse.js 7（仅搜索页加载）
├── layouts/
│   ├── index.html             # 首页（双布局）
│   ├── _default/
│   │   ├── baseof.html        # 全站骨架
│   │   ├── single.html        # 文章详情页
│   │   ├── list.html          # 栏目 / 分类词条 / 标签词条
│   │   ├── terms.html         # 分类 / 标签聚合页（词云按词频缩放）
│   │   ├── friends.html       # 友链页
│   │   ├── archives.html      # 归档页（年 / 月时间轴）
│   │   ├── search.html        # 专属搜索页
│   │   ├── searchindex.json   # 搜索索引输出格式
│   │   ├── manifest.webmanifest  # PWA 清单输出格式
│   │   ├── sw.js              # Service Worker 输出格式
│   │   ├── rss.xml            # 全文 RSS
│   │   └── _markup/           # Markdown 渲染钩子（标题锚点 / 外链 / 图片）
│   ├── partials/              # 复用组件（header/footer/seo/toc/post-card/…）
│   └── shortcodes/            # note / figure / gallery
├── i18n/                      # zh-CN / en 语言包
├── static/                    # favicon、PWA 图标
└── exampleSite/               # 官方示例站点（含 6 篇演示文章）
```

## ⚠️ 注意事项

- **单文加密是「软门槛」**：明文仍存在于 HTML 源文件中，请勿存放真正敏感的信息
- `crypto.subtle` 仅在 HTTPS / localhost 下可用；不可用时自动降级为 XOR 混淆
- Service Worker 注册路径固定为 `/sw.js`，部署在子路径下需自行调整
- 需要 Hugo **Extended** 版本（图片处理依赖 WebP 编码）

## 🙏 致谢

调研与致敬：PaperMod、Stack、FixIt、Hextra。感谢 Hugo 社区。

## 📄 许可

[MIT](/LICENSE)
