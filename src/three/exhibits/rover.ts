import * as THREE from "three";
import {
  Inks,
  pointScale,
  circleSegs,
  disposeGeometries,
  drawOn,
  ease,
  floorGrid,
  segments,
  wireBox,
  type Exhibit,
  type FrameCtx,
  type Palette,
} from "./kit";

type Box = { kind: "box"; x: number; z: number; w: number; d: number; h: number };
type Cyl = { kind: "cyl"; x: number; z: number; r: number; h: number };

const ROOM = { w: 6.2, d: 4.4, h: 0.22 };
const OBSTACLES: (Box | Cyl)[] = [
  { kind: "box", x: -1.6, z: -1.0, w: 0.8, d: 0.5, h: 0.5 },
  { kind: "box", x: 1.7, z: 1.1, w: 0.6, d: 0.9, h: 0.4 },
  { kind: "box", x: 0.2, z: -1.5, w: 1.2, d: 0.35, h: 0.3 },
  { kind: "box", x: -2.2, z: 1.3, w: 0.5, d: 0.5, h: 0.6 },
  { kind: "cyl", x: 0.6, z: 0.4, r: 0.28, h: 0.5 },
  { kind: "cyl", x: -0.7, z: 0.9, r: 0.22, h: 0.4 },
  { kind: "cyl", x: 2.3, z: -1.0, r: 0.3, h: 0.55 },
];
const WAYPOINTS: [number, number][] = [
  [-2.5, -0.1],
  [-1.2, -0.45],
  [0.2, -0.75],
  [1.5, -0.3],
  [2.6, 0.2],
  [2.45, 1.8],
  [1.0, 1.75],
  [-0.2, 1.5],
  [-1.4, 1.75],
  [-2.7, 0.9],
];
const LIDAR_Y = 0.22;
const RANGE = 3.6;
const REV = 2.2; // revolutions per second
const RAYS_PER_REV = 120;
const MAP_SIZE = 1600;
const MAP_LIFE = 5;

const hitVertex = /* glsl */ `
uniform float uTime;
uniform float uLife;
uniform float uSize;
uniform float uPointScale;
attribute float aBorn;
varying float vAlpha;
void main() {
  float age = uTime - aBorn;
  vAlpha = aBorn < 0.0 ? 0.0 : clamp(1.0 - age / uLife, 0.0, 1.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPointScale / -mv.z;
}
`;
// Rays fade out over a fraction of a turn, leaving a radar-like sweep.
const rayVertex = /* glsl */ `
uniform float uTime;
uniform float uFade;
attribute float aBorn;
varying float vAlpha;
void main() {
  vAlpha = aBorn < 0.0 ? 0.0 : clamp(1.0 - (uTime - aBorn) / uFade, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const rayFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor, vAlpha * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;
const TRAIL = 160;

const hitFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;

/**
 * Exhibit 04 — the three-wheeled rover: it follows a planned loop while its
 * LIDAR sweeps 120 rays a revolution; hits persist briefly as a live map.
 */
export class RoverExhibit implements Exhibit {
  readonly group = new THREE.Group();
  readonly frame = { target: 0.05, distance: 9.4, elevation: 0.7, azimuth: 0.36 };
  private readonly inks = new Inks();
  private readonly rover = new THREE.Group();
  private readonly lidar: THREE.Object3D;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly rays: THREE.LineSegments;
  private readonly rayMat: THREE.ShaderMaterial;
  private readonly hits: THREE.Points;
  private readonly hitMat: THREE.ShaderMaterial;
  private rayHead = 0;
  private readonly drawn: THREE.LineSegments[] = [];
  private t = 0;
  private u = 0;
  private angle = 0;
  private head = 0;
  private mapped = 0;

  constructor() {
    const { inks } = this;
    inks.setBase(inks.faint, 0.7);
    inks.setBase(inks.accent, 0.5);

    const floor = floorGrid(inks.floor, 3.8, 0.4);
    this.group.add(floor);
    this.group.scale.setScalar(0.82);

    // Room walls and obstacles, drawn as wireframes over occluding fills.
    const walls = wireBox(ROOM.w, ROOM.h, ROOM.d, inks.faint);
    walls.position.y = ROOM.h / 2;
    this.group.add(walls);
    for (const o of OBSTACLES) {
      if (o.kind === "box") {
        const b = wireBox(o.w, o.h, o.d, inks.ink, inks.fill);
        b.position.set(o.x, o.h / 2, o.z);
        this.group.add(b);
      } else {
        const g = new THREE.CylinderGeometry(o.r, o.r, o.h, 28);
        const m = new THREE.Mesh(g, inks.fill);
        m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), inks.ink));
        const rings = segments(
          [...circleSegs(o.r, -o.h / 2, 40), ...circleSegs(o.r, o.h / 2, 40)],
          inks.ink,
        );
        m.add(rings);
        m.position.set(o.x, o.h / 2, o.z);
        this.group.add(m);
      }
    }

    // The planned loop, dashed.
    this.curve = new THREE.CatmullRomCurve3(
      WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, 0.004, z)),
      true,
      "centripetal",
    );
    const pts = this.curve.getSpacedPoints(220);
    const dash: number[] = [];
    for (let i = 0; i < pts.length - 1; i += 2) {
      dash.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
    const path = segments(dash, inks.line);
    this.group.add(path);
    this.drawn.push(path);

    // Rover: chassis, two driven rear wheels, a front caster, LIDAR puck.
    const chassis = wireBox(0.46, 0.12, 0.3, inks.ink, inks.fill);
    chassis.position.y = 0.13;
    const wheel = (r: number, w: number, x: number, z: number) => {
      const g = new THREE.CylinderGeometry(r, r, w, 20);
      g.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(g, inks.fill);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), inks.ink));
      m.position.set(x, r, z);
      return m;
    };
    const puck = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24);
    this.lidar = new THREE.Mesh(puck, inks.fill);
    this.lidar.add(new THREE.LineSegments(new THREE.EdgesGeometry(puck, 30), inks.accent));
    this.lidar.position.set(0.02, LIDAR_Y, 0);
    this.rover.add(
      chassis,
      wheel(0.085, 0.05, -0.13, 0.185),
      wheel(0.085, 0.05, -0.13, -0.185),
      wheel(0.055, 0.04, 0.17, 0),
      this.lidar,
    );
    this.group.add(this.rover);

    // The sweep's fading rays, and the decaying hit map.
    const rg = new THREE.BufferGeometry();
    rg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 6), 3));
    rg.setAttribute("aBorn", new THREE.BufferAttribute(new Float32Array(TRAIL * 2).fill(-1), 1));
    this.rayMat = inks.track(
      new THREE.ShaderMaterial({
        vertexShader: rayVertex,
        fragmentShader: rayFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uFade: { value: 0.32 },
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 1 },
        },
      }),
      0.6,
    );
    this.rays = new THREE.LineSegments(rg, this.rayMat);
    this.rays.frustumCulled = false;
    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAP_SIZE * 3), 3));
    hg.setAttribute("aBorn", new THREE.BufferAttribute(new Float32Array(MAP_SIZE).fill(-1), 1));
    this.hitMat = inks.track(
      new THREE.ShaderMaterial({
        vertexShader: hitVertex,
        fragmentShader: hitFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uLife: { value: MAP_LIFE },
          uSize: { value: 0.035 },
          uPointScale: pointScale,
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 1 },
        },
      }),
    );
    this.hits = new THREE.Points(hg, this.hitMat);
    this.hits.frustumCulled = false;
    this.group.add(this.rays, this.hits);
  }

  setPresence(v: number) {
    this.inks.setPresence(v);
    for (const l of this.drawn) drawOn(l, ease.out(v));
    this.group.visible = v > 0.002;
  }

  setPalette(p: Palette) {
    this.inks.setPalette(p);
    this.hitMat.uniforms.uColor.value.copy(p.accent);
    this.rayMat.uniforms.uColor.value.copy(p.accent);
  }

  update({ dt }: FrameCtx) {
    this.t += dt;
    this.hitMat.uniforms.uTime.value = this.t;
    this.rayMat.uniforms.uTime.value = this.t;

    // Drive along the loop.
    this.u = (this.u + dt * 0.032) % 1;
    const p = this.curve.getPointAt(this.u, V1);
    const tan = this.curve.getTangentAt(this.u, V2);
    this.rover.position.set(p.x, 0, p.z);
    this.rover.rotation.y = Math.atan2(-tan.z, tan.x);
    this.rover.updateMatrixWorld(true);

    // Sweep: cast the rays this frame's slice of the revolution covers.
    const origin = this.lidar.getWorldPosition(V3);
    this.group.worldToLocal(origin);
    const from = this.angle;
    this.angle += dt * REV * Math.PI * 2;
    const count = Math.min(64, Math.max(1, Math.round(((this.angle - from) / (Math.PI * 2)) * RAYS_PER_REV)));
    const rayAttr = this.rays.geometry.getAttribute("position") as THREE.BufferAttribute;
    const rayBorn = this.rays.geometry.getAttribute("aBorn") as THREE.BufferAttribute;
    const hitPos = this.hits.geometry.getAttribute("position") as THREE.BufferAttribute;
    const hitBorn = this.hits.geometry.getAttribute("aBorn") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const a = from + ((i + 1) / count) * (this.angle - from);
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const d = cast(origin.x, origin.z, dx, dz);
      const hx = origin.x + dx * d;
      const hz = origin.z + dz * d;
      const r = this.rayHead;
      rayAttr.setXYZ(r * 2, origin.x, LIDAR_Y, origin.z);
      rayAttr.setXYZ(r * 2 + 1, hx, LIDAR_Y, hz);
      rayBorn.setX(r * 2, this.t);
      rayBorn.setX(r * 2 + 1, this.t);
      this.rayHead = (this.rayHead + 1) % TRAIL;
      if (d < RANGE) {
        hitPos.setXYZ(this.head, hx, LIDAR_Y, hz);
        hitBorn.setX(this.head, this.t);
        this.head = (this.head + 1) % MAP_SIZE;
        this.mapped = Math.min(MAP_SIZE, this.mapped + 1);
      }
    }
    rayAttr.needsUpdate = true;
    rayBorn.needsUpdate = true;
    hitPos.needsUpdate = true;
    hitBorn.needsUpdate = true;
  }

  readout() {
    const live = Math.round(Math.min(this.mapped, RAYS_PER_REV * REV * MAP_LIFE * 0.8));
    return `lidar · ${RAYS_PER_REV} rays/rev · map ${live.toLocaleString("en-US")} pts`;
  }

  dispose() {
    disposeGeometries(this.group);
    this.inks.dispose();
  }
}

/** 2D ray cast against the room walls and obstacles; returns hit distance. */
function cast(ox: number, oz: number, dx: number, dz: number) {
  let best = RANGE;
  // Room walls (we're inside the box).
  const hw = ROOM.w / 2;
  const hd = ROOM.d / 2;
  if (dx > 1e-6) best = Math.min(best, (hw - ox) / dx);
  if (dx < -1e-6) best = Math.min(best, (-hw - ox) / dx);
  if (dz > 1e-6) best = Math.min(best, (hd - oz) / dz);
  if (dz < -1e-6) best = Math.min(best, (-hd - oz) / dz);
  for (const o of OBSTACLES) {
    let d = Infinity;
    if (o.kind === "box") {
      // Slab method.
      const x0 = o.x - o.w / 2;
      const x1 = o.x + o.w / 2;
      const z0 = o.z - o.d / 2;
      const z1 = o.z + o.d / 2;
      const ix = 1 / dx;
      const iz = 1 / dz;
      const tx0 = (x0 - ox) * ix;
      const tx1 = (x1 - ox) * ix;
      const tz0 = (z0 - oz) * iz;
      const tz1 = (z1 - oz) * iz;
      const tmin = Math.max(Math.min(tx0, tx1), Math.min(tz0, tz1));
      const tmax = Math.min(Math.max(tx0, tx1), Math.max(tz0, tz1));
      if (tmax >= Math.max(tmin, 0)) d = tmin > 0 ? tmin : Infinity;
    } else {
      const fx = ox - o.x;
      const fz = oz - o.z;
      const b = fx * dx + fz * dz;
      const c = fx * fx + fz * fz - o.r * o.r;
      const disc = b * b - c;
      if (disc >= 0) {
        const t0 = -b - Math.sqrt(disc);
        if (t0 > 0) d = t0;
      }
    }
    if (d < best) best = d;
  }
  return best;
}

const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const V3 = new THREE.Vector3();
