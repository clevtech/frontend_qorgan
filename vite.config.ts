import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                math: 'always',
                relativeUrls: true,
                modifyVars: {
                    '@primary-color': '#0070C0',
                    '@border-radius-base': '1rem',
                    '@font-size-base': '14px',
                    '@link-color': '#0070C0',
                    '@success-color': '#52c41a',
                    '@error-color': '#ff4d4f',
                    '@warning-color': '#faad14',
                },
            },
        },
    },
    build: {
        outDir: 'dist',
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        host: true,
    },
});
