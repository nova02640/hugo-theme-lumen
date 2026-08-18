---
title: "给你的文章加把锁：客户端 AES 加密实战"
description: "无需任何后端，利用 Web Crypto API 在浏览器内完成 AES-GCM 加密，实现单篇文章的密码保护。本文密码：lumen"
date: 2026-07-12
categories: ["安全"]
tags: ["加密", "JavaScript"]
cover: "cover.png"
password: "lumen"
toc: false
---

恭喜解锁！本文演示 Lumen 的**单文加密**能力：文章正文在页面加载后立即被 AES-GCM 加密，只有输入正确密码才能阅读。

{{< note type="warn" title="安全边界" >}}
客户端加密是「软门槛」：明文仍然存在于 HTML 源文件中（搜索引擎也能索引）。它适合挡住普通读者，**不适合**存放真正的敏感信息。
{{< /note >}}

## 如何给你的文章上锁

在文章 Front Matter 中添加一行即可：

```yaml
---
title: "我的加密文章"
password: "your-password"
---
```

或者填写密码的 SHA-256 哈希（64 位小写十六进制），避免明文出现在源码中：

```yaml
password: "5c48b9e9..."  # echo -n "your-password" | sha256sum
```

## 工作原理

1. **页面加载**：脚本立即取出正文 HTML，用密码哈希派生的密钥加密（AES-GCM，随机 IV）
2. **渲染锁屏**：正文替换为密码输入框
3. **解锁校验**：对输入做 SHA-256，与目标哈希比对
4. **无感解密**：校验通过后解密注入正文，本次会话内刷新页面无需再次输入

密钥派生与加密全部在浏览器本地完成，**密码永远不会发送到服务器**。

## 核心代码片段

```js
// 用密码哈希派生 AES 密钥
const keyHex = await sha256Hex(password);
const key = await crypto.subtle.importKey(
  "raw", hexToBuf(keyHex), { name: "AES-GCM" }, false,
  ["encrypt", "decrypt"]
);

// AES-GCM 加密，随机 IV 保证同文不同密
const iv = crypto.getRandomValues(new Uint8Array(12));
const cipher = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, new TextEncoder().encode(html)
);
```

{{< note type="tip" >}}
`crypto.subtle` 只在 HTTPS 或 localhost 环境可用。Lumen 在不可用时自动降级为 XOR 混淆，保证功能不断链，但安全性相应降低。
{{< /note >}}

## 与真正的私密内容方案对比

| 方案 | 防护强度 | 依赖 | 适用场景 |
| ---- | ---- | ---- | ---- |
| Lumen 单文加密 | 挡住普通访客 | 无 | 连载小说、付费预告 |
| 双因素静态托管（如 Cloudflare Access） | 高 | 第三方平台 | 内部文档 |
| 服务端鉴权 | 高 | 自有后端 | 会员内容 |

## 小结

一个 300 行的加密模块，换来了 Hugo 静态站上难得的「仪式感」。技术本身不复杂，复杂的是想清楚：你要防的是谁？
