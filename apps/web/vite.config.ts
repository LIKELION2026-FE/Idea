import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  envDir: resolve(__dirname, '../..'),
  plugins: [react()],
});
