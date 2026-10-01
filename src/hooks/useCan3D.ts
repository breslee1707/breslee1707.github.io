import { useEffect, useState } from "react";

let verdict: boolean | null = null;

/**
 * Whether this visitor gets the live WebGL scenes. Decided once, client-side:
 * no reduced motion, no Save-Data, and a working WebGL2 context. `?no3d` in
 * the URL forces the static fallback (handy for checking it).
 */
function detect(): boolean {
  if (verdict !== null) return verdict;
  verdict = false;
  try {
    if (new URLSearchParams(window.location.search).has("no3d")) return verdict;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return verdict;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return verdict;
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return verdict;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    verdict = true;
  } catch {
    verdict = false;
  }
  return verdict;
}

/** False on the server and the first client render, so hydration matches. */
export function useCan3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(detect()), []);
  return ok;
}
