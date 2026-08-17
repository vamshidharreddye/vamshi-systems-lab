import type { SignalCategory, SignalItem } from "./types";

const builderTerms = [
  "api",
  "sdk",
  "infrastructure",
  "agent",
  "evaluation",
  "runtime",
  "security",
  "developer",
  "open source",
  "deployment"
];

export const rankingExplanation = [
  "Recency contributes up to 45 points over a rolling 30-day window.",
  "Engineering terms contribute up to 30 points.",
  "A small, explicit first-party source weight contributes up to 25 points.",
  "Ties resolve by publication time, then deterministic item ID."
] as const;

export function scoreSignal(item: SignalItem, now = Date.now()): number {
  const published = item.publishedAt ? new Date(item.publishedAt).valueOf() : Number.NaN;
  const ageDays = Number.isNaN(published)
    ? 30
    : Math.max(0, (now - published) / 86_400_000);
  const recency = Math.max(0, 45 * (1 - ageDays / 30));
  const text = `${item.title} ${item.excerpt} ${item.tags.join(" ")}`.toLowerCase();
  const engineeringMatches = builderTerms.reduce(
    (total, term) => total + (text.includes(term) ? 1 : 0),
    0
  );
  const relevance = Math.min(30, engineeringMatches * 5);
  const source = Math.min(25, Math.max(0, item.sourceWeight));

  return Math.round(recency + relevance + source);
}

export function rankSignals(items: SignalItem[], now = Date.now()): SignalItem[] {
  return items
    .map((item) => ({ ...item, score: scoreSignal(item, now) }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;

      const leftDate = left.publishedAt ? new Date(left.publishedAt).valueOf() : 0;
      const rightDate = right.publishedAt ? new Date(right.publishedAt).valueOf() : 0;
      if (rightDate !== leftDate) return rightDate - leftDate;
      return left.id.localeCompare(right.id);
    });
}

export function filterSignals(
  items: SignalItem[],
  category: SignalCategory | "All"
): SignalItem[] {
  return category === "All" ? items : items.filter((item) => item.category === category);
}
