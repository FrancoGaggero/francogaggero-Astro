// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://francogaggero.netlify.app',
  server: {
    port: 8080
  },
  vite: {
    plugins: [tailwindcss()]
  }
});