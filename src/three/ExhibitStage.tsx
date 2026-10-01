import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useInView } from "../hooks/useInView";
import { cssThreeColor, onThemeChange } from "./lib/css";
import { AgentExhibit } from "./exhibits/agent";
import { InspectionExhibit } from "./exhibits/inspection";
import { pointScale, type Exhibit, type Palette } from "./exhibits/kit";
import { RetrievalExhibit } from "./exhibits/retrieval";
import { RoverExhibit } from "./exhibits/rover";
import { WearableExhibit } from "./exhibits/wearable";

type Props = {
  /** Index of the project being read (matches `projects` order). */
  active: number;
  /** HUD container; the live read-out goes into its [data-hud="exhibit"]. */
  hudRef: RefObject<HTMLDivElement | null>;
};

const FOV = 30;

/**
 * The Work stage: one canvas, five line-drawn exhibits. The active one is
 * drawn in (pen-style) after the previous one has drawn out; the camera
 * reframes and orbits a little with the pointer.
 */
export default function ExhibitStage(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, "160px");
  return (
    <div ref={wrap} className="exhibit-canvas" aria-hidden>
      <Canvas
        flat
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 0.1, far: 80, position: [5, 3.5, 6] }}
        frameloop={inView ? "always" : "never"}
      >
        <Stage {...props} />
      </Canvas>
    </div>
  );
}

function Stage({ active, hudRef }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const exhibits = useMemo<Exhibit[]>(
    () => [
      new AgentExhibit(),
      new RetrievalExhibit(),
      new InspectionExhibit(),
      new RoverExhibit(),
      new WearableExhibit(),
    ],
    [],
  );
  const st = useRef({
    presence: exhibits.map(() => 0),
    pointer: new THREE.Vector2(),
    pointerAt: -1e9,
    t: 0,
    az: 0,
    el: 0,
    target: exhibits[0].frame.target,
    dist: exhibits[0].frame.distance,
    elev: exhibits[0].frame.elevation ?? 0.4,
    azim: exhibits[0].frame.azimuth ?? 0.7,
    hud: 0,
  });

  useEffect(() => () => exhibits.forEach((e) => e.dispose()), [exhibits]);

  // Theme tokens → every exhibit's inks.
  useEffect(() => {
    const apply = () => {
      const p: Palette = {
        ink: cssThreeColor("var(--ink)"),
        faint: cssThreeColor("var(--faint)"),
        line: cssThreeColor("var(--line)"),
        accent: cssThreeColor("var(--accent)"),
        bg: cssThreeColor("var(--bg)"),
      };
      exhibits.forEach((e) => e.setPalette(p));
    };
    apply();
    return onThemeChange(apply);
  }, [exhibits]);

  // Pointer over the stage, in NDC.
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
        st.current.pointer.set(x, y);
        st.current.pointerAt = performance.now();
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  // Node sprites are sized in world units.
  useEffect(() => {
    pointScale.value =
      (size.height * gl.getPixelRatio()) / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  }, [size.height, gl]);

  useFrame((_, rawDt) => {
    // Bounded steps keep timelines honest on slow GPUs without exploding.
    const dt = Math.min(rawDt, 0.25);
    const s = st.current;
    s.t += dt;
    const live = performance.now() - s.pointerAt < 3000;
    const ctx = { dt, pointer: live ? s.pointer : null };

    // Hand-off: the outgoing exhibit draws out before the next draws in.
    const others = Math.max(0, ...s.presence.filter((_, i) => i !== active));
    exhibits.forEach((ex, i) => {
      const target = i === active && others < 0.25 ? 1 : 0;
      s.presence[i] += (target - s.presence[i]) * (1 - Math.exp(-dt * (target ? 2.2 : 6)));
      if (!target && s.presence[i] < 0.004) s.presence[i] = 0;
      ex.setPresence(s.presence[i]);
      if (ex.group.visible) ex.update(ctx);
    });

    // Frame the active exhibit; narrow stages pull the camera back.
    const f = exhibits[active].frame;
    const k = 1 - Math.exp(-dt * 2.2);
    s.target += (f.target - s.target) * k;
    s.dist += (f.distance - s.dist) * k;
    s.elev += ((f.elevation ?? 0.4) - s.elev) * k;
    s.azim += ((f.azimuth ?? 0.7) - s.azim) * k;
    const fit = Math.max(1, 1.12 / (size.width / size.height));
    const follow = 1 - Math.exp(-dt * 3);
    s.az += ((live ? s.pointer.x * 0.24 : Math.sin(s.t * 0.13) * 0.12) - s.az) * follow;
    s.el += ((live ? s.pointer.y * 0.09 : 0) - s.el) * follow;
    const az = s.azim + s.az;
    const el = s.elev + s.el;
    const d = s.dist * fit;
    camera.position.set(
      Math.sin(az) * Math.cos(el) * d,
      s.target + Math.sin(el) * d,
      Math.cos(az) * Math.cos(el) * d,
    );
    camera.lookAt(0, s.target, 0);

    s.hud += dt;
    if (s.hud > 0.15) {
      s.hud = 0;
      const node = hudRef.current?.querySelector('[data-hud="exhibit"]');
      const text = exhibits[active].readout();
      if (node && node.textContent !== text) node.textContent = text;
    }
  });

  return (
    <>
      {exhibits.map((e, i) => (
        <primitive key={i} object={e.group} />
      ))}
    </>
  );
}
