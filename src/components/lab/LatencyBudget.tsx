import { useReducer, type CSSProperties } from "react";

import {
  DEFAULT_LATENCY_STATE,
  LATENCY_STAGES,
  PERCENTILE_GUIDANCE,
  calculateLatencyBudget,
  latencyBudgetReducer,
  type PercentileLens,
} from "@/lib/lab/models";

import {
  InstrumentHeading,
  Metric,
  ModelNote,
  RangeControl,
  ResetButton,
} from "./InstrumentParts";
import styles from "./LabExperience.module.css";

export function LatencyBudget() {
  const [state, dispatch] = useReducer(
    latencyBudgetReducer,
    DEFAULT_LATENCY_STATE,
  );
  const result = calculateLatencyBudget(state);
  const scaleMax = Math.max(state.targetMs, result.illustrativeEnvelopeMs, 1);
  const targetPosition = (state.targetMs / scaleMax) * 100;

  return (
    <article
      className={`${styles.instrument} ${styles.latencyInstrument}`}
      data-component="LatencyBudget"
      data-execution="client"
      data-source="illustrative deterministic allocation"
    >
      <InstrumentHeading
        index="05"
        eyebrow="Performance envelopes"
        title="Latency Budget"
        description="Allocate a finite response-time envelope, then inspect how a conceptual percentile lens changes tail headroom."
        status={result.exceeded ? "BUDGET EXCEEDED" : "WITHIN BUDGET"}
        statusDetail={`${Math.abs(result.remainingMs)} ms ${result.exceeded ? "over" : "remaining"}`}
        tone={result.exceeded ? "critical" : "nominal"}
        actions={
          <ResetButton onClick={() => dispatch({ type: "reset" })} />
        }
      />

      <div className={styles.latencyWorkbench}>
        <section className={styles.budgetCommand} aria-labelledby="budget-command-title">
          <div className={styles.budgetCommandHeader}>
            <div>
              <span>ENVELOPE TARGET</span>
              <strong id="budget-command-title">Response budget</strong>
            </div>
            <label htmlFor="latency-target">
              Target
              <span>
                <input
                  id="latency-target"
                  type="number"
                  min={100}
                  max={5_000}
                  step={25}
                  value={state.targetMs}
                  onChange={(event) =>
                    dispatch({
                      type: "set-target",
                      value: Number(event.currentTarget.value),
                    })
                  }
                />
                ms
              </span>
            </label>
          </div>

          <fieldset className={styles.percentileSelector}>
            <legend>Illustrative percentile lens</legend>
            {(Object.keys(PERCENTILE_GUIDANCE) as PercentileLens[]).map(
              (lens) => (
                <label key={lens}>
                  <input
                    type="radio"
                    name="latency-percentile"
                    value={lens}
                    checked={state.lens === lens}
                    onChange={() => dispatch({ type: "set-lens", lens })}
                  />
                  <span>
                    <strong>{lens}</strong>
                    <small>{PERCENTILE_GUIDANCE[lens].label}</small>
                  </span>
                </label>
              ),
            )}
          </fieldset>

          <div className={styles.percentileExplanation}>
            <span>{state.lens.toUpperCase()} CONCEPT</span>
            <p>{result.guidance.note}</p>
            <small>
              ×{result.guidance.illustrativeFactor.toFixed(2)} teaching factor ·
              not measured data
            </small>
          </div>
        </section>

        <fieldset className={styles.latencyControls}>
          <legend>Stage allocation controls</legend>
          {LATENCY_STAGES.map((stage) => (
            <RangeControl
              id={`latency-${stage.id}`}
              key={stage.id}
              label={stage.label}
              min={0}
              max={500}
              step={5}
              value={state.allocations[stage.id]}
              unit="ms"
              onChange={(value) =>
                dispatch({ type: "set-stage", stage: stage.id, value })
              }
            />
          ))}
        </fieldset>

        <section className={styles.latencyScope} aria-labelledby="latency-scope-title">
          <div className={styles.scopeHeader}>
            <div>
              <span>STACKED ENVELOPE</span>
              <strong id="latency-scope-title">Critical path allocation</strong>
            </div>
            <small>{state.lens} illustrative view</small>
          </div>

          <div
            className={styles.budgetRail}
            role="img"
            aria-label={`${state.lens} illustrative envelope totals ${result.illustrativeEnvelopeMs} milliseconds against a ${state.targetMs} millisecond target.`}
          >
            <div className={styles.budgetSegments}>
              {LATENCY_STAGES.map((stage, index) => {
                const stageEnvelope = Math.round(
                  state.allocations[stage.id] *
                    result.guidance.illustrativeFactor,
                );
                const segmentStyle = {
                  "--segment-width": `${(stageEnvelope / scaleMax) * 100}%`,
                  "--stage-index": index,
                } as CSSProperties;
                return (
                  <span
                    className={styles.budgetSegment}
                    key={stage.id}
                    style={segmentStyle}
                  >
                    <b>{stage.shortLabel}</b>
                    <small>{stageEnvelope} ms</small>
                  </span>
                );
              })}
              <i
                className={styles.targetMarker}
                style={{ left: `${targetPosition}%` }}
                aria-hidden="true"
              >
                TARGET
              </i>
            </div>
            <div className={styles.budgetScale} aria-hidden="true">
              <span>0 ms</span>
              <span>{Math.round(scaleMax / 2)} ms</span>
              <span>{scaleMax} ms</span>
            </div>
          </div>

          <div className={styles.latencyWaterfall}>
            <div className={styles.waterfallHeader}>
              <span>STAGE WATERFALL</span>
              <span>base allocation</span>
            </div>
            <div className={styles.waterfallBars}>
              {LATENCY_STAGES.map((stage, index) => {
                const height = Math.max(
                  4,
                  (state.allocations[stage.id] / 500) * 100,
                );
                const barStyle = {
                  "--bar-height": `${height}%`,
                  "--stage-index": index,
                } as CSSProperties;
                return (
                  <div key={stage.id} style={barStyle}>
                    <output>{state.allocations[stage.id]}</output>
                    <span aria-hidden="true" />
                    <small>{stage.shortLabel}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.latencyMetrics} aria-live="polite">
            <Metric
              label="Base allocation"
              value={`${result.allocatedMs} ms`}
              detail="sum of stage controls"
            />
            <Metric
              label={`${state.lens} envelope`}
              value={`${result.illustrativeEnvelopeMs} ms`}
              detail="conceptual teaching value"
            />
            <Metric
              label="Target utilization"
              value={`${result.utilization}%`}
              detail={result.exceeded ? "overflowing" : "headroom available"}
            />
          </div>

          {result.exceeded ? (
            <div className={styles.budgetExceeded} role="status">
              <span aria-hidden="true">!</span>
              <div>
                <strong>BUDGET EXCEEDED</strong>
                <p>
                  Remove {Math.abs(result.remainingMs)} ms from the illustrative
                  envelope or increase the target.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.budgetHealthy} role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>{result.remainingMs} ms headroom</strong>
                <p>Unassigned capacity remains for variance and coordination.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <ModelNote>
        Example budget only. Percentile factors illustrate tail sensitivity; they
        are not measurements, benchmarks, or predictions from a real service.
      </ModelNote>
    </article>
  );
}
