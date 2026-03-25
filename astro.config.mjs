// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://francogaggero.netlify.app',
  server: {
    port: 8080
  },
  integrations: [tailwind(), react()]
});