import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        accent: {
          50: '#f5f6f6',
          100: '#e6e7e8',
          200: '#d0d2d3',
          300: '#afb2b5',
          400: '#868b8f',
          500: '#6b7175',
          600: '#5b6064',
          700: '#4e5155',
          800: '#44474a',
          900: '#3c3e40',
          950: '#252628',
        },
      },
    },
  },
  plugins: [typography],
};
