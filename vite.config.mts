import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Garante suporte a Buffer e process exigidos pelo Mol*
            include: ['buffer', 'process', 'stream', 'util'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
    resolve: {
        alias: {
            // Ajuste os aliases se o seu código usa caminhos relativos ou absolutos
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 1337,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext', // Suporta WebAssembly top-level await se necessário
    },
    define: {
        // Evita exceções de 'global is not defined'
        global: 'window',
    },
    optimizeDeps: {
        // Evita pré-bundling incorreto das partes pesadas do Mol*
        include: ['molstar', 'fp-ts', 'fp-ts/es6/Either'],
    },
    // Configuração explícita para Web Workers
    worker: {
        format: 'es', // Garante suporte a imports ESM dentro dos Workers
    },
    // 2. Recursos de assets e suporte a WASM
    assetsInclude: ['**/*.wasm', '**/*.py'], // Garante que arquivos .wasm sejam tratados como assets estáticos
});