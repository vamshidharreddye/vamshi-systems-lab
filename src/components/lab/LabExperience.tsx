"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  EXPERIMENT_IDS,
  isExperimentId,
  type ExperimentId,
} from "@/lib/lab/models";
import { Inspectable } from "@/components/xray/Inspectable";

import { AgentRouter } from "./AgentRouter";
import { Backpressure } from "./Backpressure";
import { LatencyBudget } from "./LatencyBudget";
import { RagMicroscope } from "./RagMicroscope";
import { RetryStorm } from "./RetryStorm";
import styles from "./LabExperience.module.css";

const EXPERIMENTS: Array<{
  id: ExperimentId;
  index: string;
  title: string;
  domain: string;
  flow: string;
}> = [
  {
    id: "retry-storm",
    index: "01",
    title: "Retry Storm",
    domain: "Reliability",
    flow: "failure → amplification",
  },
  {
    id: "backpressure",
    index: "02",
    title: "Backpressure",
    domain: "Flow control",
    flow: "rates → bounded queue",
  },
  {
    id: "rag-microscope",
    index: "03",
    title: "RAG Microscope",
    domain: "Retrieval",
    flow: "query → context",
  },
  {
    id: "agent-router",
    index: "04",
    title: "Agent Router",
    domain: "Coordination",
    flow: "signals → specialist",
  },
  {
    id: "latency-budget",
    index: "05",
    title: "Latency Budget",
    domain: "Performance",
    flow: "stages → envelope",
  },
];

const PANELS: Record<ExperimentId, ReactNode> = {
  "retry-storm": <RetryStorm />,
  backpressure: <Backpressure />,
  "rag-microscope": <RagMicroscope />,
  "agent-router": <AgentRouter />,
  "latency-budget": <LatencyBudget />,
};

interface LabExperienceProps {
  initialExperiment?: ExperimentId;
}

export function LabExperience({
  initialExperiment = "retry-storm",
}: LabExperienceProps) {
  const [activeExperiment, setActiveExperiment] =
    useState<ExperimentId>(initialExperiment);
  const experimentRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePopState = () => {
      const experiment = new URL(window.location.href).searchParams.get(
        "experiment",
      );
      if (isExperimentId(experiment)) setActiveExperiment(experiment);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const rail = experimentRailRef.current;
    const activeTab = rail?.querySelector<HTMLElement>(
      `#lab-tab-${activeExperiment}`,
    );
    if (!rail || !activeTab || rail.scrollWidth <= rail.clientWidth) return;

    const left =
      activeTab.offsetLeft - (rail.clientWidth - activeTab.clientWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeExperiment]);

  const selectExperiment = (id: ExperimentId, pushHistory = true) => {
    setActiveExperiment(id);
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set("experiment", id);
      window.history.pushState({ experiment: id }, "", url);
    }
  };

  const handleTabKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let targetIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      targetIndex = (currentIndex + 1) % EXPERIMENTS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      targetIndex =
        (currentIndex - 1 + EXPERIMENTS.length) % EXPERIMENTS.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = EXPERIMENTS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = EXPERIMENTS[targetIndex];
    selectExperiment(next.id);
    document.getElementById(`lab-tab-${next.id}`)?.focus();
  };

  const activeIndex = EXPERIMENT_IDS.indexOf(activeExperiment) + 1;

  return (
    <Inspectable
      as="main"
      metadata={{ id: "lab-workbench", component: "LabExperience", route: "/lab", execution: "client", source: "deterministic TypeScript models", interactive: true }}
      id="main-content"
      className={styles.labEnvironment}
      data-component="LabExperience"
      data-execution="client"
      data-source="local deterministic models"
      data-relationship="tab rail controls persistent experiment workbench"
    >
      <div className={styles.labBackdrop} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className={styles.labHero}>
        <div className={styles.heroCoordinates} aria-hidden="true">
          <span>LAB / 05 INSTRUMENTS</span>
          <span>CLIENT RUNTIME</span>
          <span>NO REMOTE INFERENCE</span>
        </div>
        <div className={styles.heroMain}>
          <div>
            <p className={styles.heroEyebrow}>
              Interactive software-engineering laboratory
            </p>
            <h1>
              Systems become clearer
              <span>when their behavior is visible.</span>
            </h1>
          </div>
          <p className={styles.heroSummary}>
            Five deterministic instruments for failure amplification, queues,
            retrieval, routing, and latency. Change a control; the system responds
            with inspectable math and state.
          </p>
        </div>
        <div className={styles.environmentReadout}>
          <div>
            <span className={styles.liveIndicator} aria-hidden="true" />
            <strong>LAB RUNTIME READY</strong>
          </div>
          <span>local state</span>
          <span>keyboard operable</span>
          <span>deterministic outputs</span>
          <output aria-live="polite">
            instrument {String(activeIndex).padStart(2, "0")} / 05
          </output>
        </div>
      </header>

      <section className={styles.labDeck} aria-label="Engineering experiments">
        <div
          ref={experimentRailRef}
          className={styles.experimentRail}
          role="tablist"
          aria-label="Select a Lab instrument"
          aria-orientation="vertical"
        >
          <div className={styles.railHeader}>
            <span>INSTRUMENT INDEX</span>
            <small>↑ ↓ to navigate</small>
          </div>
          {EXPERIMENTS.map((experiment, index) => {
            const active = experiment.id === activeExperiment;
            return (
              <button
                id={`lab-tab-${experiment.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`lab-panel-${experiment.id}`}
                tabIndex={active ? 0 : -1}
                className={active ? styles.experimentTabActive : undefined}
                key={experiment.id}
                onClick={() => selectExperiment(experiment.id)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span className={styles.tabIndex}>{experiment.index}</span>
                <span className={styles.tabCopy}>
                  <small>{experiment.domain}</small>
                  <strong>{experiment.title}</strong>
                  <em>{experiment.flow}</em>
                </span>
                <span className={styles.tabArrow} aria-hidden="true">
                  {active ? "●" : "→"}
                </span>
              </button>
            );
          })}
          <div className={styles.railFooter}>
            <span>Execution</span>
            <strong>Browser / deterministic</strong>
            <small>No database · no paid API · no secret key</small>
          </div>
        </div>

        <div className={styles.experimentViewport}>
          {EXPERIMENTS.map((experiment) => (
            <div
              id={`lab-panel-${experiment.id}`}
              role="tabpanel"
              aria-labelledby={`lab-tab-${experiment.id}`}
              hidden={experiment.id !== activeExperiment}
              key={experiment.id}
              className={styles.experimentPanel}
            >
              {PANELS[experiment.id]}
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.labFooter}>
        <span>LAB METHODOLOGY</span>
        <p>
          Every number on this page comes from local inputs and visible rules.
          These are teaching models: useful for reasoning, deliberately smaller
          than production systems.
        </p>
        <a href="#main-content">Return to Lab controls ↑</a>
      </footer>
    </Inspectable>
  );
}
