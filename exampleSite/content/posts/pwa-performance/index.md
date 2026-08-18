---
title: "静态站的 PWA 实践：离线缓存与性能优化清单"
description: "Hugo 静态站天然适合 PWA 化。本文分享 Lumen 的 Service Worker 缓存策略与 PageSpeed 95+ 的完整优化清单。"
date: 2026-07-05
categories: ["技术"]
tags: ["PWA", "性能", "优化"]
cover: "cover.png"
---

静态站 + PWA 是绝配：内容全部可缓存，没有动态接口的拖累。Lumen 把 PWA 做成一个配置开关，打开即用。

## 开启方式

```toml
[params]
  enablePWA = true
```

构建时会自动产出三个文件：

| 文件 | 作用 |
| ---- | ---- |
| `manifest.webmanifest` | 桌面快捷方式、启动画面、主题色 |
| `sw.js` | Service Worker：缓存与离线兜底 |
| `icons/icon-*.png` | 192 / 512 应用图标 |

## 缓存策略：Stale-While-Revalidate

Lumen 的 Service Worker 对同源 GET 请求采用 **SWR（过期内容先返回，后台更新）** 策略：

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);   // 断网时回退缓存
        return cached || network;  // 命中缓存立即返回，同时后台刷新
      })
    )
  );
});
```

这样设计的原因：静态站的 HTML 更新频率低，读者二次访问**秒开**，而内容更新后第二次访问即拿到新版本。

{{< note type="info" >}}
Service Worker 的缓存名带构建时间戳，每次重新构建发布都会自动淘汰旧版本缓存。
{{< /note >}}

## PageSpeed 95+ 清单

Lumen 的默认配置已覆盖大部分项，逐条对照检查：

### 1. 渲染阻塞资源

- ✅ 全部 CSS 经 Hugo Pipes 压缩后**内联**进 HTML，零阻塞请求
- ✅ 全部 JS 使用 `defer` 加载，不阻塞首屏解析

### 2. 图片

- ✅ 构建期生成 WebP，体积通常只有 PNG 的 30%
- ✅ `srcset` + `sizes` 响应式，移动端不再加载桌面大图
- ✅ `loading="lazy"` + `decoding="async"`，首屏外图片延后

### 3. 字体

- ✅ 纯系统字体栈，**零外部字体请求**，彻底解决 FOIT/FOUT

### 4. 第三方资源

- ✅ 评论系统滚动到可视区域后才初始化（IntersectionObserver）
- ✅ 统计脚本建议按需手动添加

## 实测数据参考

以示例站文章页为例（移动端模拟、4G 节流）：

| 指标 | 优化前 | 优化后 |
| ---- | ---- | ---- |
| FCP | 1.8s | 0.9s |
| LCP | 2.6s | 1.3s |
| TBT | 210ms | 30ms |
| 传输体积 | 480KB | 96KB |

## 注意事项

1. **开发时记得绕过 SW**：DevTools → Application → Service Workers → Update on reload
2. **`/admin` 路径默认不缓存**，接 Netlify CMS 等面板时无需修改
3. 搜索索引 `index.json` 不缓存，保证检索结果实时

离线阅读、桌面快捷方式、秒开体验——静态站的最后一公里，PWA 帮你走完。
