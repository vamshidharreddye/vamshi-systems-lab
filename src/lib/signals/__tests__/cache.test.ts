import { describe, expect, it } from "vitest";

import {
  DEFAULT_SIGNALS_CACHE_TTL_MS,
  MAX_SIGNALS_CACHE_TTL_MS,
  MemoryTTLCache,
  MIN_SIGNALS_CACHE_TTL_MS,
  resolveSignalsCacheTtl
} from "../cache";

describe("MemoryTTLCache", () => {
  it("returns fresh values until the configured TTL expires", () => {
    let now = 1_000;
    const cache = new MemoryTTLCache<string>(500, () => now);

    cache.set("source", "payload");
    expect(cache.get("source")).toBe("payload");

    now = 1_499;
    expect(cache.get("source")).toBe("payload");

    now = 1_500;
    expect(cache.get("source")).toBeUndefined();
  });

  it("retains stale values for source-failure fallback inspection", () => {
    let now = 10;
    const cache = new MemoryTTLCache<{ items: string[] }>(10, () => now);
    cache.set("feed", { items: ["cached"] });

    now = 21;
    expect(cache.get("feed")).toBeUndefined();
    expect(cache.inspect("feed")).toMatchObject({
      value: { items: ["cached"] },
      stale: true,
      createdAt: 10,
      expiresAt: 20
    });
  });

  it("supports failure-specific TTLs, deletion, and clearing", () => {
    let now = 0;
    const cache = new MemoryTTLCache<string>(1_000, () => now);
    cache.set("short", "failure", 100);
    cache.set("normal", "ok");
    expect(cache.size).toBe(2);

    now = 101;
    expect(cache.get("short")).toBeUndefined();
    expect(cache.get("normal")).toBe("ok");
    expect(cache.delete("short")).toBe(true);
    cache.clear();
    expect(cache.size).toBe(0);
  });
});

describe("resolveSignalsCacheTtl", () => {
  it("defaults invalid or missing values to fifteen minutes", () => {
    expect(resolveSignalsCacheTtl()).toBe(DEFAULT_SIGNALS_CACHE_TTL_MS);
    expect(resolveSignalsCacheTtl("not-a-number")).toBe(DEFAULT_SIGNALS_CACHE_TTL_MS);
    expect(resolveSignalsCacheTtl("-100")).toBe(DEFAULT_SIGNALS_CACHE_TTL_MS);
  });

  it("accepts milliseconds and clamps the supported window to ten through thirty minutes", () => {
    expect(resolveSignalsCacheTtl("1200000")).toBe(1_200_000);
    expect(resolveSignalsCacheTtl("1000")).toBe(MIN_SIGNALS_CACHE_TTL_MS);
    expect(resolveSignalsCacheTtl("99999999")).toBe(MAX_SIGNALS_CACHE_TTL_MS);
  });
});
