import { describe, expect, it } from "vitest";
import {
  WIFI_STAGES,
  formatSimulationElapsed,
  initialWifiSimulationState,
  selectFailureDefinition,
  selectInspectorSnapshot,
  selectStageVisualState,
  wifiSimulationReducer
} from "./machine";
import type { WifiSimulationState } from "./types";

function startPresence(
  state: WifiSimulationState = initialWifiSimulationState,
  at = 1_000
) {
  return wifiSimulationReducer(state, {
    type: "START",
    eventKind: "people_detected",
    eventId: "sim-presence-001",
    at
  });
}

describe("Project WiFi simulation reducer", () => {
  it("keeps the canonical event path in its exact order", () => {
    expect(WIFI_STAGES.map((stage) => stage.id)).toEqual([
      "echo",
      "routine",
      "skill",
      "lambda",
      "ngrok",
      "webhook",
      "sse",
      "react"
    ]);
  });

  it("advances deterministically from Echo to a completed React state", () => {
    let state = startPresence();

    for (let index = 1; index < WIFI_STAGES.length; index += 1) {
      state = wifiSimulationReducer(state, {
        type: "ADVANCE",
        at: 1_000 + index * 100
      });
      expect(state.stageIndex).toBe(index);
      expect(state.selectedStageId).toBe(WIFI_STAGES[index].id);
    }

    state = wifiSimulationReducer(state, { type: "ADVANCE", at: 1_850 });

    expect(state.status).toBe("complete");
    expect(state.finalPresence).toBe(true);
    expect(state.elapsedMs).toBe(850);
    expect(state.history).toHaveLength(8);
    expect(selectInspectorSnapshot(state).finalState).toBe("PRESENCE DETECTED");
  });

  it("maps a clear event to a cleared final state", () => {
    let state = wifiSimulationReducer(initialWifiSimulationState, {
      type: "START",
      eventKind: "presence_cleared",
      eventId: "sim-clear-001",
      at: 20
    });

    for (let index = 0; index < WIFI_STAGES.length; index += 1) {
      state = wifiSimulationReducer(state, {
        type: "ADVANCE",
        at: 30 + index * 10
      });
    }

    expect(state.status).toBe("complete");
    expect(state.finalPresence).toBe(false);
    expect(selectInspectorSnapshot(state).finalState).toBe("PRESENCE CLEARED");
  });

  it("turns an in-flight automatic run into an interruptible paused step run", () => {
    const running = startPresence();
    const stepped = wifiSimulationReducer(running, { type: "STEP", at: 1_125 });

    expect(stepped.status).toBe("paused");
    expect(stepped.stageIndex).toBe(1);
    expect(stepped.elapsedMs).toBe(125);

    const resumed = wifiSimulationReducer(stepped, { type: "RESUME" });
    expect(resumed.status).toBe("running");
  });

  it("interrupts a run when a newer event starts", () => {
    let state = startPresence();
    state = wifiSimulationReducer(state, { type: "ADVANCE", at: 1_200 });
    state = wifiSimulationReducer(state, {
      type: "START",
      eventKind: "presence_cleared",
      eventId: "sim-clear-002",
      at: 2_000
    });

    expect(state.eventId).toBe("sim-clear-002");
    expect(state.eventKind).toBe("presence_cleared");
    expect(state.stageIndex).toBe(0);
    expect(state.history).toEqual([{ stageId: "echo", elapsedMs: 0 }]);
    expect(state.runSequence).toBe(2);
  });

  it("replays the last event with a fresh id and timing origin", () => {
    const first = startPresence();
    const replay = wifiSimulationReducer(first, {
      type: "REPLAY",
      eventId: "sim-presence-replay",
      at: 9_000
    });

    expect(replay.eventKind).toBe("people_detected");
    expect(replay.eventId).toBe("sim-presence-replay");
    expect(replay.startedAt).toBe(9_000);
    expect(replay.elapsedMs).toBe(0);
    expect(replay.runSequence).toBe(2);
  });

  it("fails only at the configured safe architecture boundary", () => {
    let state = wifiSimulationReducer(initialWifiSimulationState, {
      type: "CONFIGURE_FAILURE",
      scenario: "auth-rejected"
    });
    state = startPresence(state);

    for (let index = 1; index <= 5; index += 1) {
      state = wifiSimulationReducer(state, {
        type: "ADVANCE",
        at: 1_000 + index * 100
      });
    }

    expect(state.selectedStageId).toBe("webhook");
    expect(selectStageVisualState(state, "webhook")).toBe("carrying");

    state = wifiSimulationReducer(state, { type: "FAIL", at: 1_575 });

    expect(state.status).toBe("failed");
    expect(selectFailureDefinition(state).statusCode).toBe("401");
    expect(selectStageVisualState(state, "webhook")).toBe("failed");
    expect(selectInspectorSnapshot(state).finalState).toBe("401");
    expect(JSON.stringify(state)).not.toContain("secret value");
  });

  it("ignores failure dispatches away from their configured target", () => {
    let state = wifiSimulationReducer(initialWifiSimulationState, {
      type: "CONFIGURE_FAILURE",
      scenario: "receiver-offline"
    });
    state = startPresence(state);

    const unchanged = wifiSimulationReducer(state, { type: "FAIL", at: 1_100 });
    expect(unchanged).toBe(state);
  });

  it("resets safely while retaining the selected demonstration branch", () => {
    let state = wifiSimulationReducer(initialWifiSimulationState, {
      type: "CONFIGURE_FAILURE",
      scenario: "sse-reconnecting"
    });
    state = startPresence(state);
    state = wifiSimulationReducer(state, { type: "RESET" });

    expect(state.status).toBe("idle");
    expect(state.eventId).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.failureScenario).toBe("sse-reconnecting");
  });

  it("formats measured simulation elapsed time without claiming network latency", () => {
    expect(formatSimulationElapsed(482)).toBe("482 ms");
    expect(formatSimulationElapsed(1_482)).toBe("1.48 s");
  });
});
