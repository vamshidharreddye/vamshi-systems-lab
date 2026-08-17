import { signalAdapters } from "./adapters";
import { MemoryTTLCache, resolveSignalsCacheTtl } from "./cache";
import { getCuratedSignals } from "./curated";
import { rankSignals } from "./ranking";
import type {
  SignalFeedResponse,
  SignalItem,
  SignalSourceAdapter,
  SignalSourceFailure
} from "./types";

const SOURCE_TTL_MS = resolveSignalsCacheTtl(process.env.SIGNALS_CACHE_TTL_MS);
const FAILURE_TTL_MS = 2 * 60 * 1_000;

interface SourceSnapshot {
  items: SignalItem[];
  lastError: boolean;
}

interface SourceLoad {
  adapter: SignalSourceAdapter;
  items: SignalItem[];
  fromCache: boolean;
  failed: boolean;
  usedStaleData: boolean;
}

const sourceCache = new MemoryTTLCache<SourceSnapshot>(SOURCE_TTL_MS);

function deduplicate(items: SignalItem[]): SignalItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadSource(adapter: SignalSourceAdapter): Promise<SourceLoad> {
  const fresh = sourceCache.get(adapter.id);
  if (fresh) {
    return {
      adapter,
      items: fresh.items,
      fromCache: true,
      failed: fresh.lastError,
      usedStaleData: fresh.lastError && fresh.items.length > 0
    };
  }

  const items = await adapter.fetch();
  const snapshot = { items, lastError: false };
  sourceCache.set(adapter.id, snapshot);

  return {
    adapter,
    items,
    fromCache: false,
    failed: false,
    usedStaleData: false
  };
}

export async function getSignalFeed(now = Date.now()): Promise<SignalFeedResponse> {
  const settled = await Promise.allSettled(signalAdapters.map(loadSource));
  const loads: SourceLoad[] = [];
  const failures: SignalSourceFailure[] = [];

  settled.forEach((result, index) => {
    const adapter = signalAdapters[index];
    if (result.status === "fulfilled") {
      loads.push(result.value);
      if (result.value.failed) {
        failures.push({
          sourceId: adapter.id,
          source: adapter.name,
          usedStaleData: result.value.usedStaleData
        });
      }
      return;
    }

    const stale = sourceCache.inspect(adapter.id)?.value;
    const snapshot: SourceSnapshot = {
      items: stale?.items ?? [],
      lastError: true
    };
    sourceCache.set(adapter.id, snapshot, FAILURE_TTL_MS);
    loads.push({
      adapter,
      items: snapshot.items,
      fromCache: Boolean(stale),
      failed: true,
      usedStaleData: snapshot.items.length > 0
    });
    failures.push({
      sourceId: adapter.id,
      source: adapter.name,
      usedStaleData: snapshot.items.length > 0
    });
  });

  const liveItems = deduplicate(loads.flatMap((load) => load.items));
  const usingFallback = liveItems.length === 0;
  const items = rankSignals(usingFallback ? getCuratedSignals() : liveItems, now);

  return {
    generatedAt: new Date(now).toISOString(),
    mode: usingFallback ? "curated" : failures.length > 0 ? "mixed" : "live",
    items,
    failures,
    cachedSources: loads.filter((load) => load.fromCache).map((load) => load.adapter.name)
  };
}

export function clearSignalCache(): void {
  sourceCache.clear();
}
