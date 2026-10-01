import * as THREE from "three";

/**
 * Shared drawing kit for the Work exhibits: a technical-drawing language of
 * hairlines, hollow nodes and a fading drafting floor, in the site's tokens.
 */

export type Palette = {
  ink: THREE.Color;
  faint: THREE.Color;
  line: THREE.Color;
  accent: THREE.Color;
  bg: THREE.Color;
};

export type FrameCtx = {
  dt: number;
  /** Pointer over the stage in NDC (−1…1), or null when it's elsewhere. */
  pointer: THREE.Vector2 | null;
};

/**
 * Pixels per world unit at distance 1 — shared by every point material so
 * node sizes are set in world units. The stage updates it on resize.
 */
export const pointScale = { value: 600 };

export interface Exhibit {
  readonly group: THREE.Group;
  /** How the stage camera frames this exhibit (angles in radians). */
  readonly frame: { target: number; distance: number; elevation?: number; azimuth?: number };
  /** 0…1 — draws the exhibit in or out. */
  setPresence(v: number): void;
  update(ctx: FrameCtx): void;
  setPalette(p: Palette): void;
  dispose(): void;
}

// ---------------------------------------------------------------- materials

const dotVertex = /* glsl */ `
uniform float uSize;
uniform float uPointScale;
attribute float aHot;
attribute float aSize;
varying float vHot;
void main() {
  vHot = aHot;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aSize * uPointScale / -mv.z;
}
`;

// Hollow node: a stroked ring filled with the page colour; "hot" nodes fill
// with the accent. Mirrors the 2D motifs, where nodes punch through edges.
const dotFragment = /* glsl */ `
uniform vec3 uStroke;
uniform vec3 uFill;
uniform vec3 uAccent;
uniform float uOpacity;
varying float vHot;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float ring = smoothstep(0.27, 0.33, r);
  vec3 stroke = mix(uStroke, uAccent, vHot);
  vec3 fill = mix(uFill, uAccent, vHot);
  float a = (1.0 - smoothstep(0.46, 0.5, r)) * uOpacity;
  gl_FragColor = vec4(mix(fill, stroke, ring), a);
  #include <colorspace_fragment>
}
`;

const fadeVertex = /* glsl */ `
varying vec2 vXZ;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vXZ = w.xz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const fadeFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uRadius;
varying vec2 vXZ;
void main() {
  float d = length(vXZ);
  float a = (1.0 - smoothstep(uRadius * 0.35, uRadius, d)) * uOpacity;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

/**
 * The material set owned by one exhibit, so each can fade on its own.
 * Palette colours are THREE.Colors made from the CSS tokens (linear working
 * space); every material converts back to sRGB on output, tone mapping off.
 */
export class Inks {
  readonly faint = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false });
  readonly line = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false });
  readonly accent = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false });
  readonly ink = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false });
  readonly fill = new THREE.MeshBasicMaterial({
    transparent: true,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  readonly accentFill = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false });
  readonly dots = new THREE.ShaderMaterial({
    vertexShader: dotVertex,
    fragmentShader: dotFragment,
    transparent: true,
    uniforms: {
      uSize: { value: 0.07 },
      uPointScale: pointScale,
      uStroke: { value: new THREE.Color() },
      uFill: { value: new THREE.Color() },
      uAccent: { value: new THREE.Color() },
      uOpacity: { value: 1 },
    },
  });
  readonly floor = new THREE.ShaderMaterial({
    vertexShader: fadeVertex,
    fragmentShader: fadeFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 1 },
      uRadius: { value: 4 },
    },
  });
  /** Resting opacity of each material; presence scales these. */
  private readonly base = new Map<THREE.Material, number>([
    [this.faint, 1],
    [this.line, 1],
    [this.accent, 1],
    [this.ink, 1],
    [this.fill, 1],
    [this.accentFill, 1],
    [this.dots, 1],
    [this.floor, 0.9],
  ]);

  setPalette(p: Palette) {
    const raw = (m: { color: THREE.Color }, c: THREE.Color) => m.color.copy(c);
    raw(this.faint, p.faint);
    raw(this.line, p.line);
    raw(this.accent, p.accent);
    raw(this.ink, p.ink);
    raw(this.fill, p.bg);
    raw(this.accentFill, p.accent);
    this.dots.uniforms.uStroke.value.copy(p.ink);
    this.dots.uniforms.uFill.value.copy(p.bg);
    this.dots.uniforms.uAccent.value.copy(p.accent);
    this.floor.uniforms.uColor.value.copy(p.line);
  }

  /** Base opacity for a material (e.g. a fainter accent). */
  setBase(m: THREE.Material, opacity: number) {
    this.base.set(m, opacity);
  }

  setPresence(v: number) {
    for (const [m, o] of this.base) {
      if (m instanceof THREE.ShaderMaterial) m.uniforms.uOpacity.value = o * v;
      else m.opacity = o * v;
    }
  }

  /** Extra materials an exhibit creates get registered for fading. */
  track<M extends THREE.Material>(m: M, opacity = 1): M {
    m.transparent = true;
    this.base.set(m, opacity);
    return m;
  }

  dispose() {
    for (const m of this.base.keys()) m.dispose();
  }
}

// ---------------------------------------------------------------- geometry

/** LineSegments from a flat [x,y,z, x,y,z, …] list of segment endpoints. */
export function segments(flat: number[], material: THREE.Material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(flat, 3));
  return new THREE.LineSegments(g, material);
}

/** A polyline circle in the XZ plane at height y, as segment pairs. */
export function circleSegs(r: number, y = 0, n = 64, cx = 0, cz = 0): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    out.push(cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r, cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r);
  }
  return out;
}

/** Edges of a box as LineSegments (plus an occluding fill when given). */
export function wireBox(
  w: number,
  h: number,
  d: number,
  line: THREE.Material,
  fill?: THREE.Material,
) {
  const box = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), line);
  if (!fill) {
    box.dispose();
    return edges;
  }
  const mesh = new THREE.Mesh(box, fill);
  mesh.add(edges);
  return mesh;
}

/** The drafting floor: a square grid that fades out radially. */
export function floorGrid(material: THREE.ShaderMaterial, half = 4, step = 0.5) {
  const flat: number[] = [];
  for (let x = -half; x <= half + 1e-6; x += step) flat.push(x, 0, -half, x, 0, half);
  for (let z = -half; z <= half + 1e-6; z += step) flat.push(-half, 0, z, half, 0, z);
  material.uniforms.uRadius.value = half;
  return segments(flat, material);
}

/** Node sprites; hot (0–1) and size multipliers are per point. */
export function dots(positions: number[], material: THREE.ShaderMaterial, sizes?: number[]) {
  const n = positions.length / 3;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("aHot", new THREE.Float32BufferAttribute(new Float32Array(n), 1));
  g.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes ?? new Array(n).fill(1), 1));
  const p = new THREE.Points(g, material);
  p.frustumCulled = false;
  return p;
}

/** Draw a LineSegments progressively (0…1), for the "pen" reveal. */
export function drawOn(obj: THREE.LineSegments | THREE.Line, v: number) {
  const pos = obj.geometry.getAttribute("position");
  const pairs = Math.floor(pos.count / 2);
  obj.geometry.setDrawRange(0, Math.ceil(pairs * Math.min(1, Math.max(0, v))) * 2);
}

/** Disposes every geometry under a root (materials are owned by Inks). */
export function disposeGeometries(root: THREE.Object3D) {
  root.traverse((o) => {
    const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
    g?.dispose();
  });
}

export const ease = {
  inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x: number) => 1 - Math.pow(1 - x, 3),
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
