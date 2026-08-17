export interface CacheInspection<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  stale: boolean;
}

export const DEFAULT_SIGNALS_CACHE_TTL_MS = 15 * 60 * 1_000;
export const MIN_SIGNALS_CACHE_TTL_MS = 10 * 60 * 1_000;
export const MAX_SIGNALS_CACHE_TTL_MS = 30 * 60 * 1_000;

export function resolveSignalsCacheTtl(value?: string): number {
  if (!value?.trim()) return DEFAULT_SIGNALS_CACHE_TTL_MS;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SIGNALS_CACHE_TTL_MS;

  return Math.min(
    MAX_SIGNALS_CACHE_TTL_MS,
    Math.max(MIN_SIGNALS_CACHE_TTL_MS, Math.trunc(parsed))
  );
}

interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
}

export class MemoryTTLCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now
  ) {
    if (ttlMs <= 0) throw new Error("Cache TTL must be positive");
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= this.now()) return undefined;
    return entry.value;
  }

  inspect(key: string): CacheInspection<T> | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    return {
      ...entry,
      stale: entry.expiresAt <= this.now()
    };
  }

  set(key: string, value: T, ttlOverrideMs = this.ttlMs): void {
    const createdAt = this.now();
    this.entries.set(key, {
      value,
      createdAt,
      expiresAt: createdAt + ttlOverrideMs
    });
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}
