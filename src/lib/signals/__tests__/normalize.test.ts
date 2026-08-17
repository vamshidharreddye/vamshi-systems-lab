import { describe, expect, it } from "vitest";

import {
  decodeEntities,
  inferSignalCategory,
  normalizeSignal,
  stableSignalId,
  toPlainText
} from "../normalize";

const source = { id: "official-source", name: "Official Source", weight: 20 };

describe("signal normalization", () => {
  it("normalizes feed markup into a safe, deterministic item", () => {
    const first = normalizeSignal(
      {
        title: "<![CDATA[Agent SDK &amp; API update]]>",
        url: "https://example.com/changelog/agent-sdk",
        publishedAt: "2026-08-01T10:00:00Z",
        excerpt: "<p>A developer SDK for agent orchestration.</p>",
        categories: ["Agents", "Developer Tools"]
      },
      source
    );
    const second = normalizeSignal(
      {
        title: "Agent SDK & API update",
        url: "https://example.com/changelog/agent-sdk",
        publishedAt: "2026-08-01T10:00:00Z",
        excerpt: "A developer SDK for agent orchestration."
      },
      source
    );

    expect(first).toMatchObject({
      title: "Agent SDK & API update",
      category: "Agents",
      excerpt: "A developer SDK for agent orchestration.",
      publishedAt: "2026-08-01T10:00:00.000Z"
    });
    expect(first?.id).toBe(second?.id);
  });

  it("rejects unsupported and malformed URLs", () => {
    expect(normalizeSignal({ title: "Unsafe", url: "javascript:alert(1)" }, source)).toBeNull();
    expect(normalizeSignal({ title: "Broken", url: "not a URL" }, source)).toBeNull();
  });

  it("uses deterministic category matching and text cleanup", () => {
    expect(
      inferSignalCategory({
        title: "Kubernetes runtime observability deployment",
        url: "https://example.com"
      })
    ).toBe("Infrastructure");
    expect(toPlainText("<p>One&nbsp;two &amp; three</p>")).toBe("One two & three");
    expect(decodeEntities("&#x2192;")).toBe("→");
    expect(stableSignalId("a", "https://example.com")).toBe(
      stableSignalId("a", "https://example.com")
    );
  });
});
