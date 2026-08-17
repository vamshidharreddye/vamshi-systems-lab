import type {
  WifiFailureDefinition,
  WifiFailureScenario,
  WifiInspectorSnapshot,
  WifiSimulationAction,
  WifiSimulationState,
  WifiStageDefinition,
  WifiStageId,
  WifiStageVisualState
} from "./types";

export const WIFI_STAGES: readonly WifiStageDefinition[] = [
  {
    id: "echo",
    shortLabel: "Echo",
    label: "Echo occupancy event",
    eyebrow: "physical signal",
    transport: "Occupancy event",
    execution: "device",
    description:
      "A supported Echo device exposes an occupancy signal to an Alexa Routine. Availability depends on the device, account, and locale.",
    observation:
      "This is an occupancy state, not Wi-Fi sensing, identity, coordinates, or exact location."
  },
  {
    id: "routine",
    shortLabel: "Routine",
    label: "Alexa Routine",
    eyebrow: "automation",
    transport: "Routine trigger",
    execution: "cloud",
    description:
      "The configured Alexa Routine converts the occupancy change into an invocation of the custom skill.",
    observation:
      "The trigger is coupled to Alexa occupancy support and the user's Routine configuration."
  },
  {
    id: "skill",
    shortLabel: "Skill",
    label: "Alexa Custom Skill",
    eyebrow: "voice boundary",
    transport: "Custom skill invocation",
    execution: "cloud",
    description:
      "The custom skill provides the boundary between the Routine and the Lambda bridge.",
    observation:
      "The portfolio visualizes the contract without exposing the private skill configuration."
  },
  {
    id: "lambda",
    shortLabel: "Lambda",
    label: "AWS Lambda",
    eyebrow: "cloud bridge",
    transport: "Outbound HTTPS POST",
    execution: "cloud",
    description:
      "Lambda maps the skill invocation to a presence event and posts it toward the public tunnel endpoint.",
    observation:
      "The bridge aborts an unreachable outbound request after eight seconds and returns a spoken failure response."
  },
  {
    id: "ngrok",
    shortLabel: "ngrok",
    label: "ngrok HTTPS tunnel",
    eyebrow: "temporary ingress",
    transport: "Public HTTPS tunnel",
    execution: "tunnel",
    description:
      "ngrok forwards the cloud request to the locally running receiver without embedding a localhost URL in the cloud function.",
    observation:
      "The tunnel URL and the local process must both be live; this is a development bridge, not managed production ingress."
  },
  {
    id: "webhook",
    shortLabel: "Webhook",
    label: "Local webhook receiver",
    eyebrow: "contract boundary",
    transport: "Normalized presence event",
    execution: "local-server",
    description:
      "A Node HTTP server on port 8787 validates aliases, normalizes the event, updates the shared model, and prepares a broadcast.",
    observation:
      "Unsupported events return 400. An optional webhook secret can reject with 401 and is stripped before any response or broadcast."
  },
  {
    id: "sse",
    shortLabel: "SSE",
    label: "Server-Sent Events",
    eyebrow: "one-way stream",
    transport: "text/event-stream",
    execution: "local-server",
    description:
      "The receiver broadcasts the full in-memory occupancy model to every connected EventSource client.",
    observation:
      "The stream advertises a 1,500 ms retry. In-memory state and its rolling eight-event log reset with the process."
  },
  {
    id: "react",
    shortLabel: "React",
    label: "React dashboard",
    eyebrow: "observable state",
    transport: "EventSource message",
    execution: "browser",
    description:
      "The React/Vite client reduces incoming snapshots into room, Alexa, test, connection, and rolling event-log state.",
    observation:
      "The browser surfaces an offline receiver, and its controls support a five-minute test plus simulate, clear, and reset."
  }
] as const;

export const WIFI_FAILURES: Readonly<Record<WifiFailureScenario, WifiFailureDefinition>> = {
  none: {
    id: "none",
    label: "Nominal path",
    stageId: null,
    statusCode: "OK",
    message: "No failure injected.",
    behavior: "The simulated event traverses the full architecture."
  },
  "lambda-timeout": {
    id: "lambda-timeout",
    label: "Lambda outbound timeout",
    stageId: "lambda",
    statusCode: "ABORTED",
    message: "The local bridge could not be reached.",
    behavior:
      "The actual Lambda bridge aborts its outbound request after eight seconds and returns a spoken unreachable response."
  },
  "receiver-offline": {
    id: "receiver-offline",
    label: "Tunnel / receiver offline",
    stageId: "ngrok",
    statusCode: "UNREACHABLE",
    message: "The public tunnel cannot reach the local receiver.",
    behavior:
      "The ngrok URL and the Node process must both be available for the development bridge to work."
  },
  "auth-rejected": {
    id: "auth-rejected",
    label: "Webhook auth rejected",
    stageId: "webhook",
    statusCode: "401",
    message: "The optional webhook secret did not validate.",
    behavior:
      "The secret value is never displayed, stored in this simulation, or forwarded to SSE clients."
  },
  "unsupported-event": {
    id: "unsupported-event",
    label: "Unsupported event",
    stageId: "webhook",
    statusCode: "400",
    message: "The webhook rejected an unsupported event alias.",
    behavior:
      "Only the repository's supported presence and clear aliases enter the normalized state model."
  },
  "sse-reconnecting": {
    id: "sse-reconnecting",
    label: "SSE reconnecting",
    stageId: "sse",
    statusCode: "RETRY 1500MS",
    message: "The EventSource connection was interrupted.",
    behavior:
      "The stream advertises a 1,500 ms retry and the React client marks the receiver offline while disconnected."
  }
};

export const initialWifiSimulationState: WifiSimulationState = {
  status: "idle",
  eventId: null,
  eventKind: null,
  lastEventKind: null,
  stageIndex: -1,
  selectedStageId: "echo",
  startedAt: null,
  elapsedMs: 0,
  finalPresence: null,
  failureScenario: "none",
  history: [],
  runSequence: 0
};

function elapsedAt(state: WifiSimulationState, at: number): number {
  if (state.startedAt === null) return 0;
  return Math.max(0, Math.round(at - state.startedAt));
}

function beginRun(
  state: WifiSimulationState,
  eventKind: NonNullable<WifiSimulationState["eventKind"]>,
  eventId: string,
  at: number
): WifiSimulationState {
  return {
    ...state,
    status: "running",
    eventId,
    eventKind,
    lastEventKind: eventKind,
    stageIndex: 0,
    selectedStageId: WIFI_STAGES[0].id,
    startedAt: at,
    elapsedMs: 0,
    finalPresence: null,
    history: [{ stageId: WIFI_STAGES[0].id, elapsedMs: 0 }],
    runSequence: state.runSequence + 1
  };
}

function moveToNextStage(
  state: WifiSimulationState,
  at: number,
  statusWhileMoving: "running" | "paused"
): WifiSimulationState {
  if (state.stageIndex < 0 || state.eventKind === null) return state;

  const elapsedMs = elapsedAt(state, at);
  if (state.stageIndex >= WIFI_STAGES.length - 1) {
    return {
      ...state,
      status: "complete",
      elapsedMs,
      finalPresence: state.eventKind === "people_detected",
      selectedStageId: "react"
    };
  }

  const stageIndex = state.stageIndex + 1;
  const stageId = WIFI_STAGES[stageIndex].id;
  return {
    ...state,
    status: statusWhileMoving,
    stageIndex,
    selectedStageId: stageId,
    elapsedMs,
    history: [...state.history, { stageId, elapsedMs }]
  };
}

export function wifiSimulationReducer(
  state: WifiSimulationState,
  action: WifiSimulationAction
): WifiSimulationState {
  switch (action.type) {
    case "START":
      return beginRun(state, action.eventKind, action.eventId, action.at);
    case "REPLAY":
      return state.lastEventKind
        ? beginRun(state, state.lastEventKind, action.eventId, action.at)
        : state;
    case "ADVANCE":
      return state.status === "running"
        ? moveToNextStage(state, action.at, "running")
        : state;
    case "STEP":
      return state.status === "running" || state.status === "paused"
        ? moveToNextStage(state, action.at, "paused")
        : state;
    case "PAUSE":
      return state.status === "running"
        ? { ...state, status: "paused", elapsedMs: elapsedAt(state, action.at) }
        : state;
    case "RESUME":
      return state.status === "paused" ? { ...state, status: "running" } : state;
    case "FAIL": {
      if (state.status !== "running" || state.failureScenario === "none") return state;
      const target = WIFI_FAILURES[state.failureScenario].stageId;
      if (target !== WIFI_STAGES[state.stageIndex]?.id) return state;
      return {
        ...state,
        status: "failed",
        elapsedMs: elapsedAt(state, action.at),
        finalPresence: null
      };
    }
    case "TICK":
      return state.status === "running"
        ? { ...state, elapsedMs: elapsedAt(state, action.at) }
        : state;
    case "SELECT_STAGE":
      return WIFI_STAGES.some((stage) => stage.id === action.stageId)
        ? { ...state, selectedStageId: action.stageId }
        : state;
    case "CONFIGURE_FAILURE":
      return state.status === "running" || state.status === "paused"
        ? state
        : { ...state, failureScenario: action.scenario };
    case "RESET":
      return {
        ...initialWifiSimulationState,
        failureScenario: state.failureScenario,
        runSequence: state.runSequence + 1
      };
    default:
      return state;
  }
}

export function getWifiStage(stageId: WifiStageId): WifiStageDefinition {
  return WIFI_STAGES.find((stage) => stage.id === stageId) ?? WIFI_STAGES[0];
}

export function selectFailureDefinition(
  state: Pick<WifiSimulationState, "failureScenario">
): WifiFailureDefinition {
  return WIFI_FAILURES[state.failureScenario];
}

export function selectCurrentStage(
  state: Pick<WifiSimulationState, "stageIndex">
): WifiStageDefinition | null {
  return state.stageIndex >= 0 ? WIFI_STAGES[state.stageIndex] ?? null : null;
}

export function selectStageVisualState(
  state: WifiSimulationState,
  stageId: WifiStageId
): WifiStageVisualState {
  const index = WIFI_STAGES.findIndex((stage) => stage.id === stageId);
  const failure = selectFailureDefinition(state);

  if (state.status === "failed" && failure.stageId === stageId) return "failed";
  if (state.status === "complete") return "complete";
  if (index < state.stageIndex) return "visited";
  if (index === state.stageIndex) {
    return state.status === "running" ? "carrying" : "active";
  }
  return "waiting";
}

export function selectInspectorSnapshot(
  state: WifiSimulationState
): WifiInspectorSnapshot {
  const currentStage = selectCurrentStage(state);
  const failure = selectFailureDefinition(state);
  const finalState =
    state.status === "failed"
      ? failure.statusCode
      : state.status === "complete"
        ? state.finalPresence
          ? "PRESENCE DETECTED"
          : "PRESENCE CLEARED"
        : state.status === "idle"
          ? "AWAITING EVENT"
          : "IN TRANSIT";

  return {
    eventId: state.eventId ?? "not generated",
    eventType: state.eventKind ?? "none",
    source: state.eventKind ? "alexa_occupancy_simulation" : "none",
    currentStage: currentStage?.label ?? "Idle",
    currentStageId: currentStage?.id ?? "idle",
    transport: currentStage?.transport ?? "none",
    status: state.status,
    finalState,
    elapsedMs: state.elapsedMs
  };
}

export function formatSimulationElapsed(elapsedMs: number): string {
  if (elapsedMs < 1_000) return `${elapsedMs} ms`;
  return `${(elapsedMs / 1_000).toFixed(2)} s`;
}
