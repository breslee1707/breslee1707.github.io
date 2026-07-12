import { useCallback, useEffect, useRef, useState } from "react";
import { FastForward, Play, RotateCcw } from "lucide-react";
import {
  agentIntro,
  demoTasks,
  graphEdges,
  graphNodes,
  type AgentNode,
  type StepKind,
  type TraceStep,
} from "../data/agentDemo";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** ms between typed chunks; per-kind chunk sizes give distinct rhythms. */
const TICK = 24;
const CHUNK: Record<StepKind, number> = {
  plan: 2,
  tool: 4,
  obs: 5,
  reflect: 2,
  answer: 2,
};
/** Pause before a step starts streaming (the "thinking" beat). */
const GAP: Record<StepKind, number> = {
  plan: 500,
  tool: 550,
  obs: 350,
  reflect: 750,
  answer: 900,
};

const KIND_META: Record<StepKind, { badge: string; cls: string }> = {
  plan: { badge: "plan", cls: "text-accent" },
  tool: { badge: "tool", cls: "text-ink" },
  obs: { badge: "obs", cls: "text-muted" },
  reflect: { badge: "critic", cls: "text-accent" },
  answer: { badge: "answer", cls: "text-accent" },
};

type Playback = {
  /** -1 = not started; steps.length = finished. */
  stepIdx: number;
  chars: number;
  running: boolean;
};

const IDLE: Playback = { stepIdx: -1, chars: 0, running: false };

export function AgentLab() {
  const [taskId, setTaskId] = useState(demoTasks[0].id);
  const [pb, setPb] = useState<Playback>(IDLE);
  const [fast, setFast] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  const task = demoTasks.find((t) => t.id === taskId) ?? demoTasks[0];
  const steps = task.steps;
  const finished = pb.stepIdx >= steps.length;
  const current: TraceStep | undefined = steps[pb.stepIdx];

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Playback engine: one timer per (step, streaming|gap) phase.
  useEffect(() => {
    if (!pb.running || finished) return;

    // Reduced motion: print the whole trace at once.
    if (reducedRef.current) {
      setPb({ stepIdx: steps.length, chars: 0, running: false });
      return;
    }

    const speed = fast ? 3 : 1;

    if (pb.stepIdx === -1) {
      const t = window.setTimeout(
        () => setPb((p) => ({ ...p, stepIdx: 0, chars: 0 })),
        400 / speed,
      );
      return () => window.clearTimeout(t);
    }

    const step = steps[pb.stepIdx];
    if (pb.chars < step.text.length) {
      const t = window.setTimeout(
        () =>
          setPb((p) => ({
            ...p,
            chars: Math.min(p.chars + CHUNK[step.kind] * speed, step.text.length),
          })),
        TICK,
      );
      return () => window.clearTimeout(t);
    }

    const next = pb.stepIdx + 1;
    const gap = next < steps.length ? GAP[steps[next].kind] : 300;
    const t = window.setTimeout(
      () =>
        setPb((p) => ({
          stepIdx: next,
          chars: 0,
          running: next < steps.length ? p.running : false,
        })),
      gap / speed,
    );
    return () => window.clearTimeout(t);
  }, [pb, fast, steps, finished]);

  // Keep the console pinned to the newest line while streaming.
  useEffect(() => {
    const el = consoleRef.current;
    if (el && pb.stepIdx >= 0) el.scrollTop = el.scrollHeight;
  }, [pb]);

  const run = useCallback(() => setPb({ stepIdx: -1, chars: 0, running: true }), []);
  const skip = useCallback(
    () => setPb({ stepIdx: steps.length, chars: 0, running: false }),
    [steps.length],
  );
  const pickTask = useCallback((id: string) => {
    setTaskId(id);
    setPb(IDLE);
  }, []);

  const started = pb.stepIdx >= 0 || pb.running;
  const activeNode: AgentNode | null =
    pb.running && current ? current.node : finished ? "answer" : null;
  const doneNodes = new Set<AgentNode>(
    steps.slice(0, Math.max(pb.stepIdx, 0)).map((s) => s.node),
  );

  return (
    <Section
      id="agent-lab"
      index="04"
      label="Agent Lab"
      title={agentIntro.title}
      intro={agentIntro.lede}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        {/* ---- Left: task picker + controls ---- */}
        <Reveal className="flex flex-col">
          <div className="flex h-full flex-col rounded-lg border border-line bg-surface">
            <p className="border-b border-line px-6 py-4 label">
              01 · Pick a task
            </p>
            <ul>
              {demoTasks.map((t) => {
                const selected = t.id === taskId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => pickTask(t.id)}
                      aria-pressed={selected}
                      className={`group flex w-full items-baseline gap-4 border-b border-line px-6 py-5 text-left transition-colors duration-200 ${
                        selected ? "bg-raise" : "hover:bg-raise/60"
                      }`}
                    >
                      <span
                        className={`mt-1 size-2 shrink-0 rounded-full transition-colors ${
                          selected ? "bg-accent" : "bg-line group-hover:bg-faint"
                        }`}
                        aria-hidden
                      />
                      <span>
                        <span className="block font-display text-lg tracking-[-0.01em]">
                          {t.title}
                        </span>
                        <span className="mt-1 block text-sm text-faint">
                          {t.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center gap-3 px-6 py-5">
              <button
                type="button"
                onClick={run}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {started ? <RotateCcw size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                {started ? "Replay" : "Run agent"}
              </button>
              {pb.running ? (
                <button
                  type="button"
                  onClick={skip}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 font-mono text-sm text-muted transition-colors hover:border-accent hover:text-ink"
                >
                  <FastForward size={15} aria-hidden />
                  Skip
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setFast((f) => !f)}
                aria-pressed={fast}
                className={`ml-auto rounded-full border px-4 py-2.5 font-mono text-sm transition-colors ${
                  fast
                    ? "border-accent text-accent"
                    : "border-line text-faint hover:text-muted"
                }`}
              >
                {fast ? "3×" : "1×"}
              </button>
            </div>

            <p className="mt-auto border-t border-line px-6 py-4 text-xs text-faint">
              Scripted replay of real agent traces — no model calls, no data
              leaves this page. The production versions run on LangGraph with
              guardrails and trajectory-level evals.
            </p>
          </div>
        </Reveal>

        {/* ---- Right: agent graph + trace console ---- */}
        <Reveal delay={90} className="flex flex-col">
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
            {/* Graph */}
            <div className="border-b border-line px-4 pb-3 pt-4 md:px-6">
              <AgentGraph active={activeNode} done={doneNodes} running={pb.running} />
            </div>

            {/* Console */}
            <div
              ref={consoleRef}
              role="log"
              aria-label="Agent trace"
              aria-busy={pb.running}
              className="agent-console h-[21rem] overflow-y-auto scroll-smooth px-5 py-4 font-mono text-[0.8rem] leading-relaxed md:h-[23rem] md:px-6"
            >
              <p className="text-faint">
                <span className="text-accent">$</span> task: {task.prompt}
              </p>

              {!started ? (
                <div className="mt-4 space-y-1.5 text-faint">
                  {agentIntro.idleLines.map((l) => (
                    <p key={l}>// {l}</p>
                  ))}
                </div>
              ) : null}

              {steps.map((step, i) => {
                if (i > pb.stepIdx) return null;
                const streaming = i === pb.stepIdx && pb.chars < step.text.length;
                const text = i === pb.stepIdx ? step.text.slice(0, pb.chars) : step.text;
                return (
                  <TraceLine
                    key={`${task.id}-${i}`}
                    step={step}
                    text={text}
                    streaming={streaming}
                  />
                );
              })}

              {finished ? (
                <p className="mt-4 text-faint">
                  // trace complete · {steps.length} steps ·{" "}
                  {steps.filter((s) => s.kind === "tool").length} tool calls
                </p>
              ) : null}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 label md:px-6">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${
                    pb.running
                      ? "bg-accent animate-pulse motion-reduce:animate-none"
                      : finished
                        ? "bg-accent"
                        : "bg-faint"
                  }`}
                  aria-hidden
                />
                {pb.running
                  ? `running · step ${Math.min(pb.stepIdx + 1, steps.length)}/${steps.length}`
                  : finished
                    ? "done"
                    : "idle"}
              </span>
              <span className="text-faint">agent.trace</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function TraceLine({
  step,
  text,
  streaming,
}: {
  step: TraceStep;
  text: string;
  streaming: boolean;
}) {
  const meta = KIND_META[step.kind];
  return (
    <div
      className={`mt-4 ${step.kind === "answer" ? "border-t border-line pt-4" : ""}`}
    >
      <p className="flex items-baseline gap-2">
        <span
          className={`shrink-0 rounded border border-line px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] ${meta.cls}`}
        >
          {meta.badge}
        </span>
        {step.label ? <span className="text-faint">{step.label}</span> : null}
      </p>
      {step.code ? (
        <pre className="mt-1.5 overflow-x-auto rounded bg-bg/70 px-3 py-2 text-[0.74rem] text-muted">
          {text}
          {streaming ? <Caret /> : null}
        </pre>
      ) : (
        <p
          className={`mt-1.5 ${
            step.kind === "answer"
              ? "text-ink"
              : step.kind === "reflect"
                ? "text-muted italic"
                : "text-muted"
          }`}
        >
          {text}
          {streaming ? <Caret /> : null}
        </p>
      )}
    </div>
  );
}

function Caret() {
  return (
    <span
      className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-accent motion-safe:animate-pulse"
      aria-hidden
    />
  );
}

/** Horizontal node graph; the active node glows, traversed edges flow. */
function AgentGraph({
  active,
  done,
  running,
}: {
  active: AgentNode | null;
  done: Set<AgentNode>;
  running: boolean;
}) {
  // Layout on a 560×72 canvas, nodes evenly spaced.
  const xs = [52, 166, 280, 394, 508];
  const y = 30;

  const pos = Object.fromEntries(
    graphNodes.map((n, i) => [n.id, xs[i]]),
  ) as Record<AgentNode, number>;

  return (
    <svg
      viewBox="0 0 560 72"
      className="w-full"
      role="img"
      aria-label="Agent loop: planner to tools to memory to critic to answer, with a critique loop back to tools"
    >
      {graphEdges.map(([a, b]) => {
        const x1 = pos[a];
        const x2 = pos[b];
        const loop = a === "critic" && b === "tools";
        const traversed =
          (done.has(a) && (done.has(b) || active === b)) || active === a;
        const cls = traversed ? "agent-edge-active" : "agent-edge";
        if (loop) {
          return (
            <path
              key={`${a}-${b}`}
              d={`M ${x1 - 8} ${y + 12} C ${x1 - 60} ${y + 38}, ${x2 + 60} ${y + 38}, ${x2 + 8} ${y + 12}`}
              fill="none"
              strokeDasharray="3 6"
              className={cls}
            />
          );
        }
        return (
          <line
            key={`${a}-${b}`}
            x1={x1 + 34}
            y1={y}
            x2={x2 - 34}
            y2={y}
            className={cls}
          />
        );
      })}

      {graphNodes.map((n) => {
        const x = pos[n.id];
        const isActive = active === n.id && running;
        const isDone = done.has(n.id) || (active === n.id && !running);
        return (
          <g key={n.id}>
            <rect
              x={x - 34}
              y={y - 14}
              width={68}
              height={28}
              rx={14}
              className={
                isActive
                  ? "agent-node-active"
                  : isDone
                    ? "agent-node-done"
                    : "agent-node"
              }
            />
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`agent-node-label ${isActive ? "agent-node-label-active" : ""}`}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
