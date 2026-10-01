import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  Inks,
  clamp01,
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

const CASE = { w: 1.0, h: 1.18, d: 0.3, r: 0.2 };
const HOME = new THREE.Vector3(-0.62, 1.25, 0.3);
const CYCLE = 9.5;
const FALL = 5.2; // seconds into the cycle
const SAMPLES = 150;
const RATE = 26; // chart samples per second
const ECG_POINTS = 72;
const ECG_WINDOW = 2.4; // seconds shown on the watch face

/** A rounded rectangle outline in the XY plane at depth z, as segment pairs. */
function roundedRect(w: number, h: number, r: number, z: number, seg = 8): number[] {
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (Math.PI * 3) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    out.push(x0, y0, z, x1, y1, z);
  }
  return out;
}

/** A watch strap curling back from one edge of the case (sign ±1). */
function strapSegs(sign: number): number[] {
  const half = 0.3;
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, sign * (CASE.h / 2 - 0.04), -0.02),
    new THREE.Vector3(0, sign * 1.02, 0.02),
    new THREE.Vector3(0, sign * 1.32, -0.42),
    new THREE.Vector3(0, sign * 1.22, -1.0),
  );
  const pts = curve.getPoints(28);
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    out.push(-half, a.y, a.z, -half, b.y, b.z, half, a.y, a.z, half, b.y, b.z);
  }
  // Ribs across the band, closer near the case.
  for (const i of [3, 7, 11, 15, 19, 23, 27]) {
    const p = pts[i];
    out.push(-half, p.y, p.z, half, p.y, p.z);
  }
  return out;
}

/** Synthetic ECG: P, QRS and T as gaussians over one beat (phase 0–1). */
function beat(phase: number) {
  const g = (mu: number, sd: number) => Math.exp(-((phase - mu) ** 2) / (2 * sd * sd));
  return 0.07 * g(0.16, 0.03) - 0.07 * g(0.34, 0.01) + 0.5 * g(0.38, 0.011) - 0.14 * g(0.42, 0.012) + 0.14 * g(0.64, 0.05);
}

/**
 * Exhibit 05 — the stroke early-warning smartwatch: it reads heart rate and
 * motion; a fall spike followed by an abnormal heart rate raises the alert.
 * Signals are simulated — a drawing of the idea, not live data.
 */
export class WearableExhibit implements Exhibit {
  readonly group = new THREE.Group();
  readonly frame = { target: 1.05, distance: 6.9, elevation: 0.3 };
  private readonly inks = new Inks();
  private readonly watch = new THREE.Group();
  private readonly ecg: THREE.Line;
  private readonly hrTrace: THREE.Line;
  private readonly accTrace: THREE.Line;
  private readonly threshold: THREE.LineSegments;
  private readonly rings: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
  private readonly drawn: THREE.LineSegments[] = [];
  private readonly panelWidth: number;
  private readonly hrBuf = new Float32Array(SAMPLES).fill(72);
  private readonly accBuf = new Float32Array(SAMPLES).fill(1);
  private t = 0;
  private sampleClock = 0;
  private presence = 0;
  private hr = 72;
  private acc = 1;
  private beatPhase = 0;
  private alert = 0;
  private status = "";

  constructor() {
    const { inks } = this;
    inks.setBase(inks.faint, 0.7);
    this.group.add(floorGrid(inks.floor, 3.4, 0.4));

    // ---- The watch: occluding body, line-drawn case, face, crown, straps.
    const body = new THREE.Mesh(
      new RoundedBoxGeometry(CASE.w, CASE.h, CASE.d, 4, CASE.r),
      inks.fill,
    );
    const outline = segments(
      [
        ...roundedRect(CASE.w, CASE.h, CASE.r, CASE.d / 2),
        ...roundedRect(CASE.w, CASE.h, CASE.r, -CASE.d / 2),
        ...roundedRect(CASE.w + 0.05, CASE.h + 0.05, CASE.r + 0.02, 0),
      ],
      inks.ink,
    );
    const screen = segments(roundedRect(0.8, 0.96, 0.13, CASE.d / 2 + 0.002), inks.faint);
    const crownGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.1, 18);
    crownGeo.rotateZ(Math.PI / 2);
    const crown = new THREE.Mesh(crownGeo, inks.fill);
    crown.add(new THREE.LineSegments(new THREE.EdgesGeometry(crownGeo, 30), inks.ink));
    crown.position.set(CASE.w / 2 + 0.05, 0.2, 0);
    const button = wireBox(0.04, 0.2, 0.08, inks.ink, inks.fill);
    button.position.set(CASE.w / 2 + 0.02, -0.18, 0);
    const straps = segments([...strapSegs(1), ...strapSegs(-1)], inks.line);
    this.watch.add(body, outline, screen, crown, button, straps);
    this.drawn.push(outline, screen, straps);

    // Live ECG across the face.
    this.ecg = new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(ECG_POINTS * 3), 3),
      ),
      inks.accent,
    );
    this.ecg.frustumCulled = false;
    this.watch.add(this.ecg);

    // Alert rings around the case.
    for (let i = 0; i < 2; i++) {
      const mat = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false, opacity: 0 });
      const ring = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute(
          "position",
          new THREE.Float32BufferAttribute(roundedRect(CASE.w, CASE.h, CASE.r, 0), 3),
        ),
        mat,
      );
      this.rings.push(ring);
      this.watch.add(ring);
    }

    this.watch.position.copy(HOME);
    this.group.add(this.watch);

    // ---- Chart panel: heart rate (top) and acceleration magnitude (bottom).
    const panel = new THREE.Group();
    panel.position.set(0.98, 1.18, -0.72);
    panel.rotation.y = 0.5; // faces the stage camera
    const W = 1.45;
    const H = 1.2;
    const frame = segments(
      [
        -W / 2, -H / 2, 0, W / 2, -H / 2, 0,
        W / 2, -H / 2, 0, W / 2, H / 2, 0,
        W / 2, H / 2, 0, -W / 2, H / 2, 0,
        -W / 2, H / 2, 0, -W / 2, -H / 2, 0,
        -W / 2, 0, 0, W / 2, 0, 0,
      ],
      inks.faint,
    );
    const grid: number[] = [];
    for (const y of [-0.42, -0.21, 0.21, 0.42]) grid.push(-W / 2, y, 0, W / 2, y, 0);
    for (let x = -W / 2 + 0.25; x < W / 2; x += 0.25) grid.push(x, -H / 2, 0, x, -H / 2 + 0.04, 0, x, H / 2 - 0.04, 0, x, H / 2, 0);
    const gridLines = segments(grid, inks.track(new THREE.LineBasicMaterial({ toneMapped: false }), 0.35));
    // |a| alarm threshold, dashed.
    const thr: number[] = [];
    const ty = this.accY(2.5);
    for (let x = -W / 2; x < W / 2 - 0.02; x += 0.08) thr.push(x, ty, 0.001, Math.min(x + 0.04, W / 2), ty, 0.001);
    this.threshold = segments(thr, inks.faint);
    const line = (mat: THREE.Material) => {
      const l = new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(SAMPLES * 3), 3),
        ),
        mat,
      );
      l.frustumCulled = false;
      return l;
    };
    this.hrTrace = line(inks.ink);
    this.accTrace = line(inks.ink);
    panel.add(frame, gridLines, this.threshold, this.hrTrace, this.accTrace);
    // Leader line from the watch to the panel.
    const leader = segments([HOME.x + 0.6, HOME.y + 0.1, HOME.z - 0.1, 0.36, 1.3, -0.4], inks.faint);
    this.group.add(panel, leader);
    this.drawn.push(frame, gridLines, this.threshold, leader);
    this.panelWidth = W;
  }

  /** Chart y for an acceleration magnitude (g), lower half. */
  private accY(g: number) {
    return -0.6 + (Math.min(g, 3.6) / 3.6) * 0.56;
  }
  /** Chart y for a heart rate (bpm), upper half. */
  private hrY(bpm: number) {
    return 0.04 + ((Math.min(Math.max(bpm, 50), 140) - 50) / 90) * 0.54;
  }

  setPresence(v: number) {
    this.presence = v;
    this.inks.setPresence(v);
    for (const l of this.drawn) drawOn(l, ease.out(v));
    this.group.visible = v > 0.002;
  }

  setPalette(p: Palette) {
    this.inks.setPalette(p);
    for (const r of this.rings) r.material.color.copy(p.accent);
  }

  update({ dt }: FrameCtx) {
    this.t += dt;
    const k = this.t % CYCLE;
    const since = k - FALL;

    // ---- Signals (simulated): steady, then a fall and an abnormal rhythm.
    const noise = (Math.random() - 0.5) * 0.06;
    if (since < 0) {
      this.acc = 1 + noise;
      this.hr += (72 + Math.sin(this.t * 0.7) * 2 - this.hr) * (1 - Math.exp(-dt * 2));
      this.alert = Math.max(0, this.alert - dt * 1.5);
    } else if (since < 0.7) {
      // Free fall dips toward 0 g, then the impact spikes.
      this.acc = since < 0.3 ? 1 - since * 2.6 : 3.4 * Math.exp(-(since - 0.36) * 9) + 0.9;
      this.alert = Math.min(1, this.alert + dt * 4);
    } else if (k < CYCLE - 1.4) {
      this.acc = 1 + noise * 0.5;
      const target = 122 + Math.sin(this.t * 3.1) * 7 + (Math.random() - 0.5) * 6;
      this.hr += (target - this.hr) * (1 - Math.exp(-dt * 1.6));
      this.alert = 1;
    } else {
      this.acc = 1 + noise;
      this.hr += (74 - this.hr) * (1 - Math.exp(-dt * 2.5));
      this.alert = Math.max(0, this.alert - dt * 1.2);
    }

    // Beat phase follows the heart rate (irregular while alerting).
    this.beatPhase += dt * (this.hr / 60) * (this.alert > 0.5 ? 0.85 + Math.random() * 0.3 : 1);

    // ---- Watch pose: gentle float, a tumble on the fall, then it recovers.
    const fall = clamp01(since / 0.55);
    const back = clamp01((k - (CYCLE - 1.4)) / 1.2);
    const tumble = since < 0 ? 0 : ease.out(fall) * (1 - ease.inOut(back));
    this.watch.position.set(HOME.x, HOME.y + Math.sin(this.t * 1.1) * 0.03 - tumble * 0.45, HOME.z);
    this.watch.rotation.set(
      -0.12 + Math.sin(this.t * 0.8) * 0.04 + tumble * 0.55,
      0.42 + Math.sin(this.t * 0.4) * 0.12,
      Math.sin(this.t * 0.6) * 0.03 - tumble * 1.15,
    );

    // ---- ECG on the face.
    const ecg = this.ecg.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < ECG_POINTS; i++) {
      const u = i / (ECG_POINTS - 1);
      const lag = (1 - u) * ECG_WINDOW * (this.hr / 60);
      const y = beat((((this.beatPhase - lag) % 1) + 1) % 1);
      ecg.setXYZ(i, -0.34 + u * 0.68, -0.06 + y * 0.5, CASE.d / 2 + 0.004);
    }
    ecg.needsUpdate = true;

    // ---- Alert rings.
    this.rings.forEach((ring, i) => {
      const p = ((this.t * 0.9 + i * 0.5) % 1);
      ring.scale.setScalar(1.08 + p * 0.9);
      ring.material.opacity = this.presence * this.alert * (1 - p) * 0.9;
      ring.visible = this.alert > 0.01;
    });

    // ---- Charts scroll at a fixed sample rate.
    this.sampleClock += dt;
    while (this.sampleClock > 1 / RATE) {
      this.sampleClock -= 1 / RATE;
      this.hrBuf.copyWithin(0, 1);
      this.accBuf.copyWithin(0, 1);
      this.hrBuf[SAMPLES - 1] = this.hr;
      this.accBuf[SAMPLES - 1] = this.acc;
    }
    const hrPos = this.hrTrace.geometry.getAttribute("position") as THREE.BufferAttribute;
    const accPos = this.accTrace.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < SAMPLES; i++) {
      const x = -this.panelWidth / 2 + (i / (SAMPLES - 1)) * this.panelWidth;
      hrPos.setXYZ(i, x, this.hrY(this.hrBuf[i]), 0.002);
      accPos.setXYZ(i, x, this.accY(this.accBuf[i]), 0.002);
    }
    hrPos.needsUpdate = true;
    accPos.needsUpdate = true;
    this.accTrace.material = this.alert > 0.5 ? this.inks.accent : this.inks.ink;
    this.threshold.material = this.alert > 0.5 ? this.inks.accent : this.inks.faint;

    const bpm = Math.round(this.hr);
    this.status =
      this.alert > 0.5
        ? `fall detected · hr ${bpm} bpm · stroke alert raised · simulated`
        : `hr ${bpm} bpm · |a| ${this.acc.toFixed(2)} g · monitoring · simulated`;
  }

  readout() {
    return this.status;
  }

  dispose() {
    disposeGeometries(this.group);
    for (const r of this.rings) r.material.dispose();
    this.inks.dispose();
  }
}
