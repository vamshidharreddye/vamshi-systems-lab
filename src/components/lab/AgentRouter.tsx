import { useMemo, useState, type CSSProperties } from "react";

import { AGENT_RULES, routePrompt } from "@/lib/lab/models";

import {
  InstrumentHeading,
  Metric,
  ModelNote,
  ResetButton,
} from "./InstrumentParts";
import styles from "./LabExperience.module.css";

const DEFAULT_PROMPT =
  "The authenticated webhook returns 401 after deployment. Trace the failure and check the secret boundary.";

const SAMPLE_PROMPTS = [
  {
    label: "Runtime defect",
    value: "Refactor the React function and add a regression test for the bug.",
  },
  {
    label: "Production signal",
    value: "Investigate p95 latency using traces, logs, and SLO alerts.",
  },
  {
    label: "Deploy path",
    value: "Deploy the Lambda and network resources to AWS with Terraform.",
  },
];

export function AgentRouter() {
  const [draft, setDraft] = useState(DEFAULT_PROMPT);
  const [routedPrompt, setRoutedPrompt] = useState(DEFAULT_PROMPT);
  const result = useMemo(() => routePrompt(routedPrompt), [routedPrompt]);
  const selected = result.rankings.find((agent) => agent.selected)!;
  const signalCount = result.rankings.reduce(
    (sum, agent) =>
      sum +
      agent.matchedSignals.filter((signal) => !signal.includes("fallback")).length,
    0,
  );

  const reset = () => {
    setDraft(DEFAULT_PROMPT);
    setRoutedPrompt(DEFAULT_PROMPT);
  };

  return (
    <article
      className={`${styles.instrument} ${styles.routerInstrument}`}
      data-component="AgentRouter"
      data-execution="client"
      data-source="transparent keyword rules"
    >
      <InstrumentHeading
        index="04"
        eyebrow="Coordinator systems"
        title="Agent Router"
        description="Send one request through transparent rule gates and inspect why a specialist receives it."
        status={`ROUTE: ${selected.label.toUpperCase()}`}
        statusDetail={`${selected.routingScore}/100 rule score`}
        tone={result.usedFallback ? "warning" : "nominal"}
        actions={<ResetButton onClick={reset} />}
      />

      <div className={styles.routerWorkbench}>
        <section className={styles.routerInputBay} aria-labelledby="router-input-title">
          <div className={styles.inputBayHeader}>
            <span>COORDINATOR INTAKE</span>
            <strong id="router-input-title">Unclassified request</strong>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setRoutedPrompt(draft.trim());
            }}
          >
            <label htmlFor="router-prompt">Request payload</label>
            <textarea
              id="router-prompt"
              rows={5}
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder="Describe a task for the coordinator…"
            />
            <div className={styles.routerSubmitRow}>
              <span>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button type="submit">Route request →</button>
            </div>
          </form>

          <div className={styles.samplePrompts}>
            <span>LOAD SAMPLE</span>
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                type="button"
                key={sample.label}
                onClick={() => {
                  setDraft(sample.value);
                  setRoutedPrompt(sample.value);
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <details className={styles.routingLogic}>
            <summary>Show routing logic</summary>
            <p>
              Lowercase phrase matching adds fixed points to each specialist.
              Highest points win; ties follow the visible lane order. Research is
              the explicit fallback when no phrase matches.
            </p>
            <div>
              {AGENT_RULES.map((agent) => (
                <section key={agent.id}>
                  <strong>{agent.label}</strong>
                  <code>
                    {agent.signals
                      .map((signal) => `${signal.phrase}:${signal.weight}`)
                      .join(" · ")}
                  </code>
                </section>
              ))}
            </div>
          </details>
        </section>

        <section className={styles.routingPlane} aria-labelledby="routing-plane-title">
          <div className={styles.planeHeader}>
            <div>
              <span>SPECIALIST LANES</span>
              <strong id="routing-plane-title">Deterministic dispatch plane</strong>
            </div>
            <small>Rule score ≠ ML confidence</small>
          </div>

          <div
            className={styles.routerBus}
            role="img"
            aria-label={`Request routed to ${selected.label} with routing score ${selected.routingScore} out of 100.`}
          >
            <div className={styles.requestPacket}>
              <span>REQ</span>
              <i aria-hidden="true" />
            </div>
            <div className={styles.busLine} aria-hidden="true" />
            <div className={styles.agentLanes}>
              {result.rankings.map((agent, index) => {
                const laneStyle = {
                  "--agent-score": `${Math.max(2, agent.routingScore)}%`,
                  "--agent-index": index,
                } as CSSProperties;
                return (
                  <article
                    className={`${styles.agentLane} ${agent.selected ? styles.agentLaneSelected : ""}`}
                    key={agent.id}
                    style={laneStyle}
                  >
                    <div className={styles.laneConnector} aria-hidden="true">
                      <span />
                    </div>
                    <header>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{agent.label}</strong>
                        <small>{agent.remit}</small>
                      </div>
                      {agent.selected ? <b>SELECTED</b> : <em>STANDBY</em>}
                    </header>
                    <div className={styles.agentSignals}>
                      {agent.matchedSignals.length > 0 ? (
                        agent.matchedSignals.map((signal) => (
                          <span key={signal}>{signal}</span>
                        ))
                      ) : (
                        <span className={styles.noSignal}>no matched signal</span>
                      )}
                    </div>
                    <footer>
                      <span className={styles.agentScoreRail} aria-hidden="true">
                        <i />
                      </span>
                      <output>{agent.routingScore}/100</output>
                    </footer>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={styles.routeInspector} aria-live="polite">
          <p>ROUTE INSPECTOR</p>
          <Metric label="Intent" value={result.intent} />
          <Metric label="Matched signals" value={signalCount} />
          <Metric label="Selected agent" value={selected.label} detail={selected.remit} />
          <Metric
            label="Routing score"
            value={`${selected.routingScore}/100`}
            detail="rule coverage, not confidence"
          />
          <div className={styles.routeDecision}>
            <span>DECISION</span>
            <strong>{selected.label}</strong>
            <small>
              {result.usedFallback
                ? "explicit exploratory fallback"
                : `${selected.points} weighted rule points`}
            </small>
          </div>
        </aside>
      </div>

      <ModelNote>
        Transparent local coordinator demo. The routing score is fixed rule
        coverage, never model confidence or a claim about production accuracy.
      </ModelNote>
    </article>
  );
}
