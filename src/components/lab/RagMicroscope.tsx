import { useMemo, useState, type CSSProperties } from "react";

import {
  RAG_DOCUMENTS,
  chunkDocuments,
  rankChunks,
  tokenize,
} from "@/lib/lab/models";

import {
  InstrumentHeading,
  ModelNote,
  RangeControl,
  ResetButton,
} from "./InstrumentParts";
import styles from "./LabExperience.module.css";

const DEFAULTS = {
  query: "How does backpressure protect a slow consumer queue?",
  chunkSize: 28,
  overlap: 6,
  topK: 3,
};

function HighlightedChunk({ text, query }: { text: string; query: string }) {
  const queryTokens = new Set(tokenize(query));
  return (
    <p>
      {text.split(/\s+/).map((word, index) => {
        const normalized = tokenize(word)[0] ?? "";
        return (
          <span
            className={queryTokens.has(normalized) ? styles.matchedToken : undefined}
            key={`${word}-${index}`}
          >
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}

export function RagMicroscope() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [chunkSize, setChunkSize] = useState(DEFAULTS.chunkSize);
  const [overlap, setOverlap] = useState(DEFAULTS.overlap);
  const [topK, setTopK] = useState(DEFAULTS.topK);
  const chunks = useMemo(
    () => chunkDocuments(RAG_DOCUMENTS, chunkSize, overlap),
    [chunkSize, overlap],
  );
  const ranked = useMemo(
    () => rankChunks(chunks, query, topK),
    [chunks, query, topK],
  );
  const selected = ranked.filter((chunk) => chunk.selected);
  const contextTokens = selected.reduce(
    (sum, chunk) => sum + chunk.tokens.length,
    0,
  );
  const leadingSource = selected[0]?.sourceTitle ?? "No matching source";
  const matchCount = tokenize(query).filter((token) =>
    selected.some((chunk) => chunk.tokens.includes(token)),
  ).length;

  const reset = () => {
    setQuery(DEFAULTS.query);
    setChunkSize(DEFAULTS.chunkSize);
    setOverlap(DEFAULTS.overlap);
    setTopK(DEFAULTS.topK);
  };

  return (
    <article
      className={`${styles.instrument} ${styles.ragInstrument}`}
      data-component="RagMicroscope"
      data-execution="client"
      data-source="local TF-IDF-style similarity"
    >
      <InstrumentHeading
        index="03"
        eyebrow="Retrieval mechanics"
        title="RAG Microscope"
        description="Change the chunk aperture and inspect exactly which local passages enter a finite context window."
        status="LOCAL ONLY"
        statusDetail={`${chunks.length} chunks · top ${topK} selected`}
        tone="info"
        actions={<ResetButton onClick={reset} />}
      />

      <div className={styles.ragQueryStrip}>
        <label htmlFor="rag-query">
          <span>QUERY PROBE</span>
          <input
            id="rag-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Ask the local corpus…"
          />
        </label>
        <div className={styles.queryTelemetry} aria-live="polite">
          <span>{tokenize(query).length} query tokens</span>
          <span>{matchCount} selected matches</span>
          <span>lead: {leadingSource}</span>
        </div>
      </div>

      <div className={styles.ragBench}>
        <aside className={styles.corpusRail} aria-label="Local sample corpus">
          <div className={styles.railTitle}>
            <span>LOCAL CORPUS</span>
            <strong>04 documents</strong>
          </div>
          {RAG_DOCUMENTS.map((document, index) => {
            const sourceChunks = chunks.filter(
              (chunk) => chunk.sourceId === document.id,
            );
            const sourceSelected = selected.filter(
              (chunk) => chunk.sourceId === document.id,
            ).length;
            return (
              <div className={styles.documentSpine} key={document.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{document.title}</strong>
                  <small>
                    {sourceChunks.length} windows · {sourceSelected} selected
                  </small>
                </div>
                <i
                  className={sourceSelected > 0 ? styles.documentActive : ""}
                  aria-hidden="true"
                />
              </div>
            );
          })}
          <p>
            Demo text is bundled with the site. No files, models, or queries leave
            this browser.
          </p>
        </aside>

        <fieldset className={styles.ragAperture}>
          <legend>Chunk aperture</legend>
          <RangeControl
            id="rag-chunk-size"
            label="Chunk size"
            min={12}
            max={52}
            step={4}
            value={chunkSize}
            unit=" words"
            onChange={(value) => {
              setChunkSize(value);
              setOverlap((current) => Math.min(current, value - 4));
            }}
          />
          <RangeControl
            id="rag-overlap"
            label="Overlap"
            min={0}
            max={Math.max(0, chunkSize - 4)}
            step={2}
            value={overlap}
            unit=" words"
            onChange={setOverlap}
          />
          <RangeControl
            id="rag-top-k"
            label="Top K"
            min={1}
            max={5}
            value={topK}
            onChange={setTopK}
          />
          <div className={styles.apertureDiagram} aria-hidden="true">
            <span style={{ width: `${Math.min(100, (chunkSize / 52) * 100)}%` }} />
            <i style={{ width: `${Math.min(85, (overlap / 48) * 100)}%` }} />
          </div>
          <dl className={styles.ragMethodReadout}>
            <div>
              <dt>Stride</dt>
              <dd>{chunkSize - overlap} words</dd>
            </div>
            <div>
              <dt>Similarity</dt>
              <dd>weighted keyword</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>{contextTokens} tokens</dd>
            </div>
          </dl>
        </fieldset>

        <section className={styles.chunkScanner} aria-labelledby="chunk-scanner-title">
          <div className={styles.scannerHeading}>
            <div>
              <span>RANKED WINDOWS</span>
              <strong id="chunk-scanner-title">Similarity scan</strong>
            </div>
            <small>Matched query terms are bracketed.</small>
          </div>
          <div className={styles.chunkList}>
            {ranked.slice(0, 8).map((chunk) => {
              const scoreStyle = {
                "--chunk-score": `${chunk.relativeScore}%`,
              } as CSSProperties;
              return (
                <article
                  className={`${styles.chunkWindow} ${chunk.selected ? styles.chunkSelected : ""}`}
                  key={chunk.id}
                  style={scoreStyle}
                >
                  <header>
                    <span>#{String(chunk.rank).padStart(2, "0")}</span>
                    <strong>{chunk.sourceTitle}</strong>
                    <small>
                      w{chunk.startWord}–{chunk.endWord}
                    </small>
                    {chunk.selected ? <b>CONTEXT {chunk.rank}</b> : null}
                  </header>
                  <HighlightedChunk text={chunk.text} query={query} />
                  <footer>
                    <span className={styles.scoreRail} aria-hidden="true">
                      <i />
                    </span>
                    <output>{chunk.relativeScore.toFixed(1)} relative</output>
                  </footer>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.contextWindow} aria-label="Selected context window">
          <div className={styles.contextHeader}>
            <span>CONTEXT WINDOW</span>
            <strong>{contextTokens} words loaded</strong>
          </div>
          <div className={styles.contextStack}>
            {selected.map((chunk, index) => (
              <div key={chunk.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{chunk.text}</p>
              </div>
            ))}
          </div>
          <div className={styles.simulatedAnswer}>
            <span>DETERMINISTIC SYNTHESIS</span>
            <p>
              The strongest local evidence is in <strong>{leadingSource}</strong>.
              The selected windows expose the evidence boundary; no model answer
              is being fabricated.
            </p>
          </div>
        </aside>
      </div>

      <ModelNote>
        Educational RAG visualization using lightweight local similarity. The
        public portfolio is not running the project&apos;s Ollama or optional vector
        store.
      </ModelNote>
    </article>
  );
}
