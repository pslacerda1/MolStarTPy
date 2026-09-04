import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'


export default defineConfig({
    plugins: [
        react(),
    ],
    base: './',
    server: {
        port: 1337,
        open: true,
        sourcemapIgnoreList: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext'
    },
    resolve: {
        conditions: ['browser'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});