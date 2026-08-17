import { ArrowUpRight, Code2, Mail, Network } from "lucide-react";
import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import { Inspectable } from "@/components/xray/Inspectable";

import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Vamshi Endurthi approaches AI systems, infrastructure, observability, local-first tools, and developer experience."
};

const themes = [
  "AI systems",
  "Distributed systems",
  "Cloud infrastructure",
  "Observability",
  "Local-first tools",
  "Developer productivity"
];

const principles = [
  {
    title: "Make behavior observable",
    copy: "A system is easier to trust when its state transitions, boundaries, and failure paths can be inspected instead of inferred."
  },
  {
    title: "Prefer explicit failure modes",
    copy: "Degraded, saturated, stale, and unavailable are useful states. Hiding them behind a generic success surface is not."
  },
  {
    title: "Design for recovery",
    copy: "Retries, queues, reconnection, and fallbacks only help when their limits and recovery semantics are part of the design."
  },
  {
    title: "Keep humans in the loop",
    copy: "AI interfaces should expose sources, routing, context, and uncertainty so a person can evaluate the system's work."
  },
  {
    title: "Earn the abstraction",
    copy: "Understand the data path and operational constraint first. Add abstraction when it makes those mechanics clearer or safer."
  }
];

export default function AboutPage() {
  return (
    <Inspectable as="main" metadata={{ id: "about-page", component: "AboutPage", route: "/about", execution: "static", source: "repository content + optional public env" }} className={styles.aboutPage} id="main-content" data-xray="about-page">
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>ABOUT / ENGINEERING PRACTICE</span>
          <h1>I build systems to understand how they behave.</h1>
        </div>
        <div className={styles.introCopy}>
          <p>
            I’m Vamshi Endurthi, a software engineer drawn to the boundaries between models,
            software, infrastructure, and the physical world. This lab is where those systems
            become visible, testable, and explainable.
          </p>
          <span className={styles.availability}>BUILDING / LEARNING / DOCUMENTING</span>
        </div>
      </header>

      <section className={styles.themes} aria-labelledby="themes-title">
        <span className={styles.sectionLabel} id="themes-title">BUILDING THEMES</span>
        <div className={styles.themeMap}>
          {themes.map((theme, index) => (
            <div className={styles.theme} key={theme}>
              <span className={styles.themeIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{theme}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <span className={styles.sectionLabel} id="principles-title">HOW I THINK</span>
        <ol className={styles.principleList}>
          {principles.map((principle, index) => (
            <li className={styles.principle} key={principle.title}>
              <span className={styles.principleIndex}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{principle.title}</h2>
              <p>{principle.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <span className={styles.sectionLabel}>CONTACT / EXTERNAL</span>
        <div className={styles.contactContent}>
          <h2 id="contact-title">A useful system usually starts with a good question.</h2>
          <p>
            Explore the architecture, inspect a Lab experiment, or use one of the direct channels
            below. There is no database-backed contact form pretending to send a message.
          </p>
          <div className={styles.contactLinks}>
            <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
              <Code2 size={15} aria-hidden="true" /> GitHub
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            {siteConfig.linkedin ? (
              <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer">
                <Network size={15} aria-hidden="true" /> LinkedIn
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            ) : null}
            {siteConfig.email ? (
              <a href={`mailto:${siteConfig.email}`}>
                <Mail size={15} aria-hidden="true" /> Email
              </a>
            ) : null}
            {siteConfig.resume ? (
              <a href={siteConfig.resume} target="_blank" rel="noopener noreferrer">
                Résumé <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </Inspectable>
  );
}
