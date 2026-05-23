---
title: "Astro 入门指南"
date: 2025-01-15
category: tech
tags: [Astro, Web开发]
description: "学习如何使用 Astro 框架构建快速、现代的网站。"
---

Astro 是一个现代的静态网站构建工具，能够提供极快的性能。本文将带你了解核心概念，并从零开始构建一个简单的网站。

## 为什么选择 Astro？

Astro 采用了独特的 Web 开发方式：**默认不输出 JavaScript**。与传统的将大量 JS 发送到客户端的框架不同，Astro 在构建时将一切渲染为静态 HTML。

### 核心特性

- **组件孤岛**：在同一项目中使用 React、Vue、Svelte 或纯 HTML
- **内容集合**：内置对 Markdown 和 MDX 的支持
- **默认零 JS**：只对交互组件进行水合
- **快速构建**：基于 Vite 优化的构建流程

## 环境搭建

```bash
npm create astro@latest
```

选择 "Basics" 模板快速开始。

## 你的第一个页面

创建 `src/pages/index.astro`：

```astro
---
const greeting = "你好，世界！";
---
<html>
  <body>
    <h1>{greeting}</h1>
  </body>
</html>
```

## 总结

Astro 非常适合博客、文档和个人作品集等内容密集型网站。其零 JS 的方式确保你的网站随着内容增长始终保持快速。
