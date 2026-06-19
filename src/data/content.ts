/**
 * Single source of truth for all portfolio copy.
 * Edit this file to update the site — components read from here.
 */

export const profile = {
  name: "Le Ngoc Gia Huy",
  role: "AI Engineer",
  org: "Intel",
  tagline: "Building intelligent systems with product-grade precision.",
  kicker: "AI Engineer at Intel · since Nov 2025",
  intro:
    "I build RAG applications, robotic inspection systems, autonomous agents, computer vision, and AIoT — moving each one from prototype to dependable, production-minded execution.",
  // Short, scannable positioning chips used in the hero.
  focus: ["RAG systems", "Robotic vision", "AIoT", "Product engineering"],
  portrait: "/assets/portrait.jpg",
  portraitAlt:
    "Le Ngoc Gia Huy seated against a sunlit ochre wall framed by greenery",
  location: "Ho Chi Minh City, Vietnam",
} as const;

/** Cinematic scroll-expand hero — cover photo + an expanding portrait frame. */
export const hero = {
  /** Full-screen background that fades as the portrait grows. */
  cover: "/assets/graduation.jpg",
  /** Name split across the expanding frame (slides apart on scroll). */
  titleLead: "Le Ngoc",
  titleRest: "Gia Huy",
  scrollHint: "Scroll to enter",
} as const;

/** Full-bleed atmospheric moment used as a section divider. */
export const moment = {
  image: "/assets/graduation.jpg",
  imageAlt:
    "Le Ngoc Gia Huy in graduation gown looking up through a sunlit atrium at HCMUTE",
  caption: "Robotics & AI, HCMUTE",
  line: "Where the engineering started.",
} as const;

export type NavItem = { id: string; index: string; label: string };

export const nav: NavItem[] = [
  { id: "intro", index: "01", label: "Intro" },
  { id: "background", index: "02", label: "Background" },
  { id: "work", index: "03", label: "Work" },
  { id: "experience", index: "04", label: "Experience" },
  { id: "toolkit", index: "05", label: "Toolkit" },
  { id: "contact", index: "06", label: "Contact" },
];

/** Background / about — narrative + the discipline cards. */
export const background = {
  lede: "A trajectory from robotics research to applied AI engineering — built on the belief that the work is only finished when it is reliable enough for real users, not just demos.",
  disciplines: [
    {
      key: "AI systems",
      body: "RAG pipelines, prompt design, embeddings, vector databases, reranking, evaluation loops, and OpenAI model integration.",
    },
    {
      key: "Vision & robotics",
      body: "Computer vision, inspection workflows, robotic simulation, kinematics, ROS, Gazebo, and sensor-driven automation.",
    },
    {
      key: "Founder execution",
      body: "Co-founder at Code4life® — technical delivery, product thinking, community building, and practical AI education.",
    },
  ],
} as const;

/** Recognition signals. */
export const awards = [
  {
    title: "1st Prize — 40,000,000 VND",
    meta: "Advantech AIoT InnoWorks 2022",
    body: "Recognized for an AIoT application concept using Wise-PaaS, sensor data, and applied intelligence to monitor and improve environmental conditions.",
    tags: ["AIoT", "Wise-PaaS", "Competition"],
    image: "/assets/award-aiot.jpg",
    imageAlt:
      "Le Ngoc Gia Huy holding the AIoT InnoWorks 2022 champion trophy and first-prize board",
  },
  {
    title: "Top Graduation Project Score",
    meta: "HCMUTE · Robotics and AI",
    body: "Awarded the highest graduation project score in the Robotics and AI program for semester 2 of 2024–2025.",
    tags: ["Graduation project", "Robotics & AI", "Academic"],
    image: "/assets/award-graduation.jpg",
    imageAlt:
      "Certificate for the highest graduation project score in Robotics and AI, semester 2 2024–2025",
  },
] as const;

/** Selected work. */
export type ProjectMotif = "agent" | "graph" | "arm" | "vehicle" | "sensor";

export type Project = {
  title: string;
  meta: string;
  body: string;
  tags: string[];
  /** Domain line-art rendered faintly behind the row (see ProjectMotif.tsx). */
  motif: ProjectMotif;
  /** Optional small accent label (e.g. an active focus). */
  status?: string;
};

export const projects: Project[] = [
  {
    title: "Agentic AI Systems",
    meta: "LLM agents & orchestration",
    body: "Autonomous LLM agents that plan, call tools, and act across multi-step workflows — built with orchestration graphs, memory, guardrails, and evaluation loops so agent behavior stays reliable enough for production, not just demos.",
    tags: ["LangGraph", "Tool-calling", "Planning", "Multi-agent", "MCP"],
    motif: "agent",
    status: "Currently building",
  },
  {
    title: "Agentic Document QA",
    meta: "Agentic RAG & retrieval",
    body: "A LangGraph-orchestrated agent that plans retrieval, calls search and reranking tools, and adapts across multi-step queries — over document ingestion, semantic chunking, Qdrant vector search, Supabase metadata, and OpenAI models.",
    tags: ["LangGraph", "Tool-calling", "Qdrant", "OpenAI API"],
    motif: "graph",
  },
  {
    title: "AI-Based Robotic Arm Inspection",
    meta: "Computer vision & robotics",
    body: "An inspection workflow combining PyTorch and TensorFlow models, OpenCV, RobotStudio simulation, MATLAB/Simulink kinematics, Inventor assembly, and real-time C# socket communication.",
    tags: ["PyTorch", "OpenCV", "RobotStudio", "C#"],
    motif: "arm",
  },
  {
    title: "Autonomous 3-Wheeled Vehicle",
    meta: "Reinforcement learning & ROS",
    body: "An autonomous navigation prototype built with LIDAR, Gazebo simulation, ROS, reinforcement learning, and path-planning workflows.",
    tags: ["ROS", "Gazebo", "LIDAR", "RL"],
    motif: "vehicle",
  },
  {
    title: "Supermarket Air Monitoring",
    meta: "AIoT & applied intelligence",
    body: "An AIoT concept around environmental monitoring, sensor data, and applied intelligence — recognized with first prize at Advantech AIoT InnoWorks 2022.",
    tags: ["AIoT", "Sensors", "Applied AI"],
    motif: "sensor",
  },
];

/** Experience timeline (most recent first). */
export type Logo =
  | { type: "icon"; slug: string; hex?: string }
  | { type: "img"; src: string };

export type Role = {
  date: string;
  title: string;
  org: string;
  body: string;
  current?: boolean;
  logo?: Logo;
};

export const experience: Role[] = [
  {
    date: "Nov 2025 — present",
    title: "AI Engineer",
    org: "Intel",
    body: "Applied AI engineering, automation, and intelligent systems in a production-minded environment.",
    current: true,
    logo: { type: "icon", slug: "intel", hex: "0071C5" },
  },
  {
    date: "2025 — present",
    title: "Co-founder",
    org: "Code4life®",
    body: "Building learning and technology initiatives around practical coding, AI literacy, and software craft.",
    logo: { type: "img", src: "/assets/logos/code4life.jpg" },
  },
  {
    date: "Aug 2024 — Feb 2025",
    title: "AI / RAG Engineer",
    org: "RegenX",
    body: "Built a document question-answering system using RAG, Qdrant vector search, Supabase metadata, semantic chunking, reranking, and OpenAI models for internal company documents.",
    logo: { type: "img", src: "/assets/logos/regenx.jpg" },
  },
  {
    date: "Jan 2024 — Jul 2024",
    title: "AI Robotics Intern",
    org: "ABB Robotics",
    body: "Developed an AI-based robotic arm inspection workflow with Autodesk Inventor, MATLAB/Simulink, PyTorch, TensorFlow, OpenCV, RobotStudio, and real-time C# socket communication.",
    logo: { type: "img", src: "/assets/logos/abb.jpg" },
  },
  {
    date: "2024 — 2025",
    title: "Robotics & AI",
    org: "HCMUTE",
    body: "Graduation-level work recognized with the highest project score in the major for semester 2 of 2024–2025.",
    logo: { type: "img", src: "/assets/logos/hcmute.png" },
  },
];

/** Toolkit — grouped competencies. */
export const toolkit = [
  {
    group: "AI engineering",
    items: ["RAG pipelines", "LangGraph", "Prompt design", "Embeddings", "Vector DBs", "Reranking", "Eval loops", "OpenAI API"],
  },
  {
    group: "Vision & robotics",
    items: ["PyTorch", "TensorFlow", "OpenCV", "ROS", "Gazebo", "RobotStudio", "Kinematics"],
  },
  {
    group: "Data & infra",
    items: ["Qdrant", "Supabase", "Python", "C#", "MATLAB/Simulink", "Socket I/O"],
  },
  {
    group: "Edge & AIoT",
    items: ["TFLite", "TFLite Micro", "OpenVINO", "ONNX Runtime", "Wise-PaaS", "Sensors"],
  },
] as const;

export const contact = {
  lede: "Open to conversations on AI engineering, RAG applications, computer vision, robotics, AI product strategy, and founder-led technical work.",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/lengocgiahuy1810/", handle: "in/lengocgiahuy1810", primary: true },
    { label: "GitHub", href: "https://github.com/breslee1707", handle: "@breslee1707" },
    { label: "TikTok", href: "https://www.tiktok.com/@huyg.ai", handle: "@huyg.ai" },
  ],
} as const;

export const site = {
  volume: "Vol. 01 / '26",
  copyright: "Le Ngoc Gia Huy",
} as const;
