"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent
} from "react";
import {
  WIFI_FAILURES,
  WIFI_STAGES,
  initialWifiSimulationState,
  selectCurrentStage,
  selectFailureDefinition,
  wifiSimulationReducer
} from "@/lib/wifi/machine";
import type {
  WifiEventKind,
  WifiFailureScenario,
  WifiStageId
} from "@/lib/wifi/types";
import { Inspectable } from "@/components/xray/Inspectable";
import { WifiInspector } from "./WifiInspector";
import { WifiPipeline } from "./WifiPipeline";
import styles from "./ProjectWifiExperience.module.css";

function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function createEventId(eventKind: WifiEventKind): string {
  const prefix = eventKind === "people_detected" ? "presence" : "clear";
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(16).slice(2, 10);
  return `sim-${prefix}-${randomPart}`;
}

export function ProjectWifiExperience() {
  const [state, dispatch] = useReducer(
    wifiSimulationReducer,
    initialWifiSimulationState
  );
  const reducedMotion = usePrefersReducedMotion();
  const environmentRef = useRef<HTMLElement>(null);
  const autoStartedRef = useRef(false);
  const currentStage = selectCurrentStage(state);
  const configuredFailure = selectFailureDefinition(state);
  const running = state.status === "running";
  const paused = state.status === "paused";
  const hasEvent = state.lastEventKind !== null;

  useEffect(() => {
    const initialRun: WifiEventKind | undefined =
      new URLSearchParams(window.location.search).get("run") === "presence"
        ? "people_detected"
        : undefined;
    if (!initialRun || autoStartedRef.current) return;
    const timer = window.setTimeout(() => {
      autoStartedRef.current = true;
      dispatch({
        type: "START",
        eventKind: initialRun,
        eventId: createEventId(initialRun),
        at: performance.now()
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!running) return;

    const stageDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 90
      : 820;
    const hitsFailure = configuredFailure.stageId === currentStage?.id;
    const timer = window.setTimeout(
      () => {
        dispatch({
          type: hitsFailure ? "FAIL" : "ADVANCE",
          at: performance.now()
        });
      },
      hitsFailure ? stageDuration * 0.64 : stageDuration
    );

    return () => window.clearTimeout(timer);
  }, [
    configuredFailure.stageId,
    currentStage?.id,
    reducedMotion,
    running,
    state.runSequence,
    state.stageIndex
  ]);

  useEffect(() => {
    if (!running) return;

    const ticker = window.setInterval(
      () => dispatch({ type: "TICK", at: performance.now() }),
      reducedMotion ? 80 : 50
    );
    return () => window.clearInterval(ticker);
  }, [reducedMotion, running, state.runSequence]);

  const start = (eventKind: WifiEventKind) => {
    dispatch({
      type: "START",
      eventKind,
      eventId: createEventId(eventKind),
      at: performance.now()
    });
  };

  const replay = () => {
    if (!state.lastEventKind) return;
    dispatch({
      type: "REPLAY",
      eventId: createEventId(state.lastEventKind),
      at: performance.now()
    });
  };

  const selectStage = (stageId: WifiStageId) => {
    dispatch({ type: "SELECT_STAGE", stageId });
  };

  const configureFailure = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "CONFIGURE_FAILURE",
      scenario: event.target.value as WifiFailureScenario
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    environmentRef.current?.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
    environmentRef.current?.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
  };

  const resetPointer = () => {
    environmentRef.current?.style.setProperty("--pointer-x", "50%");
    environmentRef.current?.style.setProperty("--pointer-y", "45%");
  };

  return (
    <Inspectable
      as="section"
      metadata={{ id: "project-wifi-simulation", component: "ProjectWifiExperience", route: "/systems/project-wifi", execution: "client", source: "deterministic reducer over verified architecture", interactive: true }}
      ref={environmentRef}
      className={styles.environment}
      aria-labelledby="wifi-simulation-title"
      data-inspection-id="project-wifi-simulation"
      data-execution="client"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className={styles.environmentGlow} aria-hidden="true" />
      <header className={styles.experienceHeader}>
        <div>
          <p className={styles.kicker}>
            <span className={styles.liveDot} aria-hidden="true" />
            Interactive architecture simulation
          </p>
          <h2 id="wifi-simulation-title">Watch one event cross every boundary.</h2>
          <p className={styles.lede}>
            Trigger a local, deterministic event and inspect how state moves from an
            Echo occupancy signal to a React interface. No production traffic is used.
          </p>
        </div>
        <div className={styles.pathLegend} aria-label="Architecture summary">
          <span>08 stages</span>
          <span>03 execution zones</span>
          <span>01 one-way stream</span>
        </div>
      </header>

      <div className={styles.controlDeck}>
        <div className={styles.eventControls} aria-label="Simulated occupancy events">
          <button
            type="button"
            className={styles.primaryControl}
            onClick={() => start("people_detected")}
          >
            <span aria-hidden="true">●</span>
            Simulate presence
          </button>
          <button
            type="button"
            className={styles.secondaryControl}
            onClick={() => start("presence_cleared")}
          >
            <span aria-hidden="true">○</span>
            Clear presence
          </button>
        </div>

        <div className={styles.transportControls} aria-label="Simulation transport controls">
          <button
            type="button"
            onClick={() =>
              dispatch(
                running
                  ? { type: "PAUSE", at: performance.now() }
                  : { type: "RESUME" }
              )
            }
            disabled={!running && !paused}
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "STEP", at: performance.now() })}
            disabled={!running && !paused}
            title="Advance one stage and pause the automatic sequence"
          >
            Step stage
          </button>
          <button type="button" onClick={replay} disabled={!hasEvent}>
            Replay
          </button>
          <button type="button" onClick={() => dispatch({ type: "RESET" })}>
            Reset
          </button>
        </div>

        <label className={styles.failureSelector}>
          <span>Failure branch</span>
          <select
            value={state.failureScenario}
            onChange={configureFailure}
            disabled={running || paused}
          >
            {Object.values(WIFI_FAILURES).map((failure) => (
              <option key={failure.id} value={failure.id}>
                {failure.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.systemReadout} aria-live="polite">
        <span data-status={state.status}>{state.status}</span>
        <p>
          {state.status === "idle"
            ? "Select an event. The simulation remains entirely in this browser."
            : state.status === "failed"
              ? `${configuredFailure.statusCode} · ${configuredFailure.message}`
              : state.status === "complete"
                ? "Trace complete. Select any stage to inspect its boundary."
                : `${currentStage?.label ?? "Preparing event"} · ${currentStage?.transport ?? "local state"}`}
        </p>
      </div>

      <div className={styles.experienceGrid}>
        <div className={styles.pipelineColumn}>
          <WifiPipeline state={state} onSelectStage={selectStage} />
          <div className={styles.canonicalPath} aria-label="Canonical event path">
            {WIFI_STAGES.map((stage, index) => (
              <span key={stage.id}>
                {stage.shortLabel}
                {index < WIFI_STAGES.length - 1 ? <i aria-hidden="true">→</i> : null}
              </span>
            ))}
          </div>
        </div>
        <WifiInspector state={state} />
      </div>

      <footer className={styles.disclosure}>
        <span>Architecture simulation based on the actual Project WiFi event flow.</span>
        <span>Elapsed time measures this browser animation, not infrastructure latency.</span>
      </footer>
    </Inspectable>
  );
}
