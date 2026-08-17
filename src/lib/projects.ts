export type ProjectId = "project-wifi" | "local-ai" | "clipstash" | "application-intelligence" | "network-lab";

export interface ProjectDefinition {
  id: ProjectId;
  index: string;
  title: string;
  subtitle: string;
  thesis: string;
  stack: string[];
  visibility: "public" | "private";
  href?: string;
}

export const projects: ProjectDefinition[] = [
  {
    id: "project-wifi",
    index: "01",
    title: "Project WiFi",
    subtitle: "Ambient Presence Infrastructure",
    thesis: "A physical occupancy event crosses a voice ecosystem, cloud function, public tunnel, local event bridge, and live interface.",
    stack: ["Alexa", "Lambda", "Node", "SSE", "React"],
    visibility: "private"
  },
  {
    id: "local-ai",
    index: "02",
    title: "Local AI",
    subtitle: "Private retrieval over local files",
    thesis: "A local-first search system that can continue in metadata mode when vector infrastructure is unavailable.",
    stack: ["FastAPI", "Ollama", "Chroma", "Python"],
    visibility: "public",
    href: "https://github.com/vamshidharreddye/llmlocalai"
  },
  {
    id: "clipstash",
    index: "03",
    title: "ClipStash",
    subtitle: "Native clipboard history for macOS",
    thesis: "A quiet capture pipeline that classifies, deduplicates, persists, searches, and replays clipboard material locally.",
    stack: ["SwiftUI", "AppKit", "NSPasteboard"],
    visibility: "private"
  },
  {
    id: "application-intelligence",
    index: "04",
    title: "Application Intelligence",
    subtitle: "Local job workflow intelligence",
    thesis: "A browser extraction layer, local helper, model summary, and manual application-state workflow.",
    stack: ["Chrome MV3", "Flask", "Ollama", "React"],
    visibility: "private"
  },
  {
    id: "network-lab",
    index: "05",
    title: "Network Lab",
    subtitle: "Automating a private WireGuard route on AWS",
    thesis: "Infrastructure automation where cost guardrails and resource lifecycle are part of the system—not an afterthought.",
    stack: ["WireGuard", "AWS", "Bash", "EC2"],
    visibility: "private"
  }
];
