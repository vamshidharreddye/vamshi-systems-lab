import type { ComponentType } from "react";

import BackpressureNote from "@/content/notes/what-backpressure-protects.mdx";
import BridgeNote from "@/content/notes/bridging-a-physical-event-into-localhost.mdx";
import LocalRagNote from "@/content/notes/local-rag-beyond-chat-with-your-pdf.mdx";
import RetriesNote from "@/content/notes/retries-are-not-reliability.mdx";
import SseNote from "@/content/notes/why-sse-for-a-local-presence-dashboard.mdx";

export interface RelatedNoteLink {
  label: string;
  href: string;
  kind: "system" | "experiment" | "note";
}

export interface FieldNote {
  slug: string;
  title: string;
  thesis: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  sequence: string;
  Component: ComponentType;
  related: RelatedNoteLink[];
}

const fieldNotes: FieldNote[] = [
  {
    slug: "why-sse-for-a-local-presence-dashboard",
    title: "Why I used SSE for a local presence dashboard",
    thesis:
      "The transport becomes simpler when the browser only needs an ordered stream of state changes.",
    publishedAt: "2026-08-16",
    readingTime: "6 min",
    tags: ["SSE", "Event systems", "React"],
    sequence: "FN-001",
    Component: SseNote,
    related: [
      { label: "Inspect Project WiFi", href: "/systems/project-wifi", kind: "system" },
      {
        label: "Bridging a physical event into localhost",
        href: "/field-notes/bridging-a-physical-event-into-localhost",
        kind: "note"
      }
    ]
  },
  {
    slug: "bridging-a-physical-event-into-localhost",
    title: "Bridging a physical event into localhost",
    thesis:
      "A public HTTPS edge can expose a narrow development ingress without pretending the laptop is production infrastructure.",
    publishedAt: "2026-08-12",
    readingTime: "7 min",
    tags: ["Alexa", "ngrok", "Webhooks"],
    sequence: "FN-002",
    Component: BridgeNote,
    related: [
      { label: "Inspect Project WiFi", href: "/systems/project-wifi", kind: "system" },
      {
        label: "Why I used SSE",
        href: "/field-notes/why-sse-for-a-local-presence-dashboard",
        kind: "note"
      }
    ]
  },
  {
    slug: "local-rag-beyond-chat-with-your-pdf",
    title: "Local RAG is more interesting than chat with your PDF",
    thesis:
      "The useful work is making retrieval inspectable: boundaries, ranking, context pressure, and sources.",
    publishedAt: "2026-08-07",
    readingTime: "8 min",
    tags: ["RAG", "Local AI", "Retrieval"],
    sequence: "FN-003",
    Component: LocalRagNote,
    related: [
      { label: "Explore Local AI", href: "/systems#local-ai", kind: "system" },
      { label: "Open RAG Microscope", href: "/lab?experiment=rag-microscope", kind: "experiment" }
    ]
  },
  {
    slug: "retries-are-not-reliability",
    title: "Retries are not reliability",
    thesis:
      "A retry policy is a load generator unless it accounts for budgets, backoff, jitter, and the failure domain.",
    publishedAt: "2026-07-30",
    readingTime: "6 min",
    tags: ["Reliability", "Retries", "Failure modes"],
    sequence: "FN-004",
    Component: RetriesNote,
    related: [
      { label: "Open Retry Storm", href: "/lab?experiment=retry-storm", kind: "experiment" },
      {
        label: "What backpressure actually protects",
        href: "/field-notes/what-backpressure-protects",
        kind: "note"
      }
    ]
  },
  {
    slug: "what-backpressure-protects",
    title: "What backpressure actually protects",
    thesis:
      "Backpressure keeps finite downstream capacity explicit instead of hiding overload inside a growing queue.",
    publishedAt: "2026-07-24",
    readingTime: "7 min",
    tags: ["Backpressure", "Queues", "Capacity"],
    sequence: "FN-005",
    Component: BackpressureNote,
    related: [
      { label: "Open Backpressure Lab", href: "/lab?experiment=backpressure", kind: "experiment" },
      {
        label: "Retries are not reliability",
        href: "/field-notes/retries-are-not-reliability",
        kind: "note"
      }
    ]
  }
];

export function getAllFieldNotes(): FieldNote[] {
  return [...fieldNotes].sort(
    (left, right) => new Date(right.publishedAt).valueOf() - new Date(left.publishedAt).valueOf()
  );
}

export function getFieldNote(slug: string): FieldNote | undefined {
  return fieldNotes.find((note) => note.slug === slug);
}

export function formatNoteDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00Z`));
}
