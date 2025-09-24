import { promises as fs } from 'fs';
import path from 'path';

import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, PluginOption } from 'vite';

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
      fs: path.resolve(__dirname, '../../shared/fs'),
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
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['fs'], // 声明 fs 为外部依赖
    },
  },
});
