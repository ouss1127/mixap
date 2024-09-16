import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';
//ELSINT
//import checker from 'vite-plugin-checker'
import svgr from "vite-plugin-svgr";
import tsconfigPaths from 'vite-tsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import commonjs from '@rollup/plugin-commonjs';
// MIX-15
// import styleImport from "vite-plugin-style-import";
//
import vitePluginRequire from "vite-plugin-require";


export default defineConfig({
    resolve: { alias: { '@': '/src' } },
    base: './',
    publicDir: 'public',
    build: {
        outDir: 'build',
        minify:true,
        sourcemap:false,
    },
    plugins: [
        //commonjs(),
        nodePolyfills(),
        react(),
        //vue(),
        vitePluginRequire({ fileRegex:/(.jsx?|.tsx?|.vue)$/ }),
        viteTsconfigPaths(),
        basicSsl(),
        svgr(),
        tsconfigPaths(),
        /*VitePWA({
            srcDir: 'src',
            filename: 'service-worker.ts',
            workbox: { 
                swDest: "./public/service-worker.js"
            },
        }),*/
        /* MIX-15 - Plugin : surcharge antdesign varaibles
        styleImport({
            libs: [
                {
                    libraryName: 'antd',
                    esModule: true,
                    resolveStyle: (name) => `antd/es/${name}/style/index.js`,
                },
            ],
        }),
        */
        //Enable ESLINT
        // checker({
        //     typescript: true,
        //     overlay: false,
        //     eslint: {
        //         dev :{logLevel: ['error', 'warning']},
        //         lintCommand: 'eslint "src/**/*.{ts,tsx}"'
        //     }
        // })
    ],
    // css: {
    //     preprocessorOptions: {
    //         less: {
    //             modifyVars: {
    //                 '@primary-color':'#1DA57A',
    //                 '@link-color':'red',
    //                 //Boutons
    //                 '@btn-default-bg':'red',
    //             },
    //             javascriptEnabled: true,
    //         }
    //     }
    // },
    server: {
        host: '0.0.0.0',
        // this ensures that the browser opens upon server start
        open: false,
        // this sets a default port to 3000  
        port: 3000,
        https: true
    },
})