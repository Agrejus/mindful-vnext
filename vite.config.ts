import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from "@suid/vite-plugin";

export default defineConfig({
  plugins: [suidPlugin(), solidPlugin()],
  server: {
    port: 3000,
  },
  base: './',
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        dir: './electron/app',

      }
    },
    watch: {
      skipWrite: false
    }
  },
});
