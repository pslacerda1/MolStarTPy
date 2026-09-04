import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


export default defineConfig({
    plugins: [
        react(),
    ],
    base: '/MolStarTpy/',
    server: {
        port: 1337,
        open: true,
        sourcemapIgnoreList: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext',
        minify: false,
        emptyOutDir: true,
    },
    resolve: {
        conditions: ['browser'],
    },
});