/**
 * Scripted traces for the Agent Lab. Each task replays a realistic agentic
 * loop (plan → tool call → observation → reflect → answer) drawn from real
 * systems I've built — no API calls, everything runs in the browser.
 */

export type AgentNode = "planner" | "tools" | "memory" | "critic" | "answer";

export type StepKind = "plan" | "tool" | "obs" | "reflect" | "answer";

export type TraceStep = {
  kind: StepKind;
  /** Which graph node lights up while this step streams. */
  node: AgentNode;
  /** Chip text next to the kind badge (e.g. the tool name). */
  label?: string;
  /** Body streamed into the console. */
  text: string;
  /** Render the body as a preformatted args/JSON block. */
  code?: boolean;
};

export type DemoTask = {
  id: string;
  title: string;
  hint: string;
  /** The user-style request shown at the top of the console. */
  prompt: string;
  steps: TraceStep[];
};

export const agentIntro = {
  title: "Watch an agent think.",
  lede: "A hands-on replay of the agentic loop I build in production — planning, tool calls, observations, self-critique. Pick a task and run it. Scripted traces, zero API calls, everything in your browser.",
  idleLines: [
    "agent runtime ready — LangGraph-style loop",
    "tools registered: vector_search · rerank · web_search · notify",
    "pick a task, then ▸ Run",
  ],
} as const;

export const demoTasks: DemoTask[] = [
  {
    id: "rag",
    title: "Agentic RAG over documents",
    hint: "Multi-step retrieval with reranking and self-critique",
    prompt:
      "What does our leave policy say about carrying unused days into next year?",
    steps: [
      {
        kind: "plan",
        node: "planner",
        text: "The question targets one policy clause. I'll retrieve candidate chunks from the vector store, rerank for precision, then answer strictly from what the documents say — with a citation.",
      },
      {
        kind: "tool",
        node: "tools",
        label: "vector_search",
        code: true,
        text: '{ "query": "carry over unused annual leave next year", "collection": "hr-policies", "top_k": 8 }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "8 chunks returned · top cosine 0.83 · sources: leave-policy-v4.pdf (5), onboarding-faq.md (2), contract-template.docx (1)",
      },
      {
        kind: "tool",
        node: "tools",
        label: "rerank",
        code: true,
        text: '{ "model": "cross-encoder", "candidates": 8, "keep": 3 }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "kept 3 · best: leave-policy-v4.pdf §3.2 \"Carry-over\" (score 0.91)",
      },
      {
        kind: "reflect",
        node: "critic",
        text: "Coverage check: §3.2 answers the cap and the deadline. The FAQ chunk conflicts with v4 — it cites the old 10-day cap, so I discard it and answer from the latest policy only.",
      },
      {
        kind: "answer",
        node: "answer",
        text: "You can carry over up to 5 unused leave days into the next calendar year; they must be used before March 31 or they expire. Source: leave-policy-v4.pdf, §3.2 Carry-over.",
      },
    ],
  },
  {
    id: "research",
    title: "Research & synthesize",
    hint: "Iterative web search that refines its own query",
    prompt:
      "Summarize how teams are evaluating LLM agents in production right now.",
    steps: [
      {
        kind: "plan",
        node: "planner",
        text: "Broad topic — I'll search wide first, spot the recurring themes, then run a narrower follow-up on whichever practice keeps appearing before synthesizing.",
      },
      {
        kind: "tool",
        node: "tools",
        label: "web_search",
        code: true,
        text: '{ "query": "evaluating LLM agents production 2026", "recency_days": 120 }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "9 results · recurring themes: trajectory-level evals, LLM-as-judge on tool traces, offline golden sets, canary tasks",
      },
      {
        kind: "tool",
        node: "tools",
        label: "web_search",
        code: true,
        text: '{ "query": "trajectory evaluation agent tool-call traces golden set", "recency_days": 120 }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "6 results · consensus: grade the whole trajectory, not just the final answer; keep a frozen golden set for regressions",
      },
      {
        kind: "reflect",
        node: "critic",
        text: "Two independent search passes converge on the same three practices — enough agreement to synthesize without a third pass.",
      },
      {
        kind: "answer",
        node: "answer",
        text: "Production teams grade agents at the trajectory level: (1) golden sets of full tool-call traces replayed on every change, (2) LLM-as-judge scoring each step for tool choice and argument quality, and (3) canary tasks in production that alert when success rates drift. The final answer alone is no longer the unit of evaluation — the whole loop is.",
      },
    ],
  },
  {
    id: "robot",
    title: "Robotic inspection triage",
    hint: "Vision defect check that escalates on low confidence",
    prompt:
      "Camera 2 flagged a possible surface defect on part #A-1142 — verify and decide.",
    steps: [
      {
        kind: "plan",
        node: "planner",
        text: "Verify before escalating: re-capture at higher resolution, run the defect classifier, and only page a human if confidence lands in the gray zone between pass and fail thresholds.",
      },
      {
        kind: "tool",
        node: "tools",
        label: "capture_frame",
        code: true,
        text: '{ "camera": "cam-02", "part_id": "A-1142", "resolution": "4k", "lighting": "raking" }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "frame acquired · 4096×2160 · raking light exposes a 2.3 mm linear mark, upper-left quadrant",
      },
      {
        kind: "tool",
        node: "tools",
        label: "classify_defect",
        code: true,
        text: '{ "model": "surface-defect-v3", "crop": "auto", "classes": ["scratch", "dust", "tooling_mark"] }',
      },
      {
        kind: "obs",
        node: "memory",
        text: "scratch 0.62 · tooling_mark 0.31 · dust 0.07 — below the 0.85 auto-reject threshold",
      },
      {
        kind: "reflect",
        node: "critic",
        text: "0.62 is the gray zone: too high to pass, too low to scrap a part automatically. Policy says a human decides — I'll quarantine the part and attach both frames to the ticket.",
      },
      {
        kind: "answer",
        node: "answer",
        text: "Part #A-1142 moved to quarantine, line not stopped. Ticket QA-2287 opened for manual review with the 4K capture, classifier scores (scratch 0.62), and the recommended disposition. Auto-reject was correctly withheld below threshold.",
      },
    ],
  },
];

/** Graph definition — nodes laid out left→right, edges in flow order. */
export const graphNodes: { id: AgentNode; label: string }[] = [
  { id: "planner", label: "Planner" },
  { id: "tools", label: "Tools" },
  { id: "memory", label: "Memory" },
  { id: "critic", label: "Critic" },
  { id: "answer", label: "Answer" },
];

export const graphEdges: [AgentNode, AgentNode][] = [
  ["planner", "tools"],
  ["tools", "memory"],
  ["memory", "critic"],
  ["critic", "answer"],
  // The loop back — critique can trigger another tool pass.
  ["critic", "tools"],
];
