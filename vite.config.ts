import { fileURLToPath, URL } from 'node:url'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from "vite-svg-loader";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { viteSingleFile } from 'vite-plugin-singlefile'
import packageJson from "./package.json"

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
    cssInjectedByJsPlugin(),
    viteSingleFile(),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  cacheDir: "/tmp/zhuang/cache",
  worker: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        minifyInternalExports: true,
        // entryFileNames: (chunkInfo) => {
        //   // console.log(chunkInfo)
        //   if (chunkInfo.name.includes("shared")) {
        //     console.log(chunkInfo.name);
        //   }
        //   return "worker.js";
        // },
        entryFileNames: "[name].js",
      }
    }
  },
  build: {
    // target: 'es2015',
    outDir: '/tmp/zhuang/dap-web-dist/',
    emptyOutDir: true,
    cssMinify: 'lightningcss',

    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        minifyInternalExports: true,
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
          console.log(assetInfo)
          return `[name]-[hash][extname]`;
        },
        // chunkFileNames: "[name]-[hash].js",
        // chunkFileNames: "[name][hash].js",
        chunkFileNames(chunkInfo) {
          // Check if this chunk is your SharedWorker
          // console.log(chunkInfo)

          // For other chunks, use the default naming scheme
          return 'assets/[name]-[hash].js';
        },
        // entryFileNames: "[name]-[hash].js",
        entryFileNames: (chunkInfo) => {
          // console.log(chunkInfo)
          if (chunkInfo.name.includes("shared")) {
            console.log(chunkInfo.name);
          }
          return "script.js";
        },

        sourcemapFileNames: "map-[name].js",
        // sanitizeFileName: "anit-[name].js",
        // entryFileNames: (chunkInfo) => {
        //   console.log(chunkInfo)
        //   return `${chunkInfo.name}.js`
        // },
        // manualChunks(id) {
        //   /*          if (id.match('.*!/src/.*shared[a-zA-Z0-9-_]*[.](ts|js).*')) {
        //               // Prevent bundling node_modules into common chunks
        //               return 'bundle-shared';
        //             }
        //             else */{
        //     // Prevent bundling node_modules into common chunks
        //     return 'script'
        //   }
        // },
        manualChunks: undefined,
      },
    }
  },
})
