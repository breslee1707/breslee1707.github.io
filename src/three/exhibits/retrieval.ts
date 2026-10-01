import * as THREE from "three";
import {
  Inks,
  clamp01,
  disposeGeometries,
  dots,
  drawOn,
  ease,
  floorGrid,
  segments,
  type Exhibit,
  type FrameCtx,
  type Palette,
} from "./kit";

const CLUSTERS = [
  new THREE.Vector3(-1.05, 1.35, -0.6),
  new THREE.Vector3(1.0, 1.65, -0.35),
  new THREE.Vector3(0.7, 0.85, 0.95),
  new THREE.Vector3(-0.8, 0.75, 0.85),
];
const PER = 20;
const TOP_K = 8;
const KEEP = 3;
const CYCLE = 6.4;

/** Deterministic pseudo-random so the layout is the same on every visit. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Exhibit 02 — agentic retrieval over an embedding space: chunks cluster by
 * document, a query lands, its top-k neighbours light up, a reranker keeps 3.
 */
export class RetrievalExhibit implements Exhibit {
  readonly group = new THREE.Group();
  readonly frame = { target: 1.15, distance: 7.0 };
  private readonly inks = new Inks();
  private readonly spin = new THREE.Group();
  private readonly nodes: THREE.Points;
  private readonly pos: THREE.Vector3[] = [];
  private readonly query: THREE.Points;
  private readonly links: THREE.LineSegments;
  private readonly keepLinks: THREE.LineSegments;
  private readonly drawn: THREE.LineSegments[] = [];
  private readonly linkMat: THREE.LineBasicMaterial;
  private t = 0;

  constructor() {
    const { inks } = this;
    inks.setBase(inks.faint, 0.6);
    this.linkMat = inks.track(
      new THREE.LineBasicMaterial({ transparent: true, toneMapped: false }),
      0.55,
    );

    const floor = floorGrid(inks.floor, 3.6, 0.45);
    this.group.add(floor, this.spin);

    // Chunks: gaussian blobs around each document's centre.
    const r = rng(7);
    const gauss = () => (r() + r() + r() - 1.5) / 1.5;
    const flat: number[] = [];
    for (const c of CLUSTERS) {
      for (let i = 0; i < PER; i++) {
        const p = new THREE.Vector3(c.x + gauss() * 0.62, c.y + gauss() * 0.42, c.z + gauss() * 0.62);
        this.pos.push(p);
        flat.push(p.x, p.y, p.z);
      }
    }
    this.nodes = dots(flat, inks.dots);
    this.spin.add(this.nodes);

    // Similarity graph: each chunk to its two nearest neighbours.
    const edges: number[] = [];
    const seen = new Set<string>();
    this.pos.forEach((p, i) => {
      const near = this.nearest(p, 3).filter((j) => j !== i).slice(0, 2);
      for (const j of near) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push(p.x, p.y, p.z, this.pos[j].x, this.pos[j].y, this.pos[j].z);
      }
    });
    const graph = segments(edges, inks.faint);
    this.spin.add(graph);
    this.drawn.push(graph);

    // Document "spines": a drop line from each cluster to the floor.
    const drops: number[] = [];
    for (const c of CLUSTERS) drops.push(c.x, 0, c.z, c.x, c.y - 0.45, c.z);
    const dropLines = segments(drops, inks.faint);
    this.spin.add(dropLines);
    this.drawn.push(dropLines);

    this.query = dots([0, 0, 0], inks.dots, [1.7]);
    (this.query.geometry.getAttribute("aHot") as THREE.BufferAttribute).setX(0, 1);
    this.links = segments(new Array(TOP_K * 6).fill(0), this.linkMat);
    this.keepLinks = segments(new Array(KEEP * 6).fill(0), inks.accent);
    this.spin.add(this.query, this.links, this.keepLinks);
  }

  private nearest(p: THREE.Vector3, k: number) {
    return this.pos
      .map((q, i) => [q.distanceToSquared(p), i] as const)
      .sort((a, b) => a[0] - b[0])
      .slice(0, k)
      .map(([, i]) => i);
  }

  setPresence(v: number) {
    this.inks.setPresence(v);
    for (const l of this.drawn) drawOn(l, ease.out(v));
    this.group.visible = v > 0.002;
  }

  setPalette(p: Palette) {
    this.inks.setPalette(p);
    this.linkMat.color.copy(p.accent);
  }

  update({ dt }: FrameCtx) {
    this.t += dt;
    this.spin.rotation.y += dt * 0.1;

    const round = Math.floor(this.t / CYCLE);
    const k = this.t % CYCLE;
    const target = CLUSTERS[round % CLUSTERS.length];
    const qEnd = V1.copy(target).add(V2.set(0.55, 0.62, 0.35));
    const qStart = V3.copy(qEnd).add(V2.set(-1.6, 1.4, 1.2));

    // 0–1.0 fly in · 1.0–2.2 top-k · 2.2–3.6 rerank · 3.6–5.6 hold · fade.
    const fly = ease.inOut(clamp01(k / 1.0));
    const q = V4.lerpVectors(qStart, qEnd, fly);
    const qAttr = this.query.geometry.getAttribute("position") as THREE.BufferAttribute;
    qAttr.setXYZ(0, q.x, q.y, q.z);
    qAttr.needsUpdate = true;
    this.query.visible = k < CYCLE - 0.3;

    const top = this.nearest(qEnd, TOP_K);
    const keep = top.slice(0, KEEP);
    const kPhase = clamp01((k - 1.0) / 1.2);
    const rPhase = clamp01((k - 2.2) / 1.0);
    const out = clamp01((k - (CYCLE - 0.8)) / 0.6);

    const hot = this.nodes.geometry.getAttribute("aHot") as THREE.BufferAttribute;
    for (let i = 0; i < hot.count; i++) hot.setX(i, 0);
    const linkAttr = this.links.geometry.getAttribute("position") as THREE.BufferAttribute;
    top.forEach((idx, j) => {
      const p = this.pos[idx];
      const grow = clamp01(kPhase * TOP_K - j);
      const dropped = j >= KEEP ? rPhase : 0;
      const e = V2.lerpVectors(q, p, grow);
      linkAttr.setXYZ(j * 2, q.x, q.y, q.z);
      linkAttr.setXYZ(j * 2 + 1, e.x, e.y, e.z);
      hot.setX(idx, grow * (1 - dropped * 0.85) * (1 - out) * (j < KEEP ? 1 : 0.55));
    });
    linkAttr.needsUpdate = true;
    hot.needsUpdate = true;
    this.links.visible = kPhase > 0 && rPhase < 1;
    this.linkMat.opacity = 0.55 * (1 - rPhase) * (1 - out);

    const keepAttr = this.keepLinks.geometry.getAttribute("position") as THREE.BufferAttribute;
    keep.forEach((idx, j) => {
      const p = this.pos[idx];
      keepAttr.setXYZ(j * 2, q.x, q.y, q.z);
      keepAttr.setXYZ(j * 2 + 1, p.x, p.y, p.z);
    });
    keepAttr.needsUpdate = true;
    this.keepLinks.visible = rPhase > 0.2 && out < 1;
  }

  dispose() {
    disposeGeometries(this.group);
    this.inks.dispose();
  }
}

const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const V3 = new THREE.Vector3();
const V4 = new THREE.Vector3();
