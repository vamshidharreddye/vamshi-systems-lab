import { z } from "zod";

import type {
  RawSignal,
  SignalCategory,
  SignalItem,
  SignalSourceIdentity
} from "./types";

const rawSignalSchema = z.object({
  title: z.string().trim().min(1).max(500),
  url: z.string().trim().min(1).max(2_048),
  publishedAt: z.string().nullable().optional(),
  excerpt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

const categorySignals: Record<SignalCategory, string[]> = {
  Models: [
    "model",
    "llm",
    "language model",
    "multimodal",
    "inference",
    "transformer"
  ],
  Agents: ["agent", "tool use", "orchestration", "mcp", "computer use"],
  Research: ["paper", "research", "benchmark", "evaluation", "arxiv", "study"],
  Infrastructure: [
    "infrastructure",
    "cloud",
    "kubernetes",
    "runtime",
    "latency",
    "observability",
    "deployment"
  ],
  "Developer Tools": [
    "developer",
    "copilot",
    "sdk",
    "api",
    "tooling",
    "code",
    "cli"
  ],
  Security: ["security", "vulnerability", "privacy", "safety", "auth", "prompt injection"]
};

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  ldquo: "“",
  lt: "<",
  nbsp: " ",
  quot: '"',
  rdquo: "”",
  rsquo: "’"
};

export function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) => {
      const radix = code.toLowerCase().startsWith("x") ? 16 : 10;
      const numeric = Number.parseInt(code.replace(/^x/i, ""), radix);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : "";
    })
    .replace(/&([a-z]+);/gi, (entity, name: string) => namedEntities[name.toLowerCase()] ?? entity);
}

export function toPlainText(value = ""): string {
  return decodeEntities(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stableSignalId(sourceId: string, url: string): string {
  const input = `${sourceId}:${url}`;
  let hash = 2_166_136_261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return `${sourceId}-${(hash >>> 0).toString(36)}`;
}

export function inferSignalCategory(raw: RawSignal): SignalCategory {
  const explicitCategory = (raw.categories ?? []).find((candidate) =>
    Object.keys(categorySignals).some(
      (category) => category.toLowerCase() === candidate.trim().toLowerCase()
    )
  );
  if (explicitCategory) {
    return Object.keys(categorySignals).find(
      (category) => category.toLowerCase() === explicitCategory.trim().toLowerCase()
    ) as SignalCategory;
  }

  const haystack = [
    raw.title,
    raw.excerpt,
    ...(raw.categories ?? []),
    ...(raw.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let selected: SignalCategory = "Developer Tools";
  let selectedScore = 0;

  for (const [category, keywords] of Object.entries(categorySignals) as [
    SignalCategory,
    string[]
  ][]) {
    const score = keywords.reduce(
      (total, keyword) => total + (haystack.includes(keyword) ? 1 : 0),
      0
    );

    if (score > selectedScore) {
      selected = category;
      selectedScore = score;
    }
  }

  return selected;
}

function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(decodeEntities(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function deriveTags(raw: RawSignal, category: SignalCategory): string[] {
  const candidates = [...(raw.tags ?? []), ...(raw.categories ?? [])]
    .map(toPlainText)
    .filter((tag) => tag.length > 1 && tag.length < 32);

  const unique = new Map<string, string>();
  for (const tag of [category, ...candidates]) {
    const key = tag.toLowerCase();
    if (!unique.has(key)) unique.set(key, tag);
  }

  return [...unique.values()].slice(0, 4);
}

export function normalizeSignal(
  input: RawSignal,
  source: SignalSourceIdentity
): SignalItem | null {
  const parsed = rawSignalSchema.safeParse(input);
  if (!parsed.success) return null;

  const url = safeExternalUrl(parsed.data.url);
  if (!url) return null;

  const title = toPlainText(parsed.data.title);
  if (!title) return null;

  const raw: RawSignal = { ...parsed.data, title, url };
  const category = inferSignalCategory(raw);
  const excerpt = toPlainText(raw.excerpt || title).slice(0, 320);

  return {
    id: stableSignalId(source.id, url),
    title,
    source: source.name,
    sourceId: source.id,
    url,
    publishedAt: normalizeDate(raw.publishedAt),
    category,
    excerpt,
    tags: deriveTags(raw, category),
    sourceWeight: source.weight,
    score: 0
  };
}
