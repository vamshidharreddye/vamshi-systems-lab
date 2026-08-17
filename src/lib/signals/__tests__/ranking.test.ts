import { describe, expect, it } from "vitest";

import { filterSignals, rankSignals, scoreSignal } from "../ranking";
import type { SignalItem } from "../types";

const now = new Date("2026-08-16T12:00:00Z").valueOf();

function item(overrides: Partial<SignalItem>): SignalItem {
  return {
    id: "signal-a",
    title: "Developer API infrastructure release",
    source: "Source",
    sourceId: "source",
    url: "https://example.com/a",
    publishedAt: "2026-08-15T12:00:00Z",
    category: "Developer Tools",
    excerpt: "SDK runtime and deployment guidance for builders.",
    tags: ["API"],
    sourceWeight: 20,
    score: 0,
    ...overrides
  };
}

describe("signal ranking", () => {
  it("scores recent engineering-relevant items above old generic items", () => {
    const useful = item({ id: "useful" });
    const old = item({
      id: "old",
      title: "General announcement",
      excerpt: "A general announcement.",
      tags: [],
      publishedAt: "2026-01-01T00:00:00Z",
      sourceWeight: 4
    });

    expect(scoreSignal(useful, now)).toBeGreaterThan(scoreSignal(old, now));
    expect(rankSignals([old, useful], now).map((entry) => entry.id)).toEqual(["useful", "old"]);
  });

  it("is deterministic when scores and dates tie", () => {
    const firstRun = rankSignals(
      [item({ id: "z" }), item({ id: "a", url: "https://example.com/b" })],
      now
    );
    const secondRun = rankSignals([...firstRun].reverse(), now);

    expect(firstRun.map((entry) => entry.id)).toEqual(["a", "z"]);
    expect(secondRun.map((entry) => entry.id)).toEqual(["a", "z"]);
  });

  it("filters without changing the ranked source collection", () => {
    const items = [
      item({ id: "agents", category: "Agents" }),
      item({ id: "security", category: "Security" })
    ];

    expect(filterSignals(items, "Agents").map((entry) => entry.id)).toEqual(["agents"]);
    expect(filterSignals(items, "All")).toEqual(items);
  });
});
