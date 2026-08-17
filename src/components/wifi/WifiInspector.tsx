"use client";

import {
  WIFI_STAGES,
  formatSimulationElapsed,
  getWifiStage,
  selectFailureDefinition,
  selectInspectorSnapshot
} from "@/lib/wifi/machine";
import type { WifiSimulationState } from "@/lib/wifi/types";
import styles from "./ProjectWifiExperience.module.css";

interface WifiInspectorProps {
  state: WifiSimulationState;
}

export function WifiInspector({ state }: WifiInspectorProps) {
  const snapshot = selectInspectorSnapshot(state);
  const selectedStage = getWifiStage(state.selectedStageId);
  const failure = selectFailureDefinition(state);
  const showFailure = state.status === "failed";

  return (
    <aside className={styles.inspector} aria-label="Project WiFi event inspector">
      <div className={styles.inspectorHeader}>
        <div>
          <p className={styles.microLabel}>Event inspector</p>
          <h3>{selectedStage.shortLabel}</h3>
        </div>
        <span
          className={styles.statusPill}
          data-status={state.status}
          aria-live="polite"
        >
          {snapshot.finalState}
        </span>
      </div>

      <dl className={styles.telemetryGrid}>
        <div>
          <dt>event</dt>
          <dd>{snapshot.eventType}</dd>
        </div>
        <div>
          <dt>event id</dt>
          <dd title={snapshot.eventId}>{snapshot.eventId}</dd>
        </div>
        <div>
          <dt>current stage</dt>
          <dd>{snapshot.currentStage}</dd>
        </div>
        <div>
          <dt>transport</dt>
          <dd>{snapshot.transport}</dd>
        </div>
        <div>
          <dt>source</dt>
          <dd>{snapshot.source}</dd>
        </div>
        <div>
          <dt>simulation elapsed</dt>
          <dd>{formatSimulationElapsed(snapshot.elapsedMs)}</dd>
        </div>
      </dl>

      <div className={styles.stageDetail}>
        <div className={styles.stageDetailHeading}>
          <span>{selectedStage.execution}</span>
          <span>{selectedStage.transport}</span>
        </div>
        <p>{selectedStage.description}</p>
        <p className={styles.observation}>{selectedStage.observation}</p>
      </div>

      {showFailure ? (
        <div className={styles.failureReadout} role="status">
          <div>
            <span>{failure.statusCode}</span>
            <strong>{failure.label}</strong>
          </div>
          <p>{failure.message}</p>
          <p>{failure.behavior}</p>
        </div>
      ) : null}

      <div className={styles.eventTimeline} aria-label="Activated stages">
        <div className={styles.timelineHeading}>
          <span>trace</span>
          <span>{state.history.length}/{WIFI_STAGES.length} stages</span>
        </div>
        <ol>
          {state.history.map((visit) => (
            <li key={`${state.runSequence}-${visit.stageId}`}>
              <span>{getWifiStage(visit.stageId).shortLabel}</span>
              <time>{formatSimulationElapsed(visit.elapsedMs)}</time>
            </li>
          ))}
        </ol>
        {state.history.length === 0 ? (
          <p className={styles.emptyTrace}>Run an event to record its local simulation trace.</p>
        ) : null}
      </div>
    </aside>
  );
}
