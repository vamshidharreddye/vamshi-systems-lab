"use client";

import type { KeyboardEvent } from "react";
import {
  WIFI_STAGES,
  selectFailureDefinition,
  selectStageVisualState
} from "@/lib/wifi/machine";
import type { WifiSimulationState, WifiStageId } from "@/lib/wifi/types";
import styles from "./ProjectWifiExperience.module.css";

interface Point {
  x: number;
  y: number;
}

interface WifiPipelineProps {
  state: WifiSimulationState;
  onSelectStage: (stageId: WifiStageId) => void;
}

const desktopPoints: readonly Point[] = [
  { x: 82, y: 196 },
  { x: 254, y: 104 },
  { x: 432, y: 210 },
  { x: 610, y: 102 },
  { x: 790, y: 210 },
  { x: 968, y: 104 },
  { x: 1146, y: 210 },
  { x: 1324, y: 122 }
];

const mobilePoints: readonly Point[] = WIFI_STAGES.map((_, index) => ({
  x: index % 2 === 0 ? 92 : 268,
  y: 82 + index * 142
}));

function edgePath(from: Point, to: Point): string {
  const middle = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${middle} ${from.y}, ${middle} ${to.y}, ${to.x} ${to.y}`;
}

function classNames(...names: Array<string | false>): string {
  return names.filter(Boolean).join(" ");
}

function PipelineDrawing({
  state,
  points,
  mode,
  onSelectStage
}: WifiPipelineProps & {
  points: readonly Point[];
  mode: "desktop" | "mobile";
}) {
  const failure = selectFailureDefinition(state);
  const titleId = `wifi-pipeline-${mode}-title`;
  const descriptionId = `wifi-pipeline-${mode}-description`;
  const width = mode === "desktop" ? 1408 : 360;
  const height = mode === "desktop" ? 330 : 1160;

  const handleKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    stageId: WifiStageId,
    index: number
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectStage(stageId);
      return;
    }

    if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + direction + WIFI_STAGES.length) % WIFI_STAGES.length;
    const nextStage = WIFI_STAGES[nextIndex];
    onSelectStage(nextStage.id);
    document.getElementById(`wifi-${mode}-stage-${nextStage.id}`)?.focus();
  };

  return (
    <svg
      className={mode === "desktop" ? styles.desktopPipeline : styles.mobilePipeline}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>Project WiFi event architecture</title>
      <desc id={descriptionId}>
        Inspectable event path from Echo through Alexa, Lambda, ngrok, a local webhook,
        Server-Sent Events, and the React interface. Use arrow keys to move between stages.
      </desc>

      <g aria-hidden="true">
        {points.slice(0, -1).map((point, index) => {
          const path = edgePath(point, points[index + 1]);
          const passed = state.status === "complete" || index < state.stageIndex;
          const carrying = state.status === "running" && index === state.stageIndex;

          return (
            <g key={`${mode}-edge-${WIFI_STAGES[index].id}`}>
              <path d={path} className={styles.edgeBase} />
              <path
                d={path}
                className={classNames(
                  styles.edgeSignal,
                  passed && styles.edgePassed,
                  carrying && styles.edgeCarrying
                )}
              />
              {carrying ? (
                <circle r="4.5" className={styles.carrier}>
                  <animateMotion dur="0.86s" repeatCount="indefinite" path={path} />
                </circle>
              ) : null}
            </g>
          );
        })}
      </g>

      {WIFI_STAGES.map((stage, index) => {
        const point = points[index];
        const visualState = selectStageVisualState(state, stage.id);
        const selected = state.selectedStageId === stage.id;
        const failed = state.status === "failed" && failure.stageId === stage.id;

        return (
          <g
            id={`wifi-${mode}-stage-${stage.id}`}
            key={`${mode}-${stage.id}`}
            className={classNames(
              styles.stage,
              styles[`stage_${visualState}`],
              selected && styles.stageSelected
            )}
            transform={`translate(${point.x} ${point.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${stage.label}. ${stage.description}`}
            aria-pressed={selected}
            data-stage={stage.id}
            data-stage-state={visualState}
            onClick={() => onSelectStage(stage.id)}
            onKeyDown={(event) => handleKeyDown(event, stage.id, index)}
          >
            <circle className={styles.stageProximity} r="52" />
            <circle className={styles.stageHalo} r="42" />
            <circle className={styles.stageNode} r="28" />
            <text className={styles.stageIndex} textAnchor="middle" dy="4">
              {String(index + 1).padStart(2, "0")}
            </text>
            <text className={styles.stageLabel} textAnchor="middle" y="52">
              {stage.shortLabel}
            </text>
            <text className={styles.stageEyebrow} textAnchor="middle" y="69">
              {failed ? failure.statusCode : stage.eyebrow}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WifiPipeline(props: WifiPipelineProps) {
  return (
    <div className={styles.pipelineViewport}>
      <div className={styles.boundaryLabels} aria-hidden="true">
        <span>physical / cloud</span>
        <span>public ingress / localhost</span>
        <span>browser</span>
      </div>
      <PipelineDrawing {...props} points={desktopPoints} mode="desktop" />
      <PipelineDrawing {...props} points={mobilePoints} mode="mobile" />
    </div>
  );
}
