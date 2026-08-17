export const WIFI_STAGE_IDS = [
  "echo",
  "routine",
  "skill",
  "lambda",
  "ngrok",
  "webhook",
  "sse",
  "react"
] as const;

export type WifiStageId = (typeof WIFI_STAGE_IDS)[number];

export type WifiEventKind = "people_detected" | "presence_cleared";

export type WifiRunStatus =
  | "idle"
  | "running"
  | "paused"
  | "complete"
  | "failed";

export type WifiFailureScenario =
  | "none"
  | "lambda-timeout"
  | "receiver-offline"
  | "auth-rejected"
  | "unsupported-event"
  | "sse-reconnecting";

export interface WifiStageDefinition {
  id: WifiStageId;
  shortLabel: string;
  label: string;
  eyebrow: string;
  transport: string;
  execution: "device" | "cloud" | "tunnel" | "local-server" | "browser";
  description: string;
  observation: string;
}

export interface WifiFailureDefinition {
  id: WifiFailureScenario;
  label: string;
  stageId: WifiStageId | null;
  statusCode: string;
  message: string;
  behavior: string;
}

export interface WifiStageVisit {
  stageId: WifiStageId;
  elapsedMs: number;
}

export interface WifiSimulationState {
  status: WifiRunStatus;
  eventId: string | null;
  eventKind: WifiEventKind | null;
  lastEventKind: WifiEventKind | null;
  stageIndex: number;
  selectedStageId: WifiStageId;
  startedAt: number | null;
  elapsedMs: number;
  finalPresence: boolean | null;
  failureScenario: WifiFailureScenario;
  history: WifiStageVisit[];
  runSequence: number;
}

export type WifiSimulationAction =
  | {
      type: "START";
      eventKind: WifiEventKind;
      eventId: string;
      at: number;
    }
  | { type: "REPLAY"; eventId: string; at: number }
  | { type: "ADVANCE"; at: number }
  | { type: "STEP"; at: number }
  | { type: "PAUSE"; at: number }
  | { type: "RESUME" }
  | { type: "FAIL"; at: number }
  | { type: "TICK"; at: number }
  | { type: "SELECT_STAGE"; stageId: WifiStageId }
  | { type: "CONFIGURE_FAILURE"; scenario: WifiFailureScenario }
  | { type: "RESET" };

export type WifiStageVisualState =
  | "waiting"
  | "carrying"
  | "active"
  | "visited"
  | "complete"
  | "failed";

export interface WifiInspectorSnapshot {
  eventId: string;
  eventType: string;
  source: string;
  currentStage: string;
  currentStageId: WifiStageId | "idle";
  transport: string;
  status: WifiRunStatus;
  finalState: string;
  elapsedMs: number;
}
