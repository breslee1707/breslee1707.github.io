/**
 * Post-build prerender: injects the server-rendered app into dist/index.html
 * so the deployed page ships full static HTML (then hydrates on the client).
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle):
 *   node scripts/prerender.mjs
 */
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(root, "../dist");
const ssrDir = path.resolve(root, "../dist-ssr");

const { render } = await import(
  new URL("../dist-ssr/entry-server.js", import.meta.url).href
);

const htmlPath = path.join(dist, "index.html");
const template = await readFile(htmlPath, "utf8");

const marker = '<div id="root"></div>';
if (!template.includes(marker)) {
  throw new Error(`prerender: marker ${marker} not found in dist/index.html`);
}

const appHtml = render();
if (!appHtml || appHtml.length < 1000) {
  throw new Error(
    `prerender: rendered HTML suspiciously short (${appHtml.length} chars)`,
  );
}

await writeFile(
  htmlPath,
  template.replace(marker, `<div id="root">${appHtml}</div>`),
  "utf8",
);

// The SSR bundle is only needed at build time.
await rm(ssrDir, { recursive: true, force: true });

console.log(`prerender: injected ${appHtml.length} chars into dist/index.html`);
