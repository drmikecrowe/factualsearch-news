import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  site: 'https://factualsearch.news',
  output: 'static',
  integrations: [
    svelte(),
    sitemap()
  ],
  vite: {
    plugins: [
      tailwindcss(),
      visualizer({
        emitFile: false,
        filename: join(__dirname, 'stats.html'),
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    ]
  }
});
