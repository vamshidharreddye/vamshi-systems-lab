"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  filterSignals,
  rankingExplanation,
  SIGNAL_CATEGORIES,
  type SignalCategory,
  type SignalFeedResponse,
  type SignalItem
} from "@/lib/signals";
import { Inspectable } from "@/components/xray/Inspectable";

import styles from "./Signals.module.css";

interface SignalExplorerProps {
  feed: SignalFeedResponse;
}

const categorySlugs: Record<(typeof SIGNAL_CATEGORIES)[number], string> = {
  All: "all",
  Models: "models",
  Agents: "agents",
  Research: "research",
  Infrastructure: "infrastructure",
  "Developer Tools": "developer-tools",
  Security: "security"
};

function selectedCategory(value: string | null): SignalCategory | "All" {
  const entry = SIGNAL_CATEGORIES.find((category) => categorySlugs[category] === value);
  return entry ?? "All";
}

function signalDate(item: SignalItem): string {
  if (item.curated) return "CURATED";
  if (!item.publishedAt) return "DATE N/A";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  })
    .format(new Date(item.publishedAt))
    .toUpperCase();
}

export function SignalExplorer({ feed }: SignalExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = selectedCategory(searchParams.get("category"));
  const visibleSignals = useMemo(
    () => filterSignals(feed.items, category),
    [category, feed.items]
  );

  function chooseCategory(nextCategory: SignalCategory | "All") {
    const parameters = new URLSearchParams(searchParams.toString());
    if (nextCategory === "All") parameters.delete("category");
    else parameters.set("category", categorySlugs[nextCategory]);
    const query = parameters.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <Inspectable as="section" metadata={{ id: "signals-explorer", component: "SignalExplorer", route: "/signals", execution: "client", source: "server-normalized feed + URL filter state", cache: "server memory / browser URL", relationship: "signals-page", interactive: true }} className={styles.explorer} aria-labelledby="signal-stream-title">
      <div className={styles.instrumentBar}>
        <div>
          <span className={styles.instrumentLabel}>FEED STATE</span>
          <strong className={styles.instrumentValue}>
            {feed.mode === "live" ? "UPSTREAM" : feed.mode === "mixed" ? "PARTIAL" : "CURATED"}
          </strong>
        </div>
        <div>
          <span className={styles.instrumentLabel}>VISIBLE</span>
          <strong className={styles.instrumentValue} aria-live="polite">
            {String(visibleSignals.length).padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span className={styles.instrumentLabel}>CACHE</span>
          <strong className={styles.instrumentValue}>
            {feed.cachedSources.length > 0 ? "MEMORY" : "MISS"}
          </strong>
        </div>
        <div className={styles.instrumentTime}>
          <span className={styles.instrumentLabel}>ASSEMBLED</span>
          <strong className={styles.instrumentValue}>
            {new Intl.DateTimeFormat("en", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
              timeZoneName: "short"
            }).format(new Date(feed.generatedAt))}
          </strong>
        </div>
      </div>

      {feed.mode !== "live" ? (
        <div className={styles.feedNotice} role="status">
          <span className={styles.noticePulse} aria-hidden="true" />
          <div>
            <strong>
              {feed.mode === "curated"
                ? "Showing curated reference signals"
                : "Some sources are temporarily isolated"}
            </strong>
            <p>
              {feed.mode === "curated"
                ? "The page remains useful when upstream feeds cannot be reached. These stable references are not presented as live news."
                : "Available and cached sources are shown below. One adapter failing never takes down the stream."}
            </p>
          </div>
        </div>
      ) : null}

      <div className={styles.filterRegion} aria-label="Filter signals by category">
        <span className={styles.filterPrompt}>CHANNEL</span>
        <div className={styles.filters}>
          {SIGNAL_CATEGORIES.map((filter) => (
            <button
              className={styles.filter}
              data-active={category === filter}
              key={filter}
              onClick={() => chooseCategory(filter)}
              type="button"
              aria-pressed={category === filter}
            >
              {filter}
              <span aria-hidden="true">
                {String(filterSignals(feed.items, filter).length).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.streamHeader} id="signal-stream-title">
        <span>RANK</span>
        <span>SOURCE / DATE</span>
        <span>ENGINEERING SIGNAL</span>
        <span>CLASSIFICATION</span>
      </div>

      {visibleSignals.length > 0 ? (
        <ol className={styles.signalList}>
          {visibleSignals.map((item, index) => (
            <li key={item.id} className={styles.signalItem}>
              <article className={styles.signalRow}>
                <div className={styles.rank} aria-label={`Rank ${index + 1}, score ${item.score}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{item.score}</small>
                </div>
                <div className={styles.provenance}>
                  <strong>{item.source}</strong>
                  <time dateTime={item.publishedAt ?? undefined}>{signalDate(item)}</time>
                </div>
                <div className={styles.signalCopy}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <span>{item.title}</span>
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
                  </a>
                  <p>{item.excerpt}</p>
                </div>
                <div className={styles.classification}>
                  <strong>{item.category}</strong>
                  <div className={styles.tags} aria-label="Tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.emptyState} role="status">
          <span>NO MATCHING SIGNALS</span>
          <p>The current source set has no items in this channel.</p>
          <button type="button" onClick={() => chooseCategory("All")}>
            <RotateCcw size={14} aria-hidden="true" /> Reset channel
          </button>
        </div>
      )}

      <details className={styles.rankingDisclosure}>
        <summary>How ranking works</summary>
        <ol>
          {rankingExplanation.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <p>No model-generated analysis or proprietary ranking is claimed.</p>
      </details>

      {feed.failures.length > 0 ? (
        <details className={styles.failureDisclosure}>
          <summary>{feed.failures.length} isolated source failure(s)</summary>
          <ul>
            {feed.failures.map((failure) => (
              <li key={failure.sourceId}>
                {failure.source}: {failure.usedStaleData ? "serving stale cache" : "omitted"}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Inspectable>
  );
}
