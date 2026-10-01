import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * A six-axis industrial arm built from primitives, in arm units (≈ 1 unit per
 * metre; the caller scales the group). Solved analytically: J1 yaw, J2/J3 as
 * a two-link planar chain to the wrist centre, and a spherical wrist that
 * points the scanner head at a target. Joints chase their targets with
 * critically damped motion and a speed limit, so it moves like a servo.
 */
export const ARM = {
  /** Shoulder (J2) height above the base plate. */
  shoulder: 0.36,
  /** Upper arm, J2 → J3. */
  L1: 0.62,
  /** Forearm, J3 → wrist centre. */
  L2: 0.58,
} as const;

export type ArmVariant = "studio" | "blueprint";

type Palette = {
  paint: THREE.Material;
  dark: THREE.Material;
  chrome: THREE.Material;
  rubber: THREE.Material;
  glass: THREE.Material;
  glow: THREE.Material;
};

const HOME = { yaw: 0.25, shoulder: -0.35, elbow: 2.25 };
const MAX_SPEED = 2.4; // rad/s

const shortest = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

export class RobotArm {
  /** Base frame — position, heading and scale are owned by the caller. */
  readonly group = new THREE.Group();
  readonly j1 = new THREE.Group();
  readonly j2 = new THREE.Group();
  readonly j3 = new THREE.Group();
  readonly wrist = new THREE.Group();
  readonly tool = new THREE.Group();
  /** Laser/camera aperture on the scanner face. */
  readonly emitter = new THREE.Object3D();
  /** Current joint angles in radians (J1–J3), plus the wrist's local rotation. */
  readonly q = { ...HOME };
  private goal = { ...HOME };
  private aim = new THREE.Vector3();
  private hasAim = false;
  private readonly owned: { dispose(): void }[] = [];
  /** Accent-coloured parts (lens ring, status LED) — recoloured on theme change. */
  readonly glowMaterial: THREE.MeshBasicMaterial | THREE.LineBasicMaterial;
  /** Blueprint variant: edge lines, so callers can recolour them. */
  readonly lineMaterial?: THREE.LineBasicMaterial;
  readonly fillMaterial?: THREE.MeshBasicMaterial;

  constructor(variant: ArmVariant = "studio") {
    const own = <T extends { dispose(): void }>(x: T) => (this.owned.push(x), x);

    let pal: Palette;
    if (variant === "studio") {
      const paint = own(
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color().setRGB(0.8, 0.53, 0.17, THREE.SRGBColorSpace),
          roughness: 0.38,
          metalness: 0.0,
          clearcoat: 1,
          clearcoatRoughness: 0.16,
        }),
      );
      const dark = own(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setRGB(0.14, 0.13, 0.12, THREE.SRGBColorSpace),
          roughness: 0.48,
          metalness: 0.35,
        }),
      );
      const chrome = own(
        new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.18, metalness: 1 }),
      );
      const rubber = own(
        new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: 0.82, metalness: 0 }),
      );
      const glass = own(
        new THREE.MeshPhysicalMaterial({
          color: 0x07080a,
          roughness: 0.04,
          metalness: 0.1,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
        }),
      );
      const glow = own(new THREE.MeshBasicMaterial({ color: 0xf2af48, toneMapped: false }));
      pal = { paint, dark, chrome, rubber, glass, glow };
      this.glowMaterial = glow;
    } else {
      // Blueprint: faint fills that occlude, edges that carry the drawing.
      const fill = own(
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
      );
      const glow = own(new THREE.MeshBasicMaterial({ color: 0xf2af48, toneMapped: false }));
      pal = { paint: fill, dark: fill, chrome: fill, rubber: fill, glass: fill, glow };
      this.fillMaterial = fill;
      this.glowMaterial = glow;
      this.lineMaterial = own(new THREE.LineBasicMaterial({ color: 0x888888 }));
    }

    this.build(pal, own, variant);
    this.apply();
  }

  private build(
    pal: Palette,
    own: <T extends { dispose(): void }>(x: T) => T,
    variant: ArmVariant,
  ) {
    const lineMat = this.lineMaterial;
    const add = (
      parent: THREE.Object3D,
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      pos: [number, number, number] = [0, 0, 0],
      rot: [number, number, number] = [0, 0, 0],
    ) => {
      own(geo);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      parent.add(mesh);
      if (variant === "blueprint" && lineMat && mat !== pal.glow) {
        const edges = own(new THREE.EdgesGeometry(geo, 28));
        mesh.add(new THREE.LineSegments(edges, lineMat));
      }
      return mesh;
    };
    const lathe = (pts: [number, number][], seg = 48) =>
      new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    const cylZ = (r: number, len: number, seg = 40) => {
      const g = new THREE.CylinderGeometry(r, r, len, seg);
      g.rotateX(Math.PI / 2); // axis along Z — the joint axes of J2/J3/J5
      return g;
    };

    const { L1, L2, shoulder } = ARM;

    // ---- Base plate (fixed) ----
    add(
      this.group,
      lathe([
        [0, 0],
        [0.215, 0],
        [0.215, 0.032],
        [0.198, 0.048],
        [0.198, 0.07],
        [0.176, 0.09],
        [0, 0.09],
      ]),
      pal.dark,
    );
    // Anchor bolts around the plate.
    const bolt = own(new THREE.CylinderGeometry(0.013, 0.013, 0.014, 6));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const m = new THREE.Mesh(bolt, pal.chrome);
      m.position.set(Math.cos(a) * 0.19, 0.039, Math.sin(a) * 0.19);
      this.group.add(m);
    }

    // ---- J1 turret ----
    this.group.add(this.j1);
    add(
      this.j1,
      lathe([
        [0, 0.09],
        [0.168, 0.09],
        [0.168, 0.122],
        [0.152, 0.15],
        [0.132, 0.29],
        [0.104, 0.322],
        [0, 0.322],
      ]),
      pal.paint,
    );
    // Seam ring where the turret meets the plate.
    add(this.j1, new THREE.TorusGeometry(0.17, 0.006, 8, 64), pal.dark, [0, 0.094, 0], [Math.PI / 2, 0, 0]);
    // Cable loom from the turret up to the shoulder.
    const loom = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, 0.16, 0.0),
      new THREE.Vector3(-0.2, 0.26, 0.02),
      new THREE.Vector3(-0.15, 0.38, 0.03),
      new THREE.Vector3(-0.08, 0.42, 0.0),
    ]);
    add(this.j1, new THREE.TubeGeometry(loom, 24, 0.014, 8, false), pal.rubber);

    // ---- J2 shoulder ----
    this.j2.position.set(0, shoulder, 0);
    this.j1.add(this.j2);
    add(this.j1, cylZ(0.108, 0.3), pal.dark, [0, shoulder, 0]);
    add(this.j1, cylZ(0.062, 0.012), pal.chrome, [0, shoulder, 0.156]);
    add(this.j1, cylZ(0.062, 0.012), pal.chrome, [0, shoulder, -0.156]);

    // Upper arm — a rounded beam from J2 to J3.
    add(this.j2, new RoundedBoxGeometry(0.13, L1 + 0.1, 0.15, 5, 0.045), pal.paint, [0, L1 / 2, 0]);
    // Recessed service strip and the cable run down its back.
    add(this.j2, new THREE.BoxGeometry(0.004, L1 * 0.62, 0.06), pal.dark, [0.066, L1 * 0.5, 0]);
    const run = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.07, 0.06, 0),
      new THREE.Vector3(-0.105, L1 * 0.5, 0),
      new THREE.Vector3(-0.075, L1 - 0.04, 0),
    ]);
    add(this.j2, new THREE.TubeGeometry(run, 20, 0.012, 8, false), pal.rubber);
    // Nameplate decals on both faces.
    const decal = this.decal(own, variant);
    if (decal) {
      for (const side of [1, -1]) {
        const plane = new THREE.Mesh(own(new THREE.PlaneGeometry(0.1, 0.034)), decal);
        plane.position.set(0, L1 * 0.36, side * 0.0765);
        plane.rotation.set(0, side > 0 ? 0 : Math.PI, Math.PI / 2);
        this.j2.add(plane);
      }
    }

    // ---- J3 elbow ----
    this.j3.position.set(0, L1, 0);
    this.j2.add(this.j3);
    add(this.j2, cylZ(0.09, 0.24), pal.dark, [0, L1, 0]);
    add(this.j2, cylZ(0.05, 0.012), pal.chrome, [0, L1, 0.126]);
    add(this.j2, cylZ(0.05, 0.012), pal.chrome, [0, L1, -0.126]);
    // Motor housing behind the elbow.
    add(this.j3, new RoundedBoxGeometry(0.15, 0.17, 0.16, 4, 0.04), pal.paint, [0, -0.07, 0]);
    // Forearm — tapers toward the wrist, with the J4 roll seam.
    add(this.j3, new THREE.CylinderGeometry(0.058, 0.072, L2 - 0.1, 40), pal.paint, [0, (L2 - 0.1) / 2 + 0.03, 0]);
    add(this.j3, new THREE.CylinderGeometry(0.0735, 0.0735, 0.012, 40), pal.dark, [0, 0.2, 0]);

    // ---- Wrist (J5 hub) ----
    this.wrist.position.set(0, L2, 0);
    this.j3.add(this.wrist);
    add(this.j3, cylZ(0.056, 0.13), pal.dark, [0, L2, 0]);

    // ---- Tool: spherical wrist output, flange and the scanner head ----
    this.wrist.add(this.tool);
    add(this.tool, new THREE.CylinderGeometry(0.044, 0.044, 0.024, 40), pal.chrome, [0, 0.07, 0]);
    add(this.tool, new RoundedBoxGeometry(0.13, 0.1, 0.09, 4, 0.018), pal.dark, [0, 0.13, 0]);
    add(this.tool, new THREE.BoxGeometry(0.132, 0.016, 0.092), pal.paint, [0, 0.105, 0]);
    // Lens and its accent ring, facing +Y (the aim axis).
    add(this.tool, new THREE.CylinderGeometry(0.024, 0.024, 0.014, 32), pal.glass, [0.028, 0.184, 0]);
    add(this.tool, new THREE.TorusGeometry(0.027, 0.0045, 8, 40), pal.glow, [0.028, 0.18, 0], [Math.PI / 2, 0, 0]);
    // Line-laser aperture beside the lens.
    add(this.tool, new THREE.BoxGeometry(0.03, 0.006, 0.01), pal.glow, [-0.03, 0.181, 0]);
    this.emitter.position.set(-0.03, 0.186, 0);
    this.tool.add(this.emitter);
    // Status LED on the turret.
    add(this.j1, new THREE.SphereGeometry(0.009, 12, 12), pal.glow, [0.11, 0.26, 0.07]);
  }

  /** "GH-6" nameplate, drawn once to a canvas texture (studio only). */
  private decal(own: <T extends { dispose(): void }>(x: T) => T, variant: ArmVariant) {
    if (variant !== "studio") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 174;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#1c1916";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#e9e2d4";
    g.font = '600 74px "JetBrains Mono Variable", ui-monospace, monospace';
    g.textBaseline = "middle";
    g.fillText("GH-6", 34, 70);
    g.font = '500 30px "JetBrains Mono Variable", ui-monospace, monospace';
    g.fillStyle = "#b5ab9a";
    g.fillText("6-AXIS · SCAN", 36, 132);
    g.fillStyle = "#f2af48";
    g.fillRect(440, 34, 40, 40);
    const tex = own(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return own(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1 }));
  }

  /**
   * Sets the wrist-centre goal and the point the scanner should look at,
   * both in world space. The base group's matrixWorld must be current.
   */
  reach(wristWorld: THREE.Vector3, aimWorld: THREE.Vector3) {
    const local = this.group.worldToLocal(wristWorld.clone());
    const dx = local.x;
    const dz = local.z;
    const a = Math.hypot(dx, dz);
    const b = local.y - ARM.shoulder;
    const { L1, L2 } = ARM;
    const d = clamp(Math.hypot(a, b), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
    // Angles measured from vertical; elbow-up solution.
    const alpha = Math.atan2(a, b);
    const beta = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const psi = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    this.goal.yaw = Math.atan2(-dz, dx);
    this.goal.shoulder = alpha - beta;
    this.goal.elbow = Math.PI - psi;
    this.aim.copy(aimWorld);
    this.hasAim = true;
  }

  /** Fold into the parked pose. */
  park() {
    Object.assign(this.goal, HOME);
    this.hasAim = false;
  }

  /** Advance the servos by dt seconds and pose the meshes. */
  update(dt: number) {
    const k = 1 - Math.exp(-dt * 7);
    const step = MAX_SPEED * dt;
    for (const j of ["yaw", "shoulder", "elbow"] as const) {
      const diff = shortest(this.q[j], this.goal[j]);
      this.q[j] += clamp(diff * k, -step, step);
    }
    this.apply();

    // Spherical wrist: point the scanner (+Y) at the aim, fan kept horizontal.
    const target = this.hasAim ? this.aimQuaternion() : REST_TOOL;
    this.tool.quaternion.slerp(target, 1 - Math.exp(-dt * 9));
  }

  private apply() {
    this.j1.rotation.y = this.q.yaw;
    this.j2.rotation.z = -this.q.shoulder;
    this.j3.rotation.z = -this.q.elbow;
  }

  private aimQuaternion() {
    this.group.updateMatrixWorld(true);
    const origin = this.wrist.getWorldPosition(V1);
    const dir = V2.copy(this.aim).sub(origin).normalize();
    const x = V3.set(1, 0, 0).addScaledVector(dir, -dir.x);
    if (x.lengthSq() < 1e-4) x.set(0, 0, 1);
    x.normalize();
    const z = V4.crossVectors(x, dir).normalize();
    const world = Q1.setFromRotationMatrix(M1.makeBasis(x, dir, z));
    const parent = this.wrist.getWorldQuaternion(Q2).invert();
    return Q3.copy(parent).multiply(world);
  }

  /** Joint read-outs in degrees, J1–J6 (J4–J6 from the wrist rotation). */
  readout(): number[] {
    E1.setFromQuaternion(this.tool.quaternion, "YXZ");
    return [this.q.yaw, this.q.shoulder, this.q.elbow, E1.y, E1.x, E1.z].map(
      (r) => (r * 180) / Math.PI,
    );
  }

  dispose() {
    this.owned.forEach((o) => o.dispose());
  }
}

const REST_TOOL = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.6));
const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const V3 = new THREE.Vector3();
const V4 = new THREE.Vector3();
const Q1 = new THREE.Quaternion();
const Q2 = new THREE.Quaternion();
const Q3 = new THREE.Quaternion();
const M1 = new THREE.Matrix4();
const E1 = new THREE.Euler();
