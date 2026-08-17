export const EXPERIMENT_IDS = [
  "retry-storm",
  "backpressure",
  "rag-microscope",
  "agent-router",
  "latency-budget",
] as const;

export type ExperimentId = (typeof EXPERIMENT_IDS)[number];

export function isExperimentId(value: unknown): value is ExperimentId {
  return (
    typeof value === "string" &&
    EXPERIMENT_IDS.includes(value as ExperimentId)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

// Retry Storm ---------------------------------------------------------------

export interface RetryInputs {
  incomingRequests: number;
  failureRate: number;
  retries: number;
  backoffMs: number;
}

export interface RetryRound {
  round: number;
  label: string;
  expectedAttempts: number;
  scheduledAtMs: number;
}

export interface RetryResult {
  attemptsByRound: RetryRound[];
  totalAttempts: number;
  extraAttempts: number;
  amplification: number;
  exhaustedRequests: number;
  recoveryWindowMs: number;
}

/**
 * A deliberately simplified expectation model. Each failed round is eligible
 * for one more attempt. Backoff changes scheduling, not the expected count.
 */
export function calculateRetryStorm(input: RetryInputs): RetryResult {
  const incomingRequests = clamp(input.incomingRequests, 0, 1_000_000);
  const failureProbability = clamp(input.failureRate, 0, 100) / 100;
  const retries = Math.round(clamp(input.retries, 0, 10));
  const backoffMs = Math.round(clamp(input.backoffMs, 0, 60_000));

  let scheduledAtMs = 0;
  const attemptsByRound = Array.from({ length: retries + 1 }, (_, roundIndex) => {
    if (roundIndex > 0) {
      scheduledAtMs += backoffMs * 2 ** (roundIndex - 1);
    }

    return {
      round: roundIndex,
      label: roundIndex === 0 ? "Original" : `Retry ${roundIndex}`,
      expectedAttempts: round(
        incomingRequests * failureProbability ** roundIndex,
      ),
      scheduledAtMs,
    };
  });

  const totalAttempts = round(
    attemptsByRound.reduce((sum, item) => sum + item.expectedAttempts, 0),
  );
  const exhaustedRequests = round(
    incomingRequests * failureProbability ** (retries + 1),
  );

  return {
    attemptsByRound,
    totalAttempts,
    extraAttempts: round(Math.max(0, totalAttempts - incomingRequests)),
    amplification:
      incomingRequests === 0 ? 0 : round(totalAttempts / incomingRequests, 3),
    exhaustedRequests,
    recoveryWindowMs: scheduledAtMs,
  };
}

// Backpressure --------------------------------------------------------------

export interface QueueInputs {
  producerRate: number;
  consumerRate: number;
  capacity: number;
  applyBackpressure: boolean;
  highWatermark?: number;
}

export interface QueueSample {
  tick: number;
  depth: number;
}

export interface QueueState {
  tick: number;
  queued: number;
  droppedTotal: number;
  processedTotal: number;
  admittedTotal: number;
  throttledTotal: number;
  lastAdmitted: number;
  lastProcessed: number;
  lastDropped: number;
  lastThrottled: number;
  history: QueueSample[];
}

export function createQueueState(): QueueState {
  return {
    tick: 0,
    queued: 0,
    droppedTotal: 0,
    processedTotal: 0,
    admittedTotal: 0,
    throttledTotal: 0,
    lastAdmitted: 0,
    lastProcessed: 0,
    lastDropped: 0,
    lastThrottled: 0,
    history: [{ tick: 0, depth: 0 }],
  };
}

/** Advance the bounded queue by one deterministic one-second interval. */
export function stepQueue(
  state: QueueState,
  input: QueueInputs,
): QueueState {
  const producerRate = Math.round(clamp(input.producerRate, 0, 100_000));
  const consumerRate = Math.round(clamp(input.consumerRate, 0, 100_000));
  const capacity = Math.max(1, Math.round(clamp(input.capacity, 1, 1_000_000)));
  const highWatermark = clamp(input.highWatermark ?? 0.72, 0.1, 1);
  const currentDepth = Math.min(state.queued, capacity);
  const underPressure = currentDepth / capacity >= highWatermark;
  const admitted =
    input.applyBackpressure && underPressure
      ? Math.min(producerRate, consumerRate)
      : producerRate;
  const throttled = Math.max(0, producerRate - admitted);
  const available = currentDepth + admitted;
  const processed = Math.min(available, consumerRate);
  const remaining = Math.max(0, available - processed);
  const queued = Math.min(capacity, remaining);
  const dropped = Math.max(0, remaining - capacity);
  const tick = state.tick + 1;
  const history = [...state.history, { tick, depth: queued }].slice(-30);

  return {
    tick,
    queued,
    droppedTotal: state.droppedTotal + dropped,
    processedTotal: state.processedTotal + processed,
    admittedTotal: state.admittedTotal + admitted,
    throttledTotal: state.throttledTotal + throttled,
    lastAdmitted: admitted,
    lastProcessed: processed,
    lastDropped: dropped,
    lastThrottled: throttled,
    history,
  };
}

export function queueStatus(state: QueueState, capacity: number) {
  const utilization = state.queued / Math.max(1, capacity);
  if (utilization >= 1) return "saturated" as const;
  if (utilization >= 0.72) return "pressure" as const;
  return "stable" as const;
}

// RAG Microscope ------------------------------------------------------------

export interface RagDocument {
  id: string;
  title: string;
  content: string;
}

export const RAG_DOCUMENTS: RagDocument[] = [
  {
    id: "event-delivery",
    title: "Event delivery",
    content:
      "A physical occupancy signal enters an Alexa Routine and invokes a custom skill. Lambda translates the intent into an authenticated webhook request. A temporary HTTPS tunnel carries the request to a local receiver. The receiver validates the event, updates an in-memory model, and broadcasts the new state over Server-Sent Events. The React interface renders presence, source, device, timestamp, and connection health. If the tunnel is unavailable, the event cannot reach localhost and the interface must show the stream as offline.",
  },
  {
    id: "queue-safety",
    title: "Queue safety",
    content:
      "Backpressure protects a slow consumer by controlling admission before a bounded queue is full. Without a limit, queued work increases latency and consumes memory. With a high-water mark, a producer can be throttled to the drain rate. Load shedding rejects excess work when capacity is exhausted. Retries need jitter and bounded attempts because immediate retries amplify an unhealthy dependency. Queue depth, drop count, and processing rate are useful operational signals.",
  },
  {
    id: "retrieval-notes",
    title: "Retrieval notes",
    content:
      "A local retrieval pipeline extracts text, divides it into overlapping chunks, and computes a searchable representation. A query is compared with each chunk and the top ranked passages enter a finite context window. Chunk size changes how much surrounding meaning travels together. Overlap reduces boundary loss but duplicates tokens. Top K trades broader evidence for context pressure. Source metadata should remain attached so an answer can point back to the local document.",
  },
  {
    id: "latency-envelope",
    title: "Latency envelope",
    content:
      "A latency budget allocates a target across gateway, network, service, cache, database, and inference work. The total is a design envelope rather than a measured percentile. Median latency describes a typical request while p95 and p99 reveal progressively rarer tail behavior. A healthy design reserves headroom for variance instead of assigning every millisecond to the happy path.",
  },
];

export interface RagChunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  startWord: number;
  endWord: number;
  text: string;
  tokens: string[];
}

export interface RankedChunk extends RagChunk {
  score: number;
  relativeScore: number;
  rank: number;
  selected: boolean;
}

export function tokenize(value: string): string[] {
  return (
    value
      .toLowerCase()
      .match(/[a-z0-9]+(?:-[a-z0-9]+)*/g)
      ?.filter((token) => token.length > 1) ?? []
  );
}

export function chunkDocuments(
  documents: RagDocument[],
  requestedChunkSize: number,
  requestedOverlap: number,
): RagChunk[] {
  const chunkSize = Math.round(clamp(requestedChunkSize, 4, 200));
  const overlap = Math.round(clamp(requestedOverlap, 0, chunkSize - 1));
  const stride = Math.max(1, chunkSize - overlap);
  const chunks: RagChunk[] = [];

  for (const document of documents) {
    const words = document.content.trim().split(/\s+/).filter(Boolean);
    for (let start = 0, index = 0; start < words.length; start += stride, index += 1) {
      const slice = words.slice(start, start + chunkSize);
      if (slice.length === 0) break;
      chunks.push({
        id: `${document.id}-${index}`,
        sourceId: document.id,
        sourceTitle: document.title,
        startWord: start,
        endWord: start + slice.length - 1,
        text: slice.join(" "),
        tokens: tokenize(slice.join(" ")),
      });
      if (start + chunkSize >= words.length) break;
    }
  }

  return chunks;
}

export function rankChunks(
  chunks: RagChunk[],
  query: string,
  requestedTopK: number,
): RankedChunk[] {
  const queryTokens = [...new Set(tokenize(query))];
  const documentFrequency = new Map<string, number>();

  for (const token of queryTokens) {
    documentFrequency.set(
      token,
      chunks.filter((chunk) => chunk.tokens.includes(token)).length,
    );
  }

  const scored = chunks.map((chunk) => {
    const tokenCounts = new Map<string, number>();
    for (const token of chunk.tokens) {
      tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
    }

    const weightedMatches = queryTokens.reduce((sum, token) => {
      const frequency = tokenCounts.get(token) ?? 0;
      const inverseDocumentFrequency =
        Math.log((chunks.length + 1) / ((documentFrequency.get(token) ?? 0) + 1)) +
        1;
      return sum + frequency * inverseDocumentFrequency;
    }, 0);
    const coverage =
      queryTokens.length === 0
        ? 0
        : queryTokens.filter((token) => tokenCounts.has(token)).length /
          queryTokens.length;
    const lengthNormalization = Math.sqrt(Math.max(1, chunk.tokens.length));

    return {
      ...chunk,
      score: round(weightedMatches / lengthNormalization + coverage, 4),
    };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.id.localeCompare(right.id);
  });

  const topK = Math.round(clamp(requestedTopK, 1, Math.max(1, chunks.length)));
  const maxScore = scored[0]?.score ?? 0;

  return scored.map((chunk, index) => ({
    ...chunk,
    rank: index + 1,
    selected: index < topK,
    relativeScore: maxScore === 0 ? 0 : round((chunk.score / maxScore) * 100, 1),
  }));
}

// Agent Router --------------------------------------------------------------

export type AgentId =
  | "code"
  | "infrastructure"
  | "observability"
  | "research"
  | "security";

export interface AgentRule {
  id: AgentId;
  label: string;
  remit: string;
  signals: Array<{ phrase: string; weight: number }>;
}

export const AGENT_RULES: AgentRule[] = [
  {
    id: "code",
    label: "Code",
    remit: "Implementation, tests, runtime defects",
    signals: [
      { phrase: "bug", weight: 3 },
      { phrase: "function", weight: 2 },
      { phrase: "typescript", weight: 3 },
      { phrase: "react", weight: 3 },
      { phrase: "test", weight: 2 },
      { phrase: "refactor", weight: 2 },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    remit: "Provisioning, deployment, networks",
    signals: [
      { phrase: "aws", weight: 3 },
      { phrase: "deploy", weight: 3 },
      { phrase: "network", weight: 2 },
      { phrase: "lambda", weight: 2 },
      { phrase: "terraform", weight: 3 },
      { phrase: "container", weight: 2 },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    remit: "Logs, metrics, traces, production signals",
    signals: [
      { phrase: "latency", weight: 3 },
      { phrase: "trace", weight: 3 },
      { phrase: "metric", weight: 2 },
      { phrase: "log", weight: 2 },
      { phrase: "alert", weight: 2 },
      { phrase: "slo", weight: 3 },
    ],
  },
  {
    id: "research",
    label: "Research",
    remit: "Unknowns, comparisons, evidence gathering",
    signals: [
      { phrase: "compare", weight: 3 },
      { phrase: "research", weight: 3 },
      { phrase: "paper", weight: 2 },
      { phrase: "evaluate", weight: 2 },
      { phrase: "why", weight: 1 },
      { phrase: "tradeoff", weight: 2 },
    ],
  },
  {
    id: "security",
    label: "Security",
    remit: "Authentication, exposure, abuse paths",
    signals: [
      { phrase: "401", weight: 4 },
      { phrase: "secret", weight: 3 },
      { phrase: "authentication", weight: 3 },
      { phrase: "authorization", weight: 3 },
      { phrase: "vulnerability", weight: 4 },
      { phrase: "threat", weight: 3 },
      { phrase: "webhook", weight: 1 },
    ],
  },
];

export interface AgentRoute {
  selectedAgent: AgentId;
  intent: string;
  rankings: Array<{
    id: AgentId;
    label: string;
    remit: string;
    points: number;
    routingScore: number;
    matchedSignals: string[];
    selected: boolean;
  }>;
  usedFallback: boolean;
}

export function routePrompt(prompt: string): AgentRoute {
  const normalizedPrompt = prompt.toLowerCase();
  const matches = AGENT_RULES.map((agent, index) => {
    const matched = agent.signals.filter(({ phrase }) =>
      normalizedPrompt.includes(phrase),
    );
    const points = matched.reduce((sum, signal) => sum + signal.weight, 0);
    const possiblePoints = agent.signals.reduce(
      (sum, signal) => sum + signal.weight,
      0,
    );
    return {
      ...agent,
      index,
      points,
      routingScore: Math.round((points / possiblePoints) * 100),
      matchedSignals: matched.map(({ phrase, weight }) => `${phrase} +${weight}`),
    };
  });

  const ordered = [...matches].sort((left, right) => {
    if (right.points !== left.points) return right.points - left.points;
    return left.index - right.index;
  });
  const usedFallback = (ordered[0]?.points ?? 0) === 0;
  const selectedAgent = usedFallback ? "research" : ordered[0].id;

  const rankings = matches
    .map((agent) => ({
      id: agent.id,
      label: agent.label,
      remit: agent.remit,
      points:
        usedFallback && agent.id === "research" ? 1 : agent.points,
      routingScore:
        usedFallback && agent.id === "research" ? 8 : agent.routingScore,
      matchedSignals:
        usedFallback && agent.id === "research"
          ? ["no explicit signal · fallback"]
          : agent.matchedSignals,
      selected: agent.id === selectedAgent,
    }))
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points;
      return (
        AGENT_RULES.findIndex((agent) => agent.id === left.id) -
        AGENT_RULES.findIndex((agent) => agent.id === right.id)
      );
    });

  const selected = rankings.find((agent) => agent.selected)!;
  return {
    selectedAgent,
    intent: usedFallback
      ? "Exploratory request with no explicit specialist signal"
      : `${selected.label} request · ${selected.matchedSignals.length} matched signal${selected.matchedSignals.length === 1 ? "" : "s"}`,
    rankings,
    usedFallback,
  };
}

// Latency Budget ------------------------------------------------------------

export const LATENCY_STAGES = [
  { id: "gateway", label: "Gateway", shortLabel: "GW" },
  { id: "service", label: "Service", shortLabel: "SVC" },
  { id: "cache", label: "Cache", shortLabel: "CACHE" },
  { id: "database", label: "Database", shortLabel: "DB" },
  { id: "inference", label: "Model / inference", shortLabel: "MODEL" },
  { id: "network", label: "Network", shortLabel: "NET" },
] as const;

export type LatencyStageId = (typeof LATENCY_STAGES)[number]["id"];
export type PercentileLens = "p50" | "p95" | "p99";

export interface LatencyBudgetState {
  targetMs: number;
  lens: PercentileLens;
  allocations: Record<LatencyStageId, number>;
}

export const DEFAULT_LATENCY_STATE: LatencyBudgetState = {
  targetMs: 700,
  lens: "p95",
  allocations: {
    gateway: 45,
    service: 110,
    cache: 25,
    database: 135,
    inference: 320,
    network: 80,
  },
};

export const PERCENTILE_GUIDANCE: Record<
  PercentileLens,
  { label: string; note: string; illustrativeFactor: number }
> = {
  p50: {
    label: "Typical path",
    note: "Half of observed requests would be at or below a measured p50.",
    illustrativeFactor: 0.72,
  },
  p95: {
    label: "Tail-aware path",
    note: "A measured p95 leaves five percent of requests beyond the threshold.",
    illustrativeFactor: 1,
  },
  p99: {
    label: "Extreme tail",
    note: "A measured p99 focuses attention on the slowest one percent.",
    illustrativeFactor: 1.28,
  },
};

export type LatencyBudgetAction =
  | { type: "set-stage"; stage: LatencyStageId; value: number }
  | { type: "set-target"; value: number }
  | { type: "set-lens"; lens: PercentileLens }
  | { type: "reset" };

function copyDefaultLatencyState(): LatencyBudgetState {
  return {
    ...DEFAULT_LATENCY_STATE,
    allocations: { ...DEFAULT_LATENCY_STATE.allocations },
  };
}

export function latencyBudgetReducer(
  state: LatencyBudgetState,
  action: LatencyBudgetAction,
): LatencyBudgetState {
  switch (action.type) {
    case "set-stage":
      return {
        ...state,
        allocations: {
          ...state.allocations,
          [action.stage]: Math.round(clamp(action.value, 0, 2_000)),
        },
      };
    case "set-target":
      return {
        ...state,
        targetMs: Math.round(clamp(action.value, 100, 5_000)),
      };
    case "set-lens":
      return { ...state, lens: action.lens };
    case "reset":
      return copyDefaultLatencyState();
    default:
      return state;
  }
}

export function calculateLatencyBudget(state: LatencyBudgetState) {
  const allocatedMs = LATENCY_STAGES.reduce(
    (sum, stage) => sum + state.allocations[stage.id],
    0,
  );
  const guidance = PERCENTILE_GUIDANCE[state.lens];
  const illustrativeEnvelopeMs = Math.round(
    allocatedMs * guidance.illustrativeFactor,
  );
  const remainingMs = state.targetMs - illustrativeEnvelopeMs;

  return {
    allocatedMs,
    illustrativeEnvelopeMs,
    remainingMs,
    exceeded: remainingMs < 0,
    utilization: round(
      (illustrativeEnvelopeMs / Math.max(1, state.targetMs)) * 100,
      1,
    ),
    guidance,
  };
}
