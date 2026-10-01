import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { hero, profile } from "../data/content";
import { useInView } from "../hooks/useInView";
import { segment } from "../hooks/useScrollProgress";
import { cssVec3, isLightTheme, onThemeChange } from "./lib/css";
import { loadPixels } from "./lib/pixels";
import { LaserFan } from "./laserFan";
import { PortraitCloud } from "./portraitCloud";
import { RobotArm } from "./robotArm";

type Props = {
  /** The DOM frame the cloud is laid over (kept in sync every frame). */
  frameRef: RefObject<HTMLDivElement | null>;
  /** Container of the [data-hud] read-outs. */
  hudRef: RefObject<HTMLDivElement | null>;
  /** Hero scroll progress 0→1, written by useScrollProgress. */
  progress: RefObject<number>;
  paused: boolean;
  /** Fired after the first frame with the cloud in place. */
  onReady: () => void;
};

const FOV = 28;

/**
 * Hero "Scan 01": a six-axis arm sweeps a line laser over the portrait,
 * resolving rows of raw sensor noise into a depth-mapped point cloud.
 * World units are CSS pixels on the z = 0 plane, so the cloud can sit
 * exactly over the DOM frame (which still holds the real <img>).
 */
export default function HeroScan(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);

  return (
    <div ref={wrap} className="hero-canvas" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NeutralToneMapping,
        }}
        camera={{ fov: FOV, near: 10, far: 20000, position: [0, 0, 1600] }}
        frameloop={props.paused || !inView ? "never" : "always"}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

function Scene({ frameRef, hudRef, progress, onReady }: Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const [cloud, setCloud] = useState<PortraitCloud | null>(null);
  const arm = useMemo(() => new RobotArm("studio"), []);
  const fan = useMemo(() => new LaserFan(), []);
  const st = useRef({
    t: 0,
    ready: false,
    pointer: new THREE.Vector2(-1e4, -1e4),
    lastPointer: -1e9,
    idle: 0,
    laserU: 0.5,
    laserV: -0.05,
    prevV: -0.05,
    laserOn: 0,
    rotX: 0,
    rotY: 0,
    hud: 0,
  });

  // World units = CSS pixels at z = 0.
  useLayoutEffect(() => {
    const dist = size.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.position.set(0, 0, dist);
    camera.near = dist * 0.05;
    camera.far = dist * 6;
    camera.updateProjectionMatrix();
  }, [camera, size.height]);

  // Studio reflections from a procedural room — no HDR download.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  // Photo + segmented depth → the cloud. Fewer points on small screens.
  useEffect(() => {
    let alive = true;
    const vw = window.innerWidth;
    const cols = vw < 700 ? 150 : vw < 1200 ? 190 : 240;
    const rows = Math.round(cols / 0.7467);
    Promise.all([
      loadPixels(profile.portrait, cols, rows),
      loadPixels(hero.depth, cols, rows),
    ])
      .then(([photo, depth]) => {
        if (alive) setCloud(new PortraitCloud(photo.data, depth.data, photo.image, cols, rows));
      })
      .catch(() => {
        /* the photo simply stays in place */
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => cloud?.dispose(), [cloud]);
  useEffect(
    () => () => {
      arm.dispose();
      fan.dispose();
    },
    [arm, fan],
  );

  // Accent follows the theme.
  useEffect(() => {
    const apply = () => {
      const accent = cssVec3("var(--accent)");
      cloud?.uniforms.uAccent.value.copy(accent);
      fan.setColor(accent, isLightTheme());
      arm.glowMaterial.color.setRGB(accent.x, accent.y, accent.z, THREE.SRGBColorSpace);
    };
    apply();
    return onThemeChange(apply);
  }, [cloud, arm, fan]);

  // Mouse drives the laser while it's over the stage.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      st.current.pointer.set(e.clientX, e.clientY);
      st.current.lastPointer = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, rawDt) => {
    const frame = frameRef.current;
    if (!cloud || !frame) return;
    // Timeline runs on the wall clock so the opening sweep keeps its pace
    // even on slow GPUs; physics just takes bigger (bounded) steps.
    const dt = Math.min(rawDt, 0.25);
    const s = st.current;
    s.t += Math.min(rawDt, 1);

    const p = progress.current ?? 0;
    const pScan = segment(p, 0, 0.26);
    const pResolve = segment(p, 0.16, 0.36);
    const W = size.width;
    const H = size.height;

    // 1) Lay the cloud over the DOM frame.
    const fr = frame.getBoundingClientRect();
    const cr = gl.domElement.getBoundingClientRect();
    const cx = fr.left + fr.width / 2 - cr.left - W / 2;
    const cy = -(fr.top + fr.height / 2 - cr.top - H / 2);
    const u = cloud.uniforms;
    const amp = fr.width * 0.34;
    u.uSize.value.set(fr.width, fr.height);
    u.uDepthAmp.value = amp;
    u.uPointSize.value = fr.width / cloud.cols;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uCamDist.value = camera.position.z;
    u.uTime.value = s.t;
    u.uResolve.value = pResolve;
    cloud.points.position.set(cx, cy, 0);

    // 2) Laser: opening sweep → follow the mouse → slow idle passes.
    const now = performance.now();
    const pointerActive =
      now - s.lastPointer < 2500 &&
      s.pointer.x >= cr.left &&
      s.pointer.x <= cr.right &&
      s.pointer.y >= cr.top &&
      s.pointer.y <= cr.bottom;
    const INTRO = 3.3;
    let tv: number;
    let tu: number;
    let on: number;
    if (s.t < INTRO) {
      const k = smoother(clamp((s.t - 0.6) / 2.5));
      tv = -0.04 + k * 1.08;
      tu = 0.5 + 0.22 * Math.sin(s.t * 2.1);
      on = s.t > 0.6 ? 1 : 0;
    } else if (pointerActive) {
      tv = clamp((s.pointer.y - fr.top) / fr.height, -0.03, 1.03);
      tu = clamp((s.pointer.x - fr.left) / fr.width, 0.04, 0.96);
      on = 1;
      s.idle = 0;
    } else {
      s.idle += dt;
      const cyc = s.idle % 8;
      const k = smoother(clamp((cyc - 1.4) / 3.4));
      tv = -0.04 + k * 1.08;
      tu = 0.5 + 0.25 * Math.sin(s.t * 0.9);
      on = cyc > 1.4 && cyc < 4.9 ? 1 : 0;
    }
    const follow = 1 - Math.exp(-dt * 9);
    s.laserV += (tv - s.laserV) * follow;
    s.laserU += (tu - s.laserU) * follow;
    s.laserOn += (on * (1 - pScan) - s.laserOn) * (1 - Math.exp(-dt * 10));
    if (s.laserOn > 0.5) cloud.sweep(s.prevV, s.laserV);
    s.prevV = s.laserV;
    cloud.update(dt, pScan);
    u.uLaser.value.set(s.laserU, s.laserV, s.laserOn);

    // 3) Tilt toward the pointer; settle flat to hand over to the photo.
    const nx = pointerActive ? (s.pointer.x / window.innerWidth) * 2 - 1 : Math.sin(s.t * 0.33) * 0.45;
    const ny = pointerActive ? (s.pointer.y / window.innerHeight) * 2 - 1 : 0;
    const keep = 1 - pResolve;
    const ease = 1 - Math.exp(-dt * 3);
    s.rotY += (nx * 0.22 * keep - s.rotY) * ease;
    s.rotX += (ny * 0.09 * keep - s.rotX) * ease;
    cloud.points.rotation.set(s.rotX, s.rotY, 0);
    u.uTilt.value.set(Math.abs(Math.sin(s.rotY)), Math.abs(Math.sin(s.rotX)));
    cloud.points.updateMatrixWorld();

    const surface = (uu: number, vv: number, out: THREE.Vector3) =>
      cloud.points.localToWorld(
        out.set(
          (uu - 0.5) * fr.width,
          (0.5 - vv) * fr.height,
          (cloud.depthAt(uu, clamp(vv)) - 0.3) * amp * keep,
        ),
      );

    // 4) The arm stands off to the right; it parks and sinks as you scroll.
    // The arm needs a landscape stage with room beside the frame.
    const armOn = W >= 980 && W / H > 1.1;
    arm.group.visible = armOn;
    if (armOn) {
      const S = clamp(H * 0.37, 250, 420);
      const right = cx + fr.width / 2;
      const baseX = Math.max(right + 0.95 * S, W / 2 - 0.62 * S);
      arm.group.scale.setScalar(S);
      arm.group.position.set(baseX, -H / 2 + 0.16 * S - pScan * pScan * 2.8 * S, 0.12 * S);
      arm.group.rotation.y = Math.PI;
      arm.group.updateMatrixWorld(true);

      const hit = surface(s.laserU, s.laserV, V_HIT);
      if (pScan > 0.35) {
        arm.park();
      } else {
        V_WRIST.set(
          right + 0.42 * S + (hit.x - cx) * 0.18,
          cy + (hit.y - cy) * 0.5 - 0.02 * S,
          0.36 * S,
        );
        arm.reach(V_WRIST, hit);
      }
      arm.update(dt);
    }

    // 5) Light sheet from the aperture to the stripe across the frame.
    if (armOn && s.laserOn > 0.01 && s.laserV > -0.02 && s.laserV < 1.02) {
      arm.emitter.getWorldPosition(V_EMIT);
      fan.set(V_EMIT, surface(0.01, s.laserV, V_A), surface(0.99, s.laserV, V_B), s.laserOn);
    } else {
      fan.hide();
    }

    // 6) Read-outs, ~10 Hz.
    s.hud += dt;
    if (s.hud > 0.1) {
      s.hud = 0;
      writeHud(hudRef.current, cloud, s.laserOn > 0.3 ? s.laserV : null, armOn ? arm.readout() : null);
    }

    if (!s.ready) {
      s.ready = true;
      onReady();
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[-0.5, 1, 0.9]} intensity={2.3} />
      <directionalLight position={[1, 0.3, -0.6]} intensity={1.5} color="#ffd6a0" />
      <primitive object={arm.group} />
      {cloud ? <primitive object={cloud.points} /> : null}
      <primitive object={fan.mesh} />
    </>
  );
}

const V_HIT = new THREE.Vector3();
const V_WRIST = new THREE.Vector3();
const V_EMIT = new THREE.Vector3();
const V_A = new THREE.Vector3();
const V_B = new THREE.Vector3();

const signed = (deg: number) =>
  `${deg < 0 ? "−" : "+"}${Math.abs(deg).toFixed(1).padStart(5, "0")}°`;

function writeHud(
  root: HTMLElement | null,
  cloud: PortraitCloud,
  laserV: number | null,
  joints: number[] | null,
) {
  if (!root) return;
  const set = (key: string, text: string) => {
    const el = root.querySelector(`[data-hud="${key}"]`);
    if (el && el.textContent !== text) el.textContent = text;
  };
  const pct = Math.round(cloud.scanned * 100);
  set("pts", `${(cloud.cols * cloud.rows).toLocaleString("en-US")} pts · depth segmented`);
  set("laser", laserV === null ? "Laser idle" : `Laser y ${clamp(laserV).toFixed(3)}`);
  set("scanned", `Scanned ${pct}%`);
  set(
    "joints",
    joints ? `J1 ${signed(joints[0])} J2 ${signed(joints[1])} J3 ${signed(joints[2])}` : "",
  );
}
