// https://github.com/vitejs/vite/discussions/3448
// import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import { copyFileSync } from 'fs';
// import { visualizer } from 'rollup-plugin-visualizer';

// ----------------------------------------------------------------------

export default defineConfig({
  // build: {
  //   sourcemap: true
  // },
  plugins: [
    react(),
    jsconfigPaths(),
    {
      name: 'copy-headers',
      writeBundle() {
        copyFileSync('_headers', 'dist/_headers');
      }
    }
    // visualizer()
  ],
  // https://github.com/jpuri/react-draft-wysiwyg/issues/1317
  base: '/',
  define: {
    global: 'window'
  },
  resolve: {
    // alias: [
    //   {
    //     find: /^~(.+)/,
    //     replacement: path.join(process.cwd(), 'node_modules/$1')
    //   },
    //   {
    //     find: /^src(.+)/,
    //     replacement: path.join(process.cwd(), 'src/$1')
    //   }
    // ]
  },
  server: {
    host: true,
    // this ensures that the browser opens upon server start
    open: false,
    // this sets a default port to 3000
    port: 3001
  },
  preview: {
    // this ensures that the browser opens upon preview start
    open: true,
    // this sets a default port to 3000
    port: 3001
  }
});
