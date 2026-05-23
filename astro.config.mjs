import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// GitHub Pages project site: https://liuaq1106.github.io/Anqi-s-internet-home/
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://liuaq1106.github.io',
  base: '/Anqi-s-internet-home/',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
