import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react()], server: { proxy: { '/api': env.VITE_PROXY_TARGET || 'http://localhost:5000' } } };
});
