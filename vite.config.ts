import { fileURLToPath, URL } from 'node:url'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from "vite-svg-loader";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    svgLoader(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '/tmp/zhuang/dap-web-dist/',
    emptyOutDir: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (!assetInfo || !assetInfo.name) {
            return 'default-filename.ext';
          }
          const info = assetInfo.name.split(".");
          let extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          } else if (/woff|woff2/.test(extType)) {
            extType = "css";
          } else if (/css/.test(extType)) {
            extType = "css";
            return "style.css"
          }
          // return `[name]-[hash][extname]`;
          return `[name][extname]`;
        },
        // chunkFileNames: "[name]-[hash].js",
        chunkFileNames: "[name].js",
        // entryFileNames: "[name]-[hash].js",
        entryFileNames: (chunkInfo) => {
          // console.log(chunkInfo)
          return "script.js"
        },

        sourcemapFileNames: "map-[name].js",
        // sanitizeFileName: "anit-[name].js",
        // entryFileNames: (chunkInfo) => {
        //   console.log(chunkInfo)
        //   return `${chunkInfo.name}.js`
        // },
        manualChunks(id) {
          /*          if (id.match('.*!/src/.*shared[a-zA-Z0-9-_]*[.](ts|js).*')) {
                      // Prevent bundling node_modules into common chunks
                      return 'bundle-shared';
                    }
                    else */{
            // Prevent bundling node_modules into common chunks
            return 'script'
          }
        },
      },
    }
  },
})
