const BASE = import.meta.env.BASE_URL || '/';

export function localePath(locale: string, path?: string): string {
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
  return `${BASE}${locale}${p}`;
}

export function homePath(locale: string): string {
  return localePath(locale);
}

export function blogPostPath(locale: string, slug: string): string {
  return localePath(locale, `/blog/${slug}`);
}
