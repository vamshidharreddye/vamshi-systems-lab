import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  createQueueState,
  queueStatus,
  stepQueue,
  type QueueState,
} from "@/lib/lab/models";

import {
  InstrumentHeading,
  Metric,
  ModelNote,
  RangeControl,
  ResetButton,
} from "./InstrumentParts";
import styles from "./LabExperience.module.css";
import { useReducedMotion } from "./useReducedMotion";

const DEFAULTS = {
  producerRate: 150,
  consumerRate: 72,
  capacity: 420,
  applyBackpressure: false,
};

function QueueTrace({ state, capacity }: { state: QueueState; capacity: number }) {
  const points = state.history
    .map((sample, index) => {
      const x =
        state.history.length <= 1
          ? 0
          : (index / (state.history.length - 1)) * 300;
      const y = 78 - (sample.depth / Math.max(1, capacity)) * 66;
      return `${x.toFixed(1)},${Math.max(8, y).toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={styles.queueTrace}
      viewBox="0 0 300 86"
      role="img"
      aria-label={`Queue depth trace over ${state.tick} simulated seconds. Current depth ${state.queued} of ${capacity}.`}
      preserveAspectRatio="none"
    >
      <title>Queue depth over time</title>
      <line x1="0" x2="300" y1="78" y2="78" />
      <line
        className={styles.highWaterLine}
        x1="0"
        x2="300"
        y1="30.5"
        y2="30.5"
      />
      <polyline points={points || "0,78"} />
      {state.history.map((sample, index) => {
        const x =
          state.history.length <= 1
            ? 0
            : (index / (state.history.length - 1)) * 300;
        const y = 78 - (sample.depth / Math.max(1, capacity)) * 66;
        return (
          <circle
            key={`${sample.tick}-${index}`}
            cx={x}
            cy={Math.max(8, y)}
            r={index === state.history.length - 1 ? 3.5 : 1.5}
          />
        );
      })}
    </svg>
  );
}

export function Backpressure() {
  const [producerRate, setProducerRate] = useState(DEFAULTS.producerRate);
  const [consumerRate, setConsumerRate] = useState(DEFAULTS.consumerRate);
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [applyBackpressure, setApplyBackpressure] = useState(
    DEFAULTS.applyBackpressure,
  );
  const [state, setState] = useState(createQueueState);
  const [running, setRunning] = useState(false);
  const reducedMotion = useReducedMotion();
  const inputs = useMemo(
    () => ({ producerRate, consumerRate, capacity, applyBackpressure }),
    [applyBackpressure, capacity, consumerRate, producerRate],
  );
  const status = queueStatus(state, capacity);
  const utilization = Math.min(100, (state.queued / capacity) * 100);

  useEffect(() => {
    if (!running || reducedMotion) return;
    const timer = window.setInterval(() => {
      setState((current) => stepQueue(current, inputs));
    }, 720);
    return () => window.clearInterval(timer);
  }, [inputs, reducedMotion, running]);

  const advance = () => setState((current) => stepQueue(current, inputs));
  const reset = () => {
    setProducerRate(DEFAULTS.producerRate);
    setConsumerRate(DEFAULTS.consumerRate);
    setCapacity(DEFAULTS.capacity);
    setApplyBackpressure(DEFAULTS.applyBackpressure);
    setState(createQueueState());
    setRunning(false);
  };
  const filledSlots = Math.round((utilization / 100) * 24);
  const queueStyle = {
    "--queue-utilization": `${utilization}%`,
  } as CSSProperties;
  const statusLabel =
    status === "saturated"
      ? "SATURATED"
      : status === "pressure"
        ? "HIGH WATER"
        : "DRAINING";
  const statusTone =
    status === "saturated"
      ? "critical"
      : status === "pressure"
        ? "warning"
        : "nominal";
  const autoRunning = running && !reducedMotion;

  return (
    <article
      className={`${styles.instrument} ${styles.backpressureInstrument}`}
      data-component="Backpressure"
      data-execution="client"
      data-source="bounded queue reducer"
    >
      <InstrumentHeading
        index="02"
        eyebrow="Flow control"
        title="Backpressure"
        description="Advance a bounded queue one second at a time and decide whether to admit, throttle, or shed work."
        status={statusLabel}
        statusDetail={`${Math.round(utilization)}% queue utilization`}
        tone={statusTone}
        actions={<ResetButton onClick={reset} />}
      />

      <div className={styles.backpressureLayout}>
        <fieldset className={styles.controlConsole}>
          <legend>Traffic controls</legend>
          <RangeControl
            id="queue-producer"
            label="Producer rate"
            min={10}
            max={300}
            step={2}
            value={producerRate}
            unit="/s"
            onChange={setProducerRate}
          />
          <RangeControl
            id="queue-consumer"
            label="Consumer rate"
            min={10}
            max={300}
            step={2}
            value={consumerRate}
            unit="/s"
            onChange={setConsumerRate}
          />
          <RangeControl
            id="queue-capacity"
            label="Queue capacity"
            min={100}
            max={1_000}
            step={20}
            value={capacity}
            unit=" jobs"
            onChange={(value) => {
              setCapacity(value);
              setState(createQueueState());
              setRunning(false);
            }}
          />

          <label className={styles.valveSwitch} htmlFor="queue-backpressure">
            <input
              id="queue-backpressure"
              type="checkbox"
              checked={applyBackpressure}
              onChange={(event) =>
                setApplyBackpressure(event.currentTarget.checked)
              }
            />
            <span className={styles.switchTrack} aria-hidden="true">
              <span />
            </span>
            <span>
              <strong>Apply backpressure</strong>
              <small>Throttle admission at the 72% high-water mark</small>
            </span>
          </label>

          <div className={styles.simulationControls}>
            <button type="button" onClick={advance}>
              Advance 1 s
            </button>
            <button
              type="button"
              aria-pressed={autoRunning}
              disabled={reducedMotion}
              onClick={() => setRunning((value) => !value)}
            >
              {autoRunning ? "Pause run" : "Auto run"}
            </button>
          </div>
          {reducedMotion ? (
            <p className={styles.motionNotice}>
              Auto run is disabled by your reduced-motion preference. Step control
              remains available.
            </p>
          ) : null}
        </fieldset>

        <section className={styles.flowBench} aria-label="Queue flow instrument">
          <div className={styles.flowPipeline}>
            <div className={styles.flowSource}>
              <span>PRODUCER</span>
              <strong>{producerRate}/s</strong>
              <small>offered load</small>
            </div>
            <div
              className={`${styles.flowLine} ${autoRunning ? styles.flowLineActive : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
            <div className={styles.admissionValve}>
              <span>ADMISSION</span>
              <strong>{state.lastAdmitted || producerRate}/s</strong>
              <small>
                {state.lastThrottled > 0
                  ? `${state.lastThrottled}/s throttled`
                  : "valve fully open"}
              </small>
              <b
                className={applyBackpressure ? styles.valveClosed : ""}
                aria-hidden="true"
              />
            </div>
            <div className={styles.queueAssembly} style={queueStyle}>
              <div className={styles.queueAssemblyHeader}>
                <span>BOUNDED QUEUE</span>
                <strong>
                  {state.queued} / {capacity}
                </strong>
              </div>
              <div className={styles.queueSlots} aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => (
                  <span
                    key={index}
                    className={index < filledSlots ? styles.queueSlotFilled : ""}
                  />
                ))}
              </div>
              <div className={styles.queueWatermarks} aria-hidden="true">
                <span>0</span>
                <span>72% high water</span>
                <span>100%</span>
              </div>
              {status === "saturated" ? (
                <div className={styles.saturationStamp}>SATURATED · SHEDDING</div>
              ) : null}
            </div>
            <div
              className={`${styles.flowLine} ${autoRunning ? styles.flowLineActive : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
            </div>
            <div className={styles.flowSink}>
              <span>CONSUMER</span>
              <strong>{consumerRate}/s</strong>
              <small>drain rate</small>
            </div>
          </div>

          <div className={styles.queueTelemetry}>
            <div className={styles.tracePanel}>
              <div className={styles.traceHeader}>
                <span>QUEUE DEPTH TRACE</span>
                <output>t + {state.tick}s</output>
              </div>
              <QueueTrace state={state} capacity={capacity} />
              <div className={styles.traceKey}>
                <span>solid: queue depth</span>
                <span>dashed: admission threshold</span>
              </div>
            </div>
            <div className={styles.queueMetrics} aria-live="polite">
              <Metric
                label="Last admitted"
                value={state.lastAdmitted}
                detail="jobs this interval"
              />
              <Metric
                label="Last processed"
                value={state.lastProcessed}
                detail="jobs this interval"
              />
              <Metric
                label="Shed"
                value={state.droppedTotal}
                detail="capacity exhausted"
              />
              <Metric
                label="Throttled"
                value={state.throttledTotal}
                detail="rejected before queue"
              />
            </div>
          </div>
        </section>
      </div>

      <ModelNote>
        One-second deterministic queue model. Real systems also account for
        burst shape, service-time variance, fairness, deadlines, and distributed
        coordination.
      </ModelNote>
    </article>
  );
}
