import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export function filterPosts(
  posts: Post[],
  options: { category?: string; tag?: string; sort?: string }
): Post[] {
  let result = [...posts];

  // Filter out drafts
  result = result.filter((p) => !p.data.draft);

  // Category filter
  if (options.category && options.category !== 'all') {
    result = result.filter((p) => p.data.category === options.category);
  }

  // Tag filter
  if (options.tag) {
    result = result.filter((p) => p.data.tags?.includes(options.tag!));
  }

  // Sort by date
  result.sort((a, b) => {
    const da = new Date(a.data.date).getTime();
    const db = new Date(b.data.date).getTime();
    return options.sort === 'asc' ? da - db : db - da;
  });

  return result;
}

export function getAllCategories(posts: Post[]): string[] {
  const cats = new Set(posts.filter((p) => !p.data.draft).map((p) => p.data.category));
  return [...cats];
}

export function getAllTags(posts: Post[]): string[] {
  const tags = new Set(
    posts.filter((p) => !p.data.draft).flatMap((p) => p.data.tags || [])
  );
  return [...tags];
}

export function formatDate(date: Date, lang: 'en' | 'zh'): string {
  if (lang === 'zh') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
