import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const deployment = JSON.parse(readFileSync(new URL('../deploy/vercel/vercel.json', import.meta.url), 'utf8')) as {
  routes: { src: string; headers?: Record<string, string>; continue?: boolean }[];
};
// Exercise production document headers in the local preview used by browser tests.
// Stop at the root's terminal route: the later 404 policy must not replace its CSP.
const previewHeaders: Record<string, string> = {};
for (const route of deployment.routes) {
  if (!new RegExp(route.src, 'i').test('/')) continue;
  Object.assign(previewHeaders, route.headers);
  if (!route.continue) break;
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:5051' } },
  preview: { headers: previewHeaders, proxy: { '/api': 'http://127.0.0.1:5051' } },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
  build: { sourcemap: false },
});
