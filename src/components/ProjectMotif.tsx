import type { ReactNode } from "react";
import type { ProjectMotif as MotifName } from "../data/content";

type Props = {
  name: MotifName;
  /** Positioning/opacity/mask are owned by the caller via `.project-motif`. */
  className?: string;
};

/**
 * Faint domain line-art rendered behind a Work row. Strokes use `currentColor`
 * so the parent can fade it (line → accent on hover); nodes fill with the page
 * background so edges read as passing behind them. Purely decorative.
 */
export function ProjectMotif({ name, className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden
    >
      {MOTIFS[name]}
    </svg>
  );
}

const node = (x: number, y: number, i: number) => (
  <circle key={`n${i}`} cx={x} cy={y} r={7} fill="var(--color-bg)" />
);

const MOTIFS: Record<MotifName, ReactNode> = {
  // Agent hub orchestrating tools, with a reasoning loop (agentic systems).
  agent: (
    <>
      {/* spokes from the agent hub to its tools */}
      <line x1={150} y1={94} x2={206} y2={48} />
      <line x1={150} y1={94} x2={214} y2={104} />
      <line x1={150} y1={94} x2={168} y2={150} />
      <line x1={150} y1={94} x2={96} y2={122} />
      {/* tool nodes */}
      <rect x={197} y={39} width={18} height={18} rx={4} />
      <rect x={205} y={95} width={18} height={18} rx={4} />
      <rect x={159} y={141} width={18} height={18} rx={4} />
      <rect x={87} y={113} width={18} height={18} rx={4} />
      {/* agent hub */}
      <circle cx={150} cy={94} r={14} fill="var(--color-bg)" />
      <circle cx={150} cy={94} r={4} fill="currentColor" stroke="none" />
      {/* reasoning loop above the hub */}
      <path d="M138 56 A12 12 0 1 1 162 56" />
      <path d="M162 56 l-6 -2 M162 56 l1 7" />
    </>
  ),

  // Knowledge graph — nodes + edges (RAG / document QA).
  graph: (
    <>
      <line x1={70} y1={44} x2={150} y2={32} />
      <line x1={150} y1={32} x2={205} y2={72} />
      <line x1={70} y1={44} x2={120} y2={92} />
      <line x1={150} y1={32} x2={120} y2={92} />
      <line x1={205} y1={72} x2={172} y2={130} />
      <line x1={120} y1={92} x2={172} y2={130} />
      <line x1={120} y1={92} x2={64} y2={120} />
      <line x1={64} y1={120} x2={110} y2={152} />
      <line x1={172} y1={130} x2={110} y2={152} />
      <line x1={120} y1={92} x2={110} y2={152} />
      {(
        [
          [70, 44],
          [150, 32],
          [205, 72],
          [120, 92],
          [64, 120],
          [172, 130],
          [110, 152],
        ] as const
      ).map(([x, y], i) => node(x, y, i))}
    </>
  ),

  // Articulated robotic arm — base, links, joints, gripper.
  arm: (
    <>
      <path d="M88 166 H152" />
      <path d="M100 166 V150 H140 V166" />
      <line x1={120} y1={150} x2={92} y2={104} />
      <line x1={92} y1={104} x2={156} y2={74} />
      <line x1={156} y1={74} x2={190} y2={44} />
      <path d="M190 44 l15 -9 M190 44 l5 17" />
      {node(120, 150, 0)}
      {node(92, 104, 1)}
      {node(156, 74, 2)}
    </>
  ),

  // Top-down vehicle with LIDAR fan + a planned path (autonomous nav).
  vehicle: (
    <>
      <rect x={58} y={86} width={74} height={46} rx={9} />
      <rect x={50} y={92} width={9} height={15} rx={3} />
      <rect x={50} y={111} width={9} height={15} rx={3} />
      <rect x={131} y={92} width={9} height={15} rx={3} />
      <rect x={131} y={111} width={9} height={15} rx={3} />
      <path d="M152 86 A30 30 0 0 1 152 132" />
      <path d="M164 76 A44 44 0 0 1 164 142" />
      <path d="M176 66 A58 58 0 0 1 176 152" />
      <path d="M95 150 Q150 152 234 64" strokeDasharray="2 12" />
    </>
  ),

  // Sensor radiating signal waves with scattered particles (AIoT air monitor).
  sensor: (
    <>
      <path d="M70 110 A30 30 0 0 1 100 140" />
      <path d="M70 90 A50 50 0 0 1 120 140" />
      <path d="M70 70 A70 70 0 0 1 140 140" />
      <path d="M70 50 A90 90 0 0 1 160 140" />
      <circle cx={70} cy={140} r={6} fill="var(--color-bg)" />
      {(
        [
          [150, 60],
          [175, 40],
          [196, 80],
          [165, 96],
          [206, 54],
          [186, 112],
        ] as const
      ).map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r={3} fill="currentColor" stroke="none" />
      ))}
    </>
  ),
};
