import * as THREE from "three";
import {
  Inks,
  circleSegs,
  clamp01,
  disposeGeometries,
  dots,
  drawOn,
  ease,
  floorGrid,
  segments,
  wireBox,
  type Exhibit,
  type FrameCtx,
  type Palette,
} from "./kit";

const TOOLS = ["vector_search", "rerank", "web_search", "memory.write", "notify"];
const HUB = new THREE.Vector3(0, 1.15, 0);
const ORBIT = 1.7;
const TILT = 0.32;

/** Exhibit 01 — an agent hub dispatching tool calls, with a critic loop. */
export class AgentExhibit implements Exhibit {
  readonly group = new THREE.Group();
  readonly frame = { target: 1.05, distance: 7.4 };
  private readonly inks = new Inks();
  private readonly spin = new THREE.Group();
  private readonly shell: THREE.LineSegments;
  private readonly toolEdges: THREE.LineSegments[] = [];
  private readonly toolPos: THREE.Vector3[] = [];
  private readonly drawn: THREE.LineSegments[] = [];
  private readonly pulse: THREE.Points;
  private readonly loopDot: THREE.Points;
  private t = 0;
  private status = "";

  constructor() {
    const { inks } = this;
    inks.setBase(inks.faint, 0.75);

    const floor = floorGrid(inks.floor, 3.6, 0.45);
    // Turntable dial under the system.
    const dial = segments(circleSegs(2.15, 0.002, 96), inks.faint);
    const ticks: number[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r0 = i % 4 === 0 ? 2.02 : 2.08;
      ticks.push(Math.cos(a) * r0, 0.002, Math.sin(a) * r0, Math.cos(a) * 2.15, 0.002, Math.sin(a) * 2.15);
    }
    const tickLines = segments(ticks, inks.faint);
    this.group.add(floor, dial, tickLines);
    this.drawn.push(dial, tickLines);

    this.group.add(this.spin);

    // Stem from the floor to the hub, and the hub's wire shell + core.
    const stem = segments([0, 0, 0, 0, HUB.y - 0.42, 0], inks.faint);
    const ico = new THREE.IcosahedronGeometry(0.42, 1);
    this.shell = new THREE.LineSegments(new THREE.EdgesGeometry(ico), inks.ink);
    ico.dispose();
    this.shell.position.copy(HUB);
    const core = dots([HUB.x, HUB.y, HUB.z], inks.dots, [2.2]);
    (core.geometry.getAttribute("aHot") as THREE.BufferAttribute).setX(0, 1);
    this.spin.add(stem, this.shell, core);
    this.drawn.push(stem, this.shell);

    // Tilted orbit with the tools on it.
    const orbit = new THREE.Group();
    orbit.position.copy(HUB);
    orbit.rotation.x = TILT;
    const ring = segments(circleSegs(ORBIT, 0, 96), inks.faint);
    orbit.add(ring);
    this.drawn.push(ring);
    this.spin.add(orbit);

    const spokes: number[] = [];
    TOOLS.forEach((_, i) => {
      const a = (i / TOOLS.length) * Math.PI * 2 + 0.4;
      const local = new THREE.Vector3(Math.cos(a) * ORBIT, 0, Math.sin(a) * ORBIT);
      const box = wireBox(0.3, 0.3, 0.3, inks.ink, inks.fill) as THREE.Mesh;
      box.position.copy(local);
      box.rotation.y = -a;
      orbit.add(box);
      this.toolEdges.push(box.children[0] as THREE.LineSegments);
      // Spoke endpoints in spin space (orbit is a child of spin).
      const world = local.clone().applyEuler(orbit.rotation).add(HUB);
      this.toolPos.push(world);
      const dir = world.clone().sub(HUB).normalize();
      const from = HUB.clone().addScaledVector(dir, 0.46);
      const to = world.clone().addScaledVector(dir, -0.24);
      spokes.push(from.x, from.y, from.z, to.x, to.y, to.z);
    });
    const spokeLines = segments(spokes, inks.line);
    this.spin.add(spokeLines);
    this.drawn.push(spokeLines);

    // Critic loop above the hub, with an arrowhead.
    const loop: number[] = [];
    const ly = HUB.y + 0.82;
    const n = 40;
    for (let i = 0; i < n; i++) {
      const a0 = 0.35 + (i / n) * (Math.PI * 2 - 0.9);
      const a1 = 0.35 + ((i + 1) / n) * (Math.PI * 2 - 0.9);
      loop.push(Math.cos(a0) * 0.36, ly, Math.sin(a0) * 0.36, Math.cos(a1) * 0.36, ly, Math.sin(a1) * 0.36);
    }
    const end = Math.PI * 2 - 0.55;
    const tip = [Math.cos(end) * 0.36, ly, Math.sin(end) * 0.36];
    loop.push(...tip, tip[0] - 0.09, ly, tip[2] - 0.05, ...tip, tip[0] - 0.02, ly, tip[2] + 0.1);
    const loopLines = segments(loop, inks.line);
    const loopStem = segments([0, HUB.y + 0.44, 0, 0, ly - 0.02, 0], inks.faint);
    this.spin.add(loopLines, loopStem);
    this.drawn.push(loopLines, loopStem);

    this.pulse = dots([0, 0, 0], inks.dots, [1.3]);
    (this.pulse.geometry.getAttribute("aHot") as THREE.BufferAttribute).setX(0, 1);
    this.loopDot = dots([0, 0, 0], inks.dots, [1.1]);
    (this.loopDot.geometry.getAttribute("aHot") as THREE.BufferAttribute).setX(0, 1);
    this.spin.add(this.pulse, this.loopDot);
  }

  setPresence(v: number) {
    this.inks.setPresence(v);
    const draw = ease.out(v);
    for (const l of this.drawn) drawOn(l, draw);
    this.group.visible = v > 0.002;
  }

  setPalette(p: Palette) {
    this.inks.setPalette(p);
  }

  update({ dt }: FrameCtx) {
    this.t += dt;
    this.spin.rotation.y += dt * 0.12;
    this.shell.rotation.y += dt * 0.35;
    this.shell.rotation.x += dt * 0.12;

    // Two tool calls, then a critic pass around the loop; repeat.
    const CALL = 1.5;
    const CYCLE = CALL * 2 + 1.3;
    const k = this.t % CYCLE;
    const round = Math.floor(this.t / CYCLE);
    const pulsePos = this.pulse.geometry.getAttribute("position") as THREE.BufferAttribute;
    const loopPos = this.loopDot.geometry.getAttribute("position") as THREE.BufferAttribute;
    this.toolEdges.forEach((e) => (e.material = this.inks.ink));

    if (k < CALL * 2) {
      const call = Math.floor(k / CALL);
      const local = (k % CALL) / CALL;
      const idx = (round * 2 + call) % TOOLS.length;
      const tool = this.toolPos[idx];
      // Out (0–0.4), at the tool (0.4–0.6), back (0.6–1.0).
      let s: number;
      if (local < 0.4) s = ease.inOut(local / 0.4);
      else if (local < 0.6) s = 1;
      else s = 1 - ease.inOut((local - 0.6) / 0.4);
      V.lerpVectors(HUB, tool, s);
      pulsePos.setXYZ(0, V.x, V.y, V.z);
      this.pulse.visible = true;
      if (local > 0.3 && local < 0.7) this.toolEdges[idx].material = this.inks.accent;
      this.loopDot.visible = false;
      this.status = `call ${String(round * 2 + call + 1).padStart(2, "0")} · ${TOOLS[idx]}()`;
    } else {
      const s = clamp01((k - CALL * 2) / 1.1);
      const a = 0.35 + ease.inOut(s) * (Math.PI * 2 - 0.9);
      loopPos.setXYZ(0, Math.cos(a) * 0.36, HUB.y + 0.82, Math.sin(a) * 0.36);
      this.loopDot.visible = true;
      this.pulse.visible = false;
      this.status = "critic · reflect on the trace";
    }
    pulsePos.needsUpdate = true;
    loopPos.needsUpdate = true;
  }

  readout() {
    return this.status;
  }

  dispose() {
    disposeGeometries(this.group);
    this.inks.dispose();
  }
}

const V = new THREE.Vector3();
