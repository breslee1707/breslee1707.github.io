import {
  siPytorch,
  siTensorflow,
  siOpencv,
  siRos,
  siPython,
  siSupabase,
  siQdrant,
  siOnnx,
  siLanggraph,
  siIntel,
} from "simple-icons";
import {
  Workflow,
  MessageSquareText,
  Boxes,
  Database,
  ListOrdered,
  Repeat,
  Box,
  Bot,
  Waypoints,
  Cable,
  Cpu,
  Cloud,
  RadioTower,
  Radar,
  Target,
  Network,
  BrainCircuit,
  Wrench,
  ListChecks,
  Users,
  Plug,
  type LucideIcon,
} from "lucide-react";

export type TechIcon = {
  title: string;
  /** Brand hex (no #). Omitted for full-colour image icons. */
  hex?: string;
  /** Single-path glyph (rendered monochrome → brand on hover). */
  path?: string;
  /** SVG viewBox for the path (simple-icons use 24). */
  viewBox?: string;
  /** Full-colour image source — rendered as-is (e.g. MATLAB). */
  img?: string;
  /** Lucide line icon for concepts with no brand logo (→ accent on hover). */
  Comp?: LucideIcon;
};

/** Concept labels (no brand logo) get a fitting lucide line icon. */
const concept = (title: string, Comp: LucideIcon): TechIcon => ({ title, Comp });

// OpenAI is not shipped in simple-icons — use the official logomark.
const openai: TechIcon = {
  title: "OpenAI",
  hex: "10A37F",
  path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
};

// C# — devicon csharp-plain (single path, 128 viewBox). Microsoft purple.
const csharp: TechIcon = {
  title: "C#",
  hex: "68217A",
  viewBox: "0 0 128 128",
  path: "M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c.1-.8 0-1.7-.4-2.6zm-53.5 70c-21.8 0-39.5-17.7-39.5-39.5S42.2 24.5 64 24.5c14.7 0 27.5 8.1 34.3 20l-13 7.5C81.1 44.5 73.1 39.5 64 39.5c-13.5 0-24.5 11-24.5 24.5s11 24.5 24.5 24.5c9.1 0 17.1-5 21.3-12.4l12.9 7.6c-6.8 11.8-19.6 19.8-34.2 19.8zM115 62h-3.2l-.9 4h4.1v5h-5l-1.2 6h-4.9l1.2-6h-3.8l-1.2 6h-4.8l1.2-6H94v-5h3.5l.9-4H94v-5h5.3l1.2-6h4.9l-1.2 6h3.8l1.2-6h4.8l-1.2 6h2.2v5zm-12.7 4h3.8l.9-4h-3.8z",
};

// MATLAB — full-colour logo (no clean monochrome form).
const matlab: TechIcon = { title: "MATLAB", img: "/assets/logos/matlab.svg" };

/** Normalised label → brand icon. Labels without an entry stay text-only. */
const MAP: Record<string, TechIcon> = {
  pytorch: siPytorch,
  tensorflow: siTensorflow,
  tflite: siTensorflow,
  tflitemicro: siTensorflow,
  opencv: siOpencv,
  ros: siRos,
  python: siPython,
  supabase: siSupabase,
  qdrant: siQdrant,
  onnx: siOnnx,
  onnxruntime: siOnnx,
  langgraph: siLanggraph,
  intel: siIntel,
  openai,
  openaiapi: openai,
  csharp,
  matlab,
  matlabsimulink: matlab,
  // Concepts (no brand logo) → lucide line icons.
  ragpipelines: concept("RAG pipelines", Workflow),
  promptdesign: concept("Prompt design", MessageSquareText),
  embeddings: concept("Embeddings", Boxes),
  vectordbs: concept("Vector DBs", Database),
  reranking: concept("Reranking", ListOrdered),
  evalloops: concept("Eval loops", Repeat),
  gazebo: concept("Gazebo", Box),
  robotstudio: concept("RobotStudio", Bot),
  kinematics: concept("Kinematics", Waypoints),
  socketio: concept("Socket I/O", Cable),
  openvino: concept("OpenVINO", Cpu),
  wisepaas: concept("Wise-PaaS", Cloud),
  sensors: concept("Sensors", RadioTower),
  // Remaining Work-tag concepts, for a consistent look across the site.
  lidar: concept("LIDAR", Radar),
  rl: concept("RL", Target),
  aiot: concept("AIoT", Network),
  appliedai: concept("Applied AI", BrainCircuit),
  // Agentic concepts.
  toolcalling: concept("Tool-calling", Wrench),
  planning: concept("Planning", ListChecks),
  multiagent: concept("Multi-agent", Users),
  mcp: concept("MCP", Plug),
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/#/g, "sharp")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]/g, "");

export function getTechIcon(label: string): TechIcon | null {
  return MAP[norm(label)] ?? null;
}
