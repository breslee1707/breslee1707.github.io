import * as THREE from "three";

/**
 * The portrait as a point cloud: one point per grid cell, pushed off the
 * frame plane by the segmented depth map.
 *
 * Rows stay as raw, drifting sensor noise until the laser sweeps across them
 * (tracked per row in a 1-px-tall texture, so a sweep costs a few bytes of
 * upload). Once scanned, each point becomes a square tile that carries its own
 * patch of the full-resolution photo — so at rest the face is as sharp as the
 * photograph, and tilting reveals the depth without smearing it.
 */
const vertex = /* glsl */ `
uniform vec2 uSize;
uniform float uDepthAmp;
uniform float uTime;
uniform float uPixelRatio;
uniform float uPointSize;
uniform float uCamDist;
uniform float uResolve;
uniform vec3 uLaser; // u, v, on
uniform sampler2D uScan;
uniform vec3 uAccent;
uniform vec2 uTilt; // |sin| of the cloud's yaw and pitch
attribute vec3 aColor;
attribute vec3 aSeed;
attribute vec2 aGrad; // depth slope to the neighbouring column / row
varying vec2 vUv;
varying vec3 vRaw;
varying float vSettle;
varying float vGlow;
varying float vAlpha;
varying float vScale;

void main() {
  vec2 uv = position.xy;
  float depth = position.z;
  float scanned = texture2D(uScan, vec2(uv.y, 0.5)).r;
  float s = smoothstep(0.0, 1.0, max(scanned, uResolve));
  float flatten = 1.0 - uResolve;

  vec3 target = vec3(
    (uv.x - 0.5) * uSize.x,
    (0.5 - uv.y) * uSize.y,
    (depth - 0.3) * uDepthAmp * flatten
  );

  // Unscanned: raw sensor noise — a loose volume that drifts.
  float t = uTime * 0.55;
  vec3 drift = vec3(
    sin(t + aSeed.x * 9.0),
    cos(t * 0.8 + aSeed.y * 7.0),
    sin(t * 0.7 + aSeed.z * 8.0)
  );
  vec3 loose = target
    + aSeed * vec3(0.16 * uSize.x, 0.05 * uSize.y, 2.2 * uDepthAmp)
    + drift * 0.02 * uSize.x;
  vec3 pos = mix(loose, target, s);

  // The light plane: points it crosses glow, so the stripe rides the relief.
  float band = (1.0 - smoothstep(0.0, 0.008, abs(uv.y - uLaser.y))) * uLaser.z;
  vec2 dd = (uv - uLaser.xy) * vec2(uSize.x / uSize.y, 1.0);
  float spot = (1.0 - smoothstep(0.0, 0.028, length(dd))) * uLaser.z;
  float glow = max(band, spot);
  pos.z += glow * 0.02 * uDepthAmp;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Tilting stretches the grid across steep relief; grow tiles to bridge it.
  float stretch = max(aGrad.x * uTilt.x, aGrad.y * uTilt.y) * uDepthAmp * flatten * s;
  float k = mix(0.62, 1.1, s) * (1.0 + glow * 0.5) + stretch / uPointSize;
  gl_PointSize = uPointSize * k * uPixelRatio * (uCamDist / -mv.z);

  float lum = dot(aColor, vec3(0.299, 0.587, 0.114));
  vUv = uv;
  vRaw = mix(vec3(lum), uAccent, 0.3) * 0.8;
  vSettle = s;
  vGlow = glow * 0.85;
  vAlpha = mix(0.16, 1.0, s) + glow * 0.5;
  vScale = k;
}
`;

// Opaque, depth-tested fragments so nearer relief hides what's behind it
// whatever the draw order; partial alpha becomes a stochastic screen-door,
// which reads as sensor noise anyway.
const fragment = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec2 uCell;
uniform vec3 uAccent;
varying vec2 vUv;
varying vec3 vRaw;
varying float vSettle;
varying float vGlow;
varying float vAlpha;
varying float vScale;

void main() {
  vec2 pc = gl_PointCoord - 0.5;
  bool tile = vSettle > 0.5;
  if (!tile && dot(pc, pc) > 0.25) discard;
  float h = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  if (h > min(vAlpha, 1.0)) discard;
  vec2 uv = vUv + pc * uCell * vScale;
  vec3 photo = texture2D(uPhoto, vec2(uv.x, 1.0 - uv.y)).rgb;
  vec3 base = tile ? photo : vRaw;
  gl_FragColor = vec4(mix(base, uAccent, vGlow), 1.0);
}
`;

/** Separable box blur over a cols×rows grid (softens depth silhouettes). */
function blurGrid(src: Float32Array, cols: number, rows: number, radius: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const pass = (from: Float32Array, to: Float32Array, horizontal: boolean) => {
    const len = horizontal ? cols : rows;
    const lines = horizontal ? rows : cols;
    for (let l = 0; l < lines; l++) {
      for (let i = 0; i < len; i++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const j = Math.min(len - 1, Math.max(0, i + k));
          sum += from[horizontal ? l * cols + j : j * cols + l];
        }
        to[horizontal ? l * cols + i : i * cols + l] = sum / (radius * 2 + 1);
      }
    }
  };
  pass(src, tmp, true);
  pass(tmp, out, false);
  return out;
}

export class PortraitCloud {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  readonly cols: number;
  readonly rows: number;
  private readonly depth: Float32Array;
  private readonly level: Float32Array;
  private readonly armed: Uint8Array;
  private readonly bytes: Uint8Array;
  private readonly scanTex: THREE.DataTexture;
  private readonly photoTex: THREE.Texture;
  private scannedRows = 0;

  /**
   * @param photo   RGBA pixels of the portrait resampled to cols×rows
   * @param depthPx RGBA pixels of the depth map at the same size
   * @param image   the portrait itself, sampled at full resolution by the tiles
   */
  constructor(
    photo: Uint8ClampedArray,
    depthPx: Uint8ClampedArray,
    image: HTMLImageElement,
    cols: number,
    rows: number,
  ) {
    this.cols = cols;
    this.rows = rows;
    const n = cols * rows;

    // Soft relief: a gentle bas-relief parallaxes cleanly, whereas hard
    // silhouettes would tear open (and ghost) as the cloud tilts.
    const raw = new Float32Array(n);
    for (let i = 0; i < n; i++) raw[i] = depthPx[i * 4] / 255;
    this.depth = blurGrid(raw, cols, rows, Math.max(2, Math.round(cols / 60)));

    const position = new Float32Array(n * 3);
    const color = new Float32Array(n * 3);
    const seed = new Float32Array(n * 3);
    const grad = new Float32Array(n * 2);
    const z = (c: number, r: number) =>
      this.depth[Math.min(rows - 1, Math.max(0, r)) * cols + Math.min(cols - 1, Math.max(0, c))];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        position[i * 3] = (c + 0.5) / cols;
        position[i * 3 + 1] = (r + 0.5) / rows;
        position[i * 3 + 2] = this.depth[i];
        color[i * 3] = photo[i * 4] / 255;
        color[i * 3 + 1] = photo[i * 4 + 1] / 255;
        color[i * 3 + 2] = photo[i * 4 + 2] / 255;
        grad[i * 2] = Math.max(Math.abs(z(c + 1, r) - z(c, r)), Math.abs(z(c - 1, r) - z(c, r)));
        grad[i * 2 + 1] = Math.max(Math.abs(z(c, r + 1) - z(c, r)), Math.abs(z(c, r - 1) - z(c, r)));
        // Gaussian-ish scatter for the unscanned noise volume.
        for (let k = 0; k < 3; k++) {
          seed[i * 3 + k] = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    geometry.setAttribute("aGrad", new THREE.BufferAttribute(grad, 2));

    this.level = new Float32Array(rows);
    this.armed = new Uint8Array(rows);
    this.bytes = new Uint8Array(rows);
    this.scanTex = new THREE.DataTexture(this.bytes, rows, 1, THREE.RedFormat, THREE.UnsignedByteType);
    this.scanTex.minFilter = THREE.LinearFilter;
    this.scanTex.magFilter = THREE.LinearFilter;
    this.scanTex.needsUpdate = true;

    // Raw sRGB in, raw sRGB out — the shader writes colours untouched.
    this.photoTex = new THREE.Texture(image);
    this.photoTex.colorSpace = THREE.NoColorSpace;
    this.photoTex.anisotropy = 4;
    this.photoTex.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uSize: { value: new THREE.Vector2(360, 482) },
        uDepthAmp: { value: 120 },
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uPointSize: { value: 2 },
        uCamDist: { value: 1000 },
        uResolve: { value: 0 },
        uLaser: { value: new THREE.Vector3(0.5, -1, 0) },
        uScan: { value: this.scanTex },
        uAccent: { value: new THREE.Vector3(0.95, 0.69, 0.28) },
        uTilt: { value: new THREE.Vector2() },
        uPhoto: { value: this.photoTex },
        uCell: { value: new THREE.Vector2(1 / cols, 1 / rows) },
      },
    });

    this.points = new THREE.Points(geometry, material);
    // Positions are in frame-UV space; the shader places them.
    this.points.frustumCulled = false;
  }

  get uniforms() {
    return this.points.material.uniforms;
  }

  /** Depth (0–1) at a frame UV, for aiming the scanner at the surface. */
  depthAt(u: number, v: number) {
    const c = Math.min(this.cols - 1, Math.max(0, Math.floor(u * this.cols)));
    const r = Math.min(this.rows - 1, Math.max(0, Math.floor(v * this.rows)));
    return this.depth[r * this.cols + c];
  }

  /** Arms every row the light plane crossed between two laser positions. */
  sweep(v0: number, v1: number) {
    const a = Math.max(0, Math.floor(Math.min(v0, v1) * this.rows) - 1);
    const b = Math.min(this.rows - 1, Math.ceil(Math.max(v0, v1) * this.rows) + 1);
    for (let r = a; r <= b; r++) this.armed[r] = 1;
  }

  /** Settles armed rows over ~0.6 s; `complete` (0–1) forces the rest in. */
  update(dt: number, complete: number) {
    let done = 0;
    for (let r = 0; r < this.rows; r++) {
      let l = this.level[r];
      if (this.armed[r]) l = Math.min(1, l + dt * 1.7);
      l = Math.max(l, complete);
      this.level[r] = l;
      this.bytes[r] = Math.round(l * 255);
      if (l > 0.98) done++;
    }
    this.scannedRows = done;
    this.scanTex.needsUpdate = true;
  }

  /** Fraction of rows fully scanned. */
  get scanned() {
    return this.scannedRows / this.rows;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.scanTex.dispose();
    this.photoTex.dispose();
  }
}
