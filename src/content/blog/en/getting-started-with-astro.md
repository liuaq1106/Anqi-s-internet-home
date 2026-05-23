---
title: "Getting Started with Astro"
date: 2025-01-15
category: tech
tags: [Astro, Web Development]
description: "Learn how to build fast, modern websites with the Astro framework."
---

Astro is a modern static site builder that delivers lightning-fast performance. In this post, we'll explore the core concepts and build a simple site from scratch.

## Why Astro?

Astro takes a unique approach to web development: **ship zero JavaScript by default**. Unlike traditional frameworks that send large JS bundles to the client, Astro renders everything to static HTML at build time.

### Key Features

- **Component Islands**: Use React, Vue, Svelte, or plain HTML in the same project
- **Content Collections**: Built-in support for Markdown and MDX
- **Zero JS by default**: Only hydrate interactive components
- **Fast builds**: Optimized build pipeline with Vite

## Setting Up

```bash
npm create astro@latest
```

Choose the "Basics" template to get started quickly.

## Your First Page

Create `src/pages/index.astro`:

```astro
---
const greeting = "Hello, World!";
---
<html>
  <body>
    <h1>{greeting}</h1>
  </body>
</html>
```

## Conclusion

Astro is perfect for content-heavy sites like blogs, documentation, and portfolios. Its zero-JS approach ensures your site stays fast as it grows.
