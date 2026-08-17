import { normalizeSignal, toPlainText } from "./normalize";
import type { RawSignal, SignalItem, SignalSourceAdapter } from "./types";

interface FeedDefinition {
  id: string;
  name: string;
  url: string;
  weight: number;
}

const REQUEST_TIMEOUT_MS = 6_000;

function tagValue(block: string, names: string[]): string {
  for (const name of names) {
    const expression = new RegExp(
      `<(?:[a-z0-9_-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-z0-9_-]+:)?${name}>`,
      "i"
    );
    const match = block.match(expression);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function feedLink(block: string): string {
  const textLink = tagValue(block, ["link"]);
  const plainTextLink = toPlainText(textLink);
  if (/^https?:\/\//i.test(plainTextLink)) return plainTextLink;

  const alternate = block.match(
    /<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  if (alternate?.[1]) return alternate[1];

  const anyHref = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return anyHref?.[1] ?? "";
}

function feedCategories(block: string): string[] {
  const values: string[] = [];
  const expression = /<(?:[a-z0-9_-]+:)?category(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-z0-9_-]+:)?category>/gi;
  let match = expression.exec(block);

  while (match) {
    const value = toPlainText(match[1]);
    if (value) values.push(value);
    match = expression.exec(block);
  }

  const terms = [...block.matchAll(/<category\b[^>]*term=["']([^"']+)["'][^>]*\/?\s*>/gi)]
    .map((entry) => toPlainText(entry[1]))
    .filter(Boolean);

  return [...new Set([...values, ...terms])];
}

export function parseStructuredFeed(xml: string): RawSignal[] {
  const itemBlocks = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(
    (match) => match[1]
  );
  const entryBlocks = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map(
    (match) => match[1]
  );
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks.slice(0, 16).map((block) => ({
    title: tagValue(block, ["title"]),
    url: feedLink(block),
    publishedAt: tagValue(block, ["pubDate", "published", "updated", "date"]) || null,
    excerpt: tagValue(block, ["description", "summary", "encoded", "content"]),
    categories: feedCategories(block)
  }));
}

function createFeedAdapter(definition: FeedDefinition): SignalSourceAdapter {
  return {
    id: definition.id,
    name: definition.name,
    weight: definition.weight,
    async fetch(parentSignal) {
      const timeoutController = new AbortController();
      const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
      const abortFromParent = () => timeoutController.abort();
      parentSignal?.addEventListener("abort", abortFromParent, { once: true });

      try {
        const response = await fetch(definition.url, {
          cache: "no-store",
          headers: {
            Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml",
            "User-Agent": "Vamshi-Systems-Lab-Signals/1.0"
          },
          signal: timeoutController.signal
        });

        if (!response.ok) {
          throw new Error(`Feed returned ${response.status}`);
        }

        const payload = await response.text();
        const rawItems = parseStructuredFeed(payload);
        if (rawItems.length === 0) throw new Error("Feed did not contain supported entries");

        return rawItems
          .map((raw) => normalizeSignal(raw, definition))
          .filter((item): item is SignalItem => item !== null);
      } finally {
        clearTimeout(timeout);
        parentSignal?.removeEventListener("abort", abortFromParent);
      }
    }
  };
}

const feedDefinitions: FeedDefinition[] = [
  {
    id: "github-changelog",
    name: "GitHub Changelog",
    url: "https://github.blog/changelog/feed/",
    weight: 22
  },
  {
    id: "hugging-face",
    name: "Hugging Face",
    url: "https://huggingface.co/blog/feed.xml",
    weight: 20
  },
  {
    id: "aws-machine-learning",
    name: "AWS Machine Learning",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
    weight: 20
  },
  {
    id: "arxiv-cs-ai",
    name: "arXiv · cs.AI",
    url: "https://export.arxiv.org/api/query?search_query=cat%3Acs.AI&sortBy=submittedDate&sortOrder=descending&max_results=12",
    weight: 16
  }
];

export const signalAdapters = feedDefinitions.map(createFeedAdapter);
