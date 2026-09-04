import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
    plugins: [
        react(),
    ],
    base: process.env.GITHUB_ACTIONS === 'true'
        ? '/MolStarTPy/'
        : '/',
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
    },
});