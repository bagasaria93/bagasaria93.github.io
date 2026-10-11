import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site: served from the domain root, so no `base` is needed.
export default defineConfig({
  site: 'https://bagasaria93.github.io',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
});
