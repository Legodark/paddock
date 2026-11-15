import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const deployment = JSON.parse(readFileSync(new URL('../deploy/vercel/vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
// Exercise production document headers in the local preview used by browser tests.
const previewHeaders = Object.fromEntries(deployment.headers.flatMap(rule => rule.headers.map(({ key, value }) => [key, value])));

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:5051' } },
  preview: { headers: previewHeaders, proxy: { '/api': 'http://127.0.0.1:5051' } },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
  build: { sourcemap: false },
});
