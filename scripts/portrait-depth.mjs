/**
 * One-off generator for public/assets/portrait-depth.webp — the depth map the
 * hero point cloud uses to give the portrait real relief.
 *
 * No depth model is fetched: MediaPipe's multiclass selfie segmenter splits
 * the photo into hair / face / body / clothes / background, and those layers
 * are composed into a stylised depth field (face nearest, wall farthest),
 * "inflated" away from the silhouette edge and given a little luminance relief.
 *
 * Run from the repo root (tools are not project dependencies):
 *   npm i --no-save @mediapipe/tasks-vision playwright
 *   node scripts/portrait-depth.mjs
 * Set CHROMIUM_PATH to use a preinstalled Chromium instead of Playwright's.
 */
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/assets/portrait-depth.webp");
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

// Output size — finer than the densest point grid the hero samples (240×321).
const W = 360;
const H = 482;

const PAGE = /* html */ `<!doctype html><meta charset="utf-8"><body><script type="module">
import { FilesetResolver, ImageSegmenter } from "/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs";
const W = ${W}, H = ${H};
const img = new Image();
img.src = "/public/assets/portrait.jpg";
await img.decode();

const vision = await FilesetResolver.forVisionTasks("/node_modules/@mediapipe/tasks-vision/wasm");
const seg = await ImageSegmenter.createFromOptions(vision, {
  baseOptions: { modelAssetPath: "/model.tflite" },
  runningMode: "IMAGE",
  outputCategoryMask: false,
  outputConfidenceMasks: true,
});
const res = seg.segment(img);
// Confidence masks: 0 background, 1 hair, 2 body-skin, 3 face-skin, 4 clothes, 5 others.
const masks = res.confidenceMasks.map((m) => ({ w: m.width, h: m.height, d: m.getAsFloat32Array() }));

const canvas = (w = W, h = H) => Object.assign(document.createElement("canvas"), { width: w, height: h });
const sample = (m, u, v) => m.d[Math.min(m.h - 1, (v * m.h) | 0) * m.w + Math.min(m.w - 1, (u * m.w) | 0)];

// Photo luminance at output resolution (for micro relief + the fern heuristic).
const photo = canvas();
const pctx = photo.getContext("2d");
pctx.drawImage(img, 0, 0, W, H);
const rgb = pctx.getImageData(0, 0, W, H).data;

// 1) Layered depth from the class confidences.
const LAYER = [0.0, 0.66, 0.74, 0.8, 0.6, 0.6];
const base = new Float32Array(W * H);
const person = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = (x + 0.5) / W, v = (y + 0.5) / H;
    let sum = 0, z = 0, fg = 0;
    for (let c = 0; c < masks.length; c++) {
      const p = sample(masks[c], u, v);
      sum += p;
      z += p * LAYER[c];
      if (c > 0) fg += p;
    }
    const i = y * W + x;
    person[i] = fg / Math.max(sum, 1e-6);
    // Background: the ochre wall, gently receding toward the inside corner
    // (left of frame), with the lower steps a touch nearer.
    const wall = 0.16 + 0.06 * Math.max(0, u - 0.35) + 0.08 * Math.max(0, v - 0.7);
    base[i] = z / Math.max(sum, 1e-6) + (1 - person[i]) * wall;
    // Blurred fern in the bottom-left foreground sits closest to the lens.
    const r = rgb[i * 4], g = rgb[i * 4 + 1], b = rgb[i * 4 + 2];
    if (u < 0.5 && v > 0.8 && g > r * 1.04 && g > b * 1.15) {
      const k = Math.min(1, (v - 0.8) / 0.08) * Math.min(1, (0.5 - u) / 0.1);
      base[i] = Math.max(base[i], 0.92 * k + base[i] * (1 - k));
    }
  }
}

// 2) Blur helpers via canvas filters.
const toCanvas = (arr) => {
  const c = canvas();
  const ctx = c.getContext("2d");
  const im = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const g = Math.max(0, Math.min(255, Math.round(arr[i] * 255)));
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = g;
    im.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  return c;
};
const blur = (arr, px) => {
  const src = toCanvas(arr);
  const c = canvas();
  const ctx = c.getContext("2d");
  ctx.filter = "blur(" + px + "px)";
  ctx.drawImage(src, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data;
  const out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = d[i * 4] / 255;
  return out;
};

// 3) Inflate the figure away from its outline so it reads as a volume.
const soft = blur(person, 14);
const smooth = blur(base, 2.5);
const depth = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const inflate = Math.max(0, (soft[i] - 0.5) * 2); // 0 at the edge → 1 deep inside
  const lum = (0.2126 * rgb[i * 4] + 0.7152 * rgb[i * 4 + 1] + 0.0722 * rgb[i * 4 + 2]) / 255;
  depth[i] = smooth[i] + person[i] * 0.12 * Math.sqrt(inflate) + (lum - 0.5) * 0.05;
}

window.__result = toCanvas(depth).toDataURL("image/webp", 0.9);
</script>`;

const model = Buffer.from(await (await fetch(MODEL_URL)).arrayBuffer());
const TYPES = { ".mjs": "text/javascript", ".js": "text/javascript", ".wasm": "application/wasm", ".jpg": "image/jpeg" };

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  try {
    if (url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(PAGE);
    if (url === "/model.tflite") return res.writeHead(200).end(model);
    const file = path.join(ROOT, url);
    if (!file.startsWith(ROOT)) throw new Error("outside root");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("page:", e.message));
await page.goto(`http://localhost:${port}/`);
const dataUrl = await page.waitForFunction(() => window.__result, null, { timeout: 120_000 });
const bytes = Buffer.from((await dataUrl.jsonValue()).split(",")[1], "base64");
await writeFile(OUT, bytes);
await browser.close();
server.close();
console.log(`portrait-depth: wrote ${path.relative(ROOT, OUT)} (${W}×${H}, ${bytes.length} bytes)`);
