import * as THREE from "three";

let ctx: CanvasRenderingContext2D | null = null;

/**
 * Resolves any CSS colour — including oklch() design tokens via var() — to
 * sRGB floats. three.js can't parse oklch, so the browser paints one pixel
 * and we read it back.
 */
export function cssColor(value: string): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.cssText = `display:none;color:${value}`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return [1, 1, 1];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}

/** Same, as a Vector3 for raw (unmanaged, sRGB) shader uniforms. */
export const cssVec3 = (value: string) => new THREE.Vector3(...cssColor(value));

/** Same, as a THREE.Color for built-in (colour-managed) materials. */
export const cssThreeColor = (value: string) =>
  new THREE.Color().setRGB(...cssColor(value), THREE.SRGBColorSpace);

/** Calls back whenever the site theme toggles. Returns the unsubscribe. */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => mo.disconnect();
}

export const isLightTheme = () =>
  document.documentElement.getAttribute("data-theme") === "light";
