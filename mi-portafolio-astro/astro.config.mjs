// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lunaap2.github.io',
  base: process.env.GITHUB_ACTIONS ? '/PortafolioLuna' : '/',
  vite: {
    plugins: [tailwindcss()]
  }
});