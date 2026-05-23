import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// GitHub Pages user site: https://liuaq1106.github.io
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://liuaq1106.github.io',
  base: '/',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
