// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://francogaggero.github.io',
  base: '/francogaggero-astro',
  server: {
    port: 8080
  },
  vite: {
    plugins: [tailwindcss()]
  }
});