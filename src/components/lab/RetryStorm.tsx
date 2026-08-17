import { useMemo, useState, type CSSProperties } from "react";

import { calculateRetryStorm } from "@/lib/lab/models";

import {
  InstrumentHeading,
  Metric,
  ModelNote,
  RangeControl,
  ResetButton,
} from "./InstrumentParts";
import styles from "./LabExperience.module.css";

const DEFAULTS = {
  incomingRequests: 480,
  failureRate: 68,
  retries: 4,
  backoffMs: 200,
};

function formatAttempts(value: number) {
  return value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString();
}

export function RetryStorm() {
  const [incomingRequests, setIncomingRequests] = useState(
    DEFAULTS.incomingRequests,
  );
  const [failureRate, setFailureRate] = useState(DEFAULTS.failureRate);
  const [retries, setRetries] = useState(DEFAULTS.retries);
  const [backoffMs, setBackoffMs] = useState(DEFAULTS.backoffMs);
  const result = useMemo(
    () =>
      calculateRetryStorm({
        incomingRequests,
        failureRate,
        retries,
        backoffMs,
      }),
    [backoffMs, failureRate, incomingRequests, retries],
  );
  const status =
    result.amplification >= 2
      ? "AMPLIFYING"
      : result.amplification >= 1.35
        ? "ELEVATED"
        : "CONTAINED";
  const tone =
    status === "AMPLIFYING"
      ? "critical"
      : status === "ELEVATED"
        ? "warning"
        : "nominal";

  const reset = () => {
    setIncomingRequests(DEFAULTS.incomingRequests);
    setFailureRate(DEFAULTS.failureRate);
    setRetries(DEFAULTS.retries);
    setBackoffMs(DEFAULTS.backoffMs);
  };

  return (
    <article
      className={`${styles.instrument} ${styles.retryInstrument}`}
      data-component="RetryStorm"
      data-execution="client"
      data-source="deterministic expectation model"
    >
      <InstrumentHeading
        index="01"
        eyebrow="Reliability dynamics"
        title="Retry Storm"
        description="Watch a failing dependency turn one request stream into overlapping waves of additional work."
        status={status}
        statusDetail={`${result.amplification.toFixed(2)}× expected load`}
        tone={tone}
        actions={<ResetButton onClick={reset} />}
      />

      <div className={styles.retryLayout}>
        <fieldset className={styles.controlConsole}>
          <legend>Failure envelope</legend>
          <RangeControl
            id="retry-incoming"
            label="Incoming requests / s"
            min={50}
            max={1_200}
            step={10}
            value={incomingRequests}
            onChange={setIncomingRequests}
          />
          <RangeControl
            id="retry-failure"
            label="Failure rate"
            min={0}
            max={95}
            value={failureRate}
            unit="%"
            onChange={setFailureRate}
          />
          <RangeControl
            id="retry-count"
            label="Retry ceiling"
            min={0}
            max={6}
            value={retries}
            unit="×"
            onChange={setRetries}
          />
          <RangeControl
            id="retry-backoff"
            label="Initial exponential backoff"
            min={0}
            max={1_000}
            step={50}
            value={backoffMs}
            unit="ms"
            onChange={setBackoffMs}
          />
        </fieldset>

        <section className={styles.retryScope} aria-labelledby="retry-scope-title">
          <div className={styles.scopeHeader}>
            <div>
              <span>Attempt propagation</span>
              <strong id="retry-scope-title">Expected request waves</strong>
            </div>
            <div className={styles.scopeLegend} aria-hidden="true">
              <span>request load</span>
              <span>failure continuation</span>
            </div>
          </div>

          <div
            className={styles.retryTimeline}
            role="img"
            aria-label={`${result.attemptsByRound.length} attempt waves create ${formatAttempts(result.totalAttempts)} expected attempts from ${incomingRequests} incoming requests.`}
          >
            <div className={styles.timelineTicks} aria-hidden="true">
              <span>0 ms</span>
              <span>
                {Math.max(1, Math.round(result.recoveryWindowMs / 2))} ms
              </span>
              <span>{Math.max(1, result.recoveryWindowMs)} ms</span>
            </div>
            {result.attemptsByRound.map((attempt) => {
              const load =
                incomingRequests === 0
                  ? 0
                  : (attempt.expectedAttempts / incomingRequests) * 100;
              const offset =
                result.recoveryWindowMs === 0
                  ? 0
                  : (attempt.scheduledAtMs / result.recoveryWindowMs) * 54;
              const railStyle = {
                "--retry-load": `${Math.max(2, load * 0.42)}%`,
                "--retry-offset": `${offset}%`,
              } as CSSProperties;

              return (
                <div className={styles.retryRound} key={attempt.round}>
                  <div className={styles.retryRoundLabel}>
                    <span>{attempt.label}</span>
                    <small>t + {attempt.scheduledAtMs} ms</small>
                  </div>
                  <div className={styles.retryTrack} style={railStyle}>
                    <span className={styles.retryWave} aria-hidden="true" />
                    <span className={styles.retryFailureTail} aria-hidden="true" />
                  </div>
                  <output>{formatAttempts(attempt.expectedAttempts)}</output>
                </div>
              );
            })}
          </div>
        </section>

        <aside className={styles.retryReadout} aria-label="Retry calculation output">
          <p className={styles.readoutLabel}>Load readout</p>
          <Metric
            label="Expected attempts"
            value={formatAttempts(result.totalAttempts)}
            detail="per one-second input window"
          />
          <Metric
            label="Retry overhead"
            value={`+${formatAttempts(result.extraAttempts)}`}
            detail="attempts beyond originals"
          />
          <Metric
            label="Still failing"
            value={formatAttempts(result.exhaustedRequests)}
            detail="after final allowed attempt"
          />
          <Metric
            label="Retry horizon"
            value={`${result.recoveryWindowMs.toLocaleString()} ms`}
            detail={
              backoffMs === 0
                ? "all waves collide"
                : "exponential spacing"
            }
          />
          <div className={styles.retryEquation}>
            <span>EXPECTED LOAD</span>
            <code>R × Σ pⁱ</code>
            <small>i = 0…retry ceiling</small>
          </div>
        </aside>
      </div>

      <ModelNote>
        Simplified expectation model, not a production forecast. Backoff spreads
        attempts over time; jitter, recovery, timeouts, and correlated failures
        change real traffic.
      </ModelNote>
    </article>
  );
}
