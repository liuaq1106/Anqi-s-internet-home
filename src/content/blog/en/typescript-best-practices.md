---
title: "TypeScript Best Practices in 2025"
date: 2025-02-20
category: tech
tags: [TypeScript, JavaScript]
description: "A collection of TypeScript patterns and practices for writing safer, more maintainable code."
---

TypeScript has become the de facto standard for JavaScript development. Here are some best practices I've collected from real-world projects.

## Strict Mode Is Non-Negotiable

Always enable `strict: true` in your `tsconfig.json`. It catches null reference errors, implicit any types, and more.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Prefer Type Over Interface for Primitives

Use `type` for unions, intersections, and primitives. Use `interface` for object shapes that might be extended.

```typescript
type Status = "idle" | "loading" | "success" | "error";

interface User {
  id: string;
  name: string;
}
```

## Use Discriminated Unions

For complex state management, discriminated unions provide compile-time safety:

```typescript
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };
```

## The `satisfies` Operator

Use `satisfies` for type-checking without widening:

```typescript
const config = {
  port: 3000,
  host: "localhost",
} satisfies Record<string, string | number>;
```

## Conclusion

TypeScript continues to evolve. Staying current with its features helps you write safer, more expressive code.
