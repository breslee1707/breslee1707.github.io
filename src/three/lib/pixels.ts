/** Loads an image; returns it with its RGBA pixels resampled to w×h. */
export async function loadPixels(src: string, w: number, h: number) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return { image: img, data: ctx.getImageData(0, 0, w, h).data };
}
