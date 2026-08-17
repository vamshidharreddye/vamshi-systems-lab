import { describe, expect, it } from "vitest";

import {
  DEFAULT_LATENCY_STATE,
  RAG_DOCUMENTS,
  calculateLatencyBudget,
  calculateRetryStorm,
  chunkDocuments,
  createQueueState,
  latencyBudgetReducer,
  queueStatus,
  rankChunks,
  routePrompt,
  stepQueue,
} from "./models";

describe("retry storm model", () => {
  it("uses a geometric expectation and keeps backoff out of attempt count", () => {
    const immediate = calculateRetryStorm({
      incomingRequests: 100,
      failureRate: 50,
      retries: 2,
      backoffMs: 0,
    });
    const spaced = calculateRetryStorm({
      incomingRequests: 100,
      failureRate: 50,
      retries: 2,
      backoffMs: 200,
    });

    expect(immediate.attemptsByRound.map((round) => round.expectedAttempts)).toEqual([
      100, 50, 25,
    ]);
    expect(immediate.totalAttempts).toBe(175);
    expect(spaced.totalAttempts).toBe(175);
    expect(spaced.recoveryWindowMs).toBe(600);
  });
});

describe("bounded queue model", () => {
  it("saturates and sheds when producer load stays above drain rate", () => {
    const input = {
      producerRate: 100,
      consumerRate: 20,
      capacity: 100,
      applyBackpressure: false,
    };
    const afterOne = stepQueue(createQueueState(), input);
    const afterTwo = stepQueue(afterOne, input);

    expect(afterOne.queued).toBe(80);
    expect(afterTwo.queued).toBe(100);
    expect(afterTwo.lastDropped).toBe(60);
    expect(queueStatus(afterTwo, input.capacity)).toBe("saturated");
  });

  it("holds near the high-water mark by throttling admission", () => {
    const input = {
      producerRate: 100,
      consumerRate: 40,
      capacity: 200,
      applyBackpressure: true,
    };
    let state = createQueueState();
    for (let index = 0; index < 8; index += 1) state = stepQueue(state, input);

    expect(state.queued).toBeLessThanOrEqual(input.capacity);
    expect(state.throttledTotal).toBeGreaterThan(0);
    expect(state.droppedTotal).toBe(0);
  });
});

describe("RAG microscope", () => {
  it("creates deterministic overlapping windows", () => {
    const chunks = chunkDocuments(
      [{ id: "a", title: "A", content: "one two three four five six seven" }],
      4,
      2,
    );

    expect(chunks.map((chunk) => chunk.text)).toEqual([
      "one two three four",
      "three four five six",
      "five six seven",
    ]);
  });

  it("ranks the queue document first for a backpressure query", () => {
    const chunks = chunkDocuments(RAG_DOCUMENTS, 28, 6);
    const ranked = rankChunks(
      chunks,
      "How does backpressure protect a slow consumer queue?",
      2,
    );

    expect(ranked[0].sourceId).toBe("queue-safety");
    expect(ranked.filter((chunk) => chunk.selected)).toHaveLength(2);
  });
});

describe("transparent agent router", () => {
  it("routes authentication failures to the security specialist", () => {
    const route = routePrompt(
      "Why does my authenticated webhook return 401 after deployment?",
    );

    expect(route.selectedAgent).toBe("security");
    expect(route.rankings[0].matchedSignals).toContain("401 +4");
    expect(route.usedFallback).toBe(false);
  });

  it("uses a named research fallback when no rule matches", () => {
    const route = routePrompt("Tell me something interesting");
    expect(route.selectedAgent).toBe("research");
    expect(route.usedFallback).toBe(true);
  });
});

describe("latency budget reducer", () => {
  it("updates one stage without mutating the previous state", () => {
    const next = latencyBudgetReducer(DEFAULT_LATENCY_STATE, {
      type: "set-stage",
      stage: "database",
      value: 200,
    });

    expect(next.allocations.database).toBe(200);
    expect(DEFAULT_LATENCY_STATE.allocations.database).toBe(135);
  });

  it("makes the illustrative tail envelope explicit", () => {
    const p95 = calculateLatencyBudget(DEFAULT_LATENCY_STATE);
    const p99 = calculateLatencyBudget({
      ...DEFAULT_LATENCY_STATE,
      lens: "p99",
    });

    expect(p99.illustrativeEnvelopeMs).toBeGreaterThan(
      p95.illustrativeEnvelopeMs,
    );
    expect(p99.exceeded).toBe(true);
  });

  it("resets nested allocations", () => {
    const changed = latencyBudgetReducer(DEFAULT_LATENCY_STATE, {
      type: "set-stage",
      stage: "gateway",
      value: 999,
    });
    const reset = latencyBudgetReducer(changed, { type: "reset" });

    expect(reset).toEqual(DEFAULT_LATENCY_STATE);
    expect(reset.allocations).not.toBe(DEFAULT_LATENCY_STATE.allocations);
  });
});
