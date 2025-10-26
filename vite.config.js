import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
   build: {
     outDir: 'dist',
     sourcemap: true,
     minify: false,
     rollupOptions: {
      input: {
        sidepanel: 'src/sidepanel.html',
        background: 'src/background.js'
      },
       output: {
         format: 'es',
         entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'src/background.js' : 'assets/[name]-[hash].js';
        },
       },
      external: ['node:child_process', 'node:fs', 'node:path']
    }
  }
});