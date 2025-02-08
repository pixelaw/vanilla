import path from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {viteEnvs} from 'vite-envs'
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    logLevel: "info",
    plugins: [
        react(),
        wasm(),
        topLevelAwait(),
        viteEnvs({
            declarationFile: ".env.example"
        })

    ],
    resolve: {
        alias: {
            "@pixelaw/core": path.resolve(__dirname, 'pixelaw.js/packages/core/src'),
            "@pixelaw/core-dojo": path.resolve(__dirname, "pixelaw.js/packages/core-dojo/src"),
            "@pixelaw/core-mud": path.resolve(__dirname, "pixelaw.js/packages/core-mud/src"),
            "@pixelaw/react": path.resolve(__dirname, "pixelaw.js/packages/react/src"),
            "@pixelaw/react-dojo": path.resolve(__dirname, "pixelaw.js/packages/react-dojo/src"),
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target:"esnext",        // FIXME this seems to fix the mysterious "index.html not found" error in vite build
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },

        }
    },
    server: {
        fs: {
            allow: [
                path.resolve(__dirname, 'pixelaw.js/packages/core-dojo/dist'),
                path.resolve(__dirname, 'pixelaw.js/packages/core-dojo/src'),
                path.resolve(__dirname, './'),
            ],
        },
    },
});

