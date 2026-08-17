export const SIGNAL_CATEGORIES = [
  "All",
  "Models",
  "Agents",
  "Research",
  "Infrastructure",
  "Developer Tools",
  "Security"
] as const;

export type SignalCategory = Exclude<(typeof SIGNAL_CATEGORIES)[number], "All">;

export interface RawSignal {
  title: string;
  url: string;
  publishedAt?: string | null;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
}

export interface SignalSourceIdentity {
  id: string;
  name: string;
  weight: number;
}

export interface SignalItem {
  id: string;
  title: string;
  source: string;
  sourceId: string;
  url: string;
  publishedAt: string | null;
  category: SignalCategory;
  excerpt: string;
  tags: string[];
  sourceWeight: number;
  score: number;
  curated?: boolean;
}

export interface SignalSourceFailure {
  sourceId: string;
  source: string;
  usedStaleData: boolean;
}

export type SignalFeedMode = "live" | "mixed" | "curated";

export interface SignalFeedResponse {
  generatedAt: string;
  mode: SignalFeedMode;
  items: SignalItem[];
  failures: SignalSourceFailure[];
  cachedSources: string[];
}

export interface SignalSourceAdapter extends SignalSourceIdentity {
  fetch: (signal?: AbortSignal) => Promise<SignalItem[]>;
}
