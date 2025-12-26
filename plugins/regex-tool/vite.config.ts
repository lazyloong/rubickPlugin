import { promises as fs } from 'fs';
import path from 'path';

import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import livereload from 'rollup-plugin-livereload';
import { defineConfig, PluginOption } from 'vite';

const isDev = process.argv.includes('-w');

const injectReloadScript = (): PluginOption => ({
  name: 'inject-reload-script',
  apply: 'build', // 只在 build 阶段运行
  transformIndexHtml: isDev
    ? (html) =>
        html.replace(
          '</body>',
          `<!-- auto injected -->
<script>
  (function(){
    const ws = new WebSocket('ws://localhost:35729');
    ws.onmessage = e => { if (JSON.parse(e.data)?.command ==='reload') location.reload() };
  })();
</script>
</body>`,
        )
    : undefined,
});

const copyFiles = (): PluginOption => {
  return {
    name: 'copy-files',
    closeBundle: async () => {
      const filesToCopy = ['preload.js', 'package.json'];
      for (const file of filesToCopy) {
        try {
          await fs.copyFile(
            path.join(__dirname, 'public', file),
            path.join(__dirname, 'dist', file),
          );
        } catch (err) {
          console.error(`Error copying ${file}:`, err);
        }
      }
    },
  };
};

export default defineConfig({
  base: './',
  root: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../../shared'),
    },
  },
  plugins: [
    vue(),
    copyFiles(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    livereload({ watch: 'dist' }) as PluginOption,
    injectReloadScript(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['fs'], // 声明 fs 为外部依赖
      output: {
        entryFileNames: '[name].js', // 入口 → index.js
        chunkFileNames: '[name].js', // 动态 import 产生的 chunk
        assetFileNames: 'assets/[name].[ext]', // css、图片等
      },
    },
  },
});
