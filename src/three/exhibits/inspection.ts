import * as THREE from "three";
import { RobotArm } from "../robotArm";
import {
  Inks,
  circleSegs,
  disposeGeometries,
  drawOn,
  ease,
  floorGrid,
  segments,
  type Exhibit,
  type FrameCtx,
  type Palette,
} from "./kit";

// Arm and table sit across the camera's line of sight, so the arm reads in
// profile instead of reaching straight at the viewer.
const BASE = new THREE.Vector3(-0.85, 0, 0.45);
const TABLE = new THREE.Vector3(0.65, 0, -0.55);
const TOP = 0.42; // height of the part's top face
const ARM_SCALE = 1.45;

/**
 * Exhibit 03 — the robotic inspection cell: the same arm as the hero, drawn
 * as a blueprint, aiming its camera over a part on a turntable. The cursor
 * steers the IK target; otherwise it runs a circular inspection pass.
 */
export class InspectionExhibit implements Exhibit {
  readonly group = new THREE.Group();
  readonly frame = { target: 0.7, distance: 6.2, elevation: 0.34 };
  private readonly inks = new Inks();
  private readonly arm = new RobotArm("blueprint");
  private readonly turntable = new THREE.Group();
  private readonly defect: THREE.LineSegments;
  private readonly frustum: THREE.LineSegments;
  private readonly drawn: THREE.LineSegments[] = [];
  private readonly aim = new THREE.Vector3();
  private t = 0;
  private seen = 0;

  constructor() {
    const { inks, arm } = this;
    inks.setBase(inks.faint, 0.7);

    const floor = floorGrid(inks.floor, 3.4, 0.4);
    this.group.add(floor);

    // Arm on its footprint plate, heading toward the table.
    arm.group.scale.setScalar(ARM_SCALE);
    arm.group.position.copy(BASE);
    arm.group.rotation.y = -Math.atan2(TABLE.z - BASE.z, TABLE.x - BASE.x);
    if (arm.lineMaterial) inks.track(arm.lineMaterial);
    if (arm.fillMaterial) inks.track(arm.fillMaterial);
    inks.track(arm.glowMaterial);
    const plate = segments(circleSegs(0.42, 0.002, 64, BASE.x, BASE.z), inks.faint);
    this.group.add(arm.group, plate);
    this.drawn.push(plate);

    // Turntable: a dial with ticks, and the part — a flanged hub.
    this.turntable.position.copy(TABLE);
    const dial = segments(circleSegs(0.62, 0.06), inks.ink);
    const base = segments([...circleSegs(0.62, 0), ...circleSegs(0.5, 0.06, 64)], inks.faint);
    const ticks: number[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r0 = i % 3 === 0 ? 0.52 : 0.56;
      ticks.push(Math.cos(a) * r0, 0.061, Math.sin(a) * r0, Math.cos(a) * 0.6, 0.061, Math.sin(a) * 0.6);
    }
    const tickLines = segments(ticks, inks.faint);
    this.turntable.add(dial, base, tickLines);
    this.drawn.push(dial, base, tickLines);

    const profile = [
      [0, 0.06],
      [0.4, 0.06],
      [0.4, 0.14],
      [0.22, 0.16],
      [0.2, TOP - 0.02],
      [0.17, TOP],
      [0.08, TOP],
      [0.08, TOP - 0.06],
      [0, TOP - 0.06],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const lathe = new THREE.LatheGeometry(profile, 24);
    const part = new THREE.Mesh(lathe, inks.fill);
    const partEdges = new THREE.LineSegments(new THREE.EdgesGeometry(lathe, 20), inks.ink);
    part.add(partEdges);
    // Bolt circle on the flange.
    const holes: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      holes.push(...circleSegs(0.035, 0.141, 16, Math.cos(a) * 0.31, Math.sin(a) * 0.31));
    }
    const holeLines = segments(holes, inks.ink);
    this.turntable.add(part, holeLines);
    this.drawn.push(holeLines);

    // The defect the camera is looking for: a short scratch near the rim.
    const box = new THREE.BoxGeometry(0.1, 0.04, 0.05);
    this.defect = new THREE.LineSegments(new THREE.EdgesGeometry(box), inks.accent);
    box.dispose();
    this.defect.position.set(0.3, 0.16, 0.08);
    this.defect.rotation.y = 0.5;
    this.turntable.add(this.defect);
    this.group.add(this.turntable);

    // Camera frustum: lens → four corners of the field of view on the part.
    this.frustum = segments(new Array(16 * 3).fill(0), inks.accent);
    inks.setBase(inks.accent, 0.85);
    this.group.add(this.frustum);
  }

  setPresence(v: number) {
    this.inks.setPresence(v);
    for (const l of this.drawn) drawOn(l, ease.out(v));
    this.group.visible = v > 0.002;
  }

  setPalette(p: Palette) {
    this.inks.setPalette(p);
    this.arm.lineMaterial?.color.copy(p.ink);
    this.arm.fillMaterial?.color.copy(p.bg);
    this.arm.glowMaterial.color.copy(p.accent);
  }

  update({ dt, pointer }: FrameCtx) {
    this.t += dt;
    this.turntable.rotation.y += dt * 0.35;

    // Aim: the cursor (mapped onto the table) or a slow circle over the part.
    const tx = pointer ? pointer.x * 0.5 : Math.cos(this.t * 0.6) * 0.24;
    const tz = pointer ? -pointer.y * 0.5 : Math.sin(this.t * 0.6) * 0.24;
    const goal = V1.set(TABLE.x + tx, TOP, TABLE.z + tz);
    this.aim.lerp(goal, 1 - Math.exp(-dt * 5));

    this.group.updateMatrixWorld(true);
    const aimWorld = this.group.localToWorld(V2.copy(this.aim));
    // Wrist hovers above the aim, pulled back toward the arm.
    V3.copy(BASE).sub(this.aim).setY(0).normalize().multiplyScalar(0.55);
    const wristWorld = this.group.localToWorld(
      V3.set(this.aim.x + V3.x, this.aim.y + 0.78, this.aim.z + V3.z),
    );
    this.arm.reach(wristWorld, aimWorld);
    this.arm.update(dt);

    // Field-of-view square on the part's top plane, oriented to the table.
    const lens = this.group.worldToLocal(this.arm.emitter.getWorldPosition(V4));
    const h = 0.2;
    const corners = [
      [-h, -h],
      [h, -h],
      [h, h],
      [-h, h],
    ].map(([dx, dz]) => new THREE.Vector3(this.aim.x + dx, TOP + 0.002, this.aim.z + dz));
    const f = this.frustum.geometry.getAttribute("position") as THREE.BufferAttribute;
    corners.forEach((c, i) => {
      const n = corners[(i + 1) % 4];
      f.setXYZ(i * 2, lens.x, lens.y, lens.z);
      f.setXYZ(i * 2 + 1, c.x, c.y, c.z);
      f.setXYZ(8 + i * 2, c.x, c.y, c.z);
      f.setXYZ(8 + i * 2 + 1, n.x, n.y, n.z);
    });
    f.needsUpdate = true;

    // Is the scratch inside the field of view right now?
    const d = this.defect.getWorldPosition(V5);
    this.group.worldToLocal(d);
    const inView = Math.abs(d.x - this.aim.x) < h && Math.abs(d.z - this.aim.z) < h;
    this.seen += ((inView ? 1 : 0) - this.seen) * (1 - Math.exp(-dt * 6));
    this.defect.visible = this.seen > 0.15 || Math.sin(this.t * 6) > 0.6;
  }

  readout() {
    if (this.seen > 0.5) return "defect · scratch 0.62 → quarantine";
    const j = this.arm.readout();
    const f = (d: number) => `${d < 0 ? "−" : "+"}${Math.abs(d).toFixed(1)}°`;
    return `ik · J1 ${f(j[0])}  J2 ${f(j[1])}  J3 ${f(j[2])}`;
  }

  dispose() {
    this.arm.dispose();
    disposeGeometries(this.group);
    this.inks.dispose();
  }
}

const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const V3 = new THREE.Vector3();
const V4 = new THREE.Vector3();
const V5 = new THREE.Vector3();
