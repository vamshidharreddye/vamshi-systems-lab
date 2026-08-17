import type { Metadata } from "next";
import { ProjectWifiExperience } from "@/components/wifi/ProjectWifiExperience";
import { WIFI_STAGES } from "@/lib/wifi/machine";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project WiFi — Ambient Presence Infrastructure",
  description:
    "A case study of an Echo occupancy event crossing an Alexa Routine, custom skill, Lambda, ngrok, a local webhook, SSE, and a React dashboard.",
  openGraph: {
    title: "Project WiFi — Ambient Presence Infrastructure",
    description:
      "Explore the real event flow from a physical occupancy signal to an observable local interface."
  }
};

const caseStudySections = [
  { id: "context", label: "Context" },
  { id: "implementation", label: "Implementation" },
  { id: "contract", label: "Event contract" },
  { id: "backend", label: "Local receiver" },
  { id: "frontend", label: "React client" },
  { id: "sse", label: "Why SSE" },
  { id: "failure", label: "Failure behavior" },
  { id: "security", label: "Security" },
  { id: "tradeoffs", label: "Tradeoffs" },
  { id: "evolution", label: "Production evolution" }
] as const;

export default function ProjectWifiPage() {
  return (
    <main className={styles.page} id="main-content">
      <header className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>System 01 · Ambient presence infrastructure</p>
            <h1>Project WiFi</h1>
            <p className={styles.heroStatement}>
              A physical event crosses cloud automation, temporary ingress, a local
              receiver, and a one-way stream before it becomes visible state.
            </p>
          </div>
          <dl className={styles.heroFacts}>
            <div>
              <dt>source</dt>
              <dd>Private source · architecture shown</dd>
            </div>
            <div>
              <dt>signal</dt>
              <dd>Echo occupancy event</dd>
            </div>
            <div>
              <dt>receiver</dt>
              <dd>Node HTTP · localhost:8787</dd>
            </div>
            <div>
              <dt>delivery</dt>
              <dd>Server-Sent Events</dd>
            </div>
          </dl>
        </div>

        <div className={styles.heroBoundary}>
          <p>
            Despite the codename, this system does <strong>not</strong> perform Wi-Fi or
            Bluetooth sensing. It does not infer identity, coordinates, or exact location.
          </p>
          <a href="#simulation">Explore the event flow <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <section id="simulation" className={styles.simulationSection}>
        <ProjectWifiExperience />
      </section>

      <div className={styles.caseStudyLayout}>
        <aside className={styles.stickyIndex}>
          <p>Case study / 01</p>
          <nav aria-label="Project WiFi case study sections">
            <ol>
              {caseStudySections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.miniPath} aria-label="Canonical event path">
            {WIFI_STAGES.map((stage) => (
              <span key={stage.id}>{stage.shortLabel}</span>
            ))}
          </div>
        </aside>

        <article className={styles.caseStudy}>
          <section id="context" className={styles.chapter}>
            <p className={styles.chapterNumber}>01 / Context</p>
            <h2>Make an ambient signal observable.</h2>
            <p className={styles.leadParagraph}>
              The experiment asks a practical systems question: how can a supported
              household occupancy event reach software running on a developer machine,
              then become state a person can see and test?
            </p>
            <p>
              Project WiFi uses the occupancy capability exposed by a compatible Echo and
              Alexa account. The signal enters an Alexa Routine, invokes a custom skill,
              and crosses Lambda plus an ngrok tunnel before reaching a local Node process.
              The last hop is a broadcast to a React/Vite client through EventSource.
            </p>
            <div className={styles.truthNote}>
              <span>Accuracy boundary</span>
              <p>
                Occupancy support varies by device, account, and locale. The event is not
                a person identifier and should not be presented as exact location tracking.
              </p>
            </div>
          </section>

          <section id="implementation" className={styles.chapter}>
            <p className={styles.chapterNumber}>02 / Implementation</p>
            <h2>Eight stages, four distinct boundaries.</h2>
            <p>
              The implementation spans a physical device capability, Alexa cloud
              automation, a serverless outbound bridge, temporary public ingress, a local
              HTTP/SSE process, and browser state. Keeping these boundaries explicit makes
              availability and failure easier to reason about.
            </p>
            <ol className={styles.stageLedger}>
              {WIFI_STAGES.map((stage, index) => (
                <li key={stage.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{stage.label}</h3>
                    <p>{stage.description}</p>
                  </div>
                  <code>{stage.execution}</code>
                </li>
              ))}
            </ol>
          </section>

          <section id="contract" className={styles.chapter}>
            <p className={styles.chapterNumber}>03 / Event contract</p>
            <h2>Normalize aliases before state changes.</h2>
            <p>
              The webhook accepts the repository&apos;s presence family—
              <code>people_detected</code> and <code>presence</code>—plus the clear family—
              <code>no_people_detected</code>, <code>presence_cleared</code>, and
              <code>no_presence</code>. Unsupported values stop at the contract boundary
              with a <code>400</code> response.
            </p>
            <div className={styles.contractGrid}>
              <div>
                <span>accepted presence aliases</span>
                <code>people_detected</code>
                <code>presence</code>
              </div>
              <div>
                <span>accepted clear aliases</span>
                <code>no_people_detected</code>
                <code>presence_cleared</code>
                <code>no_presence</code>
              </div>
            </div>
            <div className={styles.codeFigure}>
              <div>
                <span>Portfolio simulation contract</span>
                <span>illustrative · generated in browser</span>
              </div>
              <pre>
                <code>{`{
  "eventId": "sim-presence-…",
  "type": "people_detected",
  "source": "alexa_occupancy_simulation"
}`}</code>
              </pre>
            </div>
            <p className={styles.caption}>
              This safe payload describes the portfolio simulation, not the private
              webhook&apos;s source schema.
            </p>
          </section>

          <section id="backend" className={styles.chapter}>
            <p className={styles.chapterNumber}>04 / Local receiver</p>
            <h2>One process owns normalization and broadcast.</h2>
            <p>
              A Node HTTP server listens on port <code>8787</code>. The webhook handler
              validates the inbound event, updates a shared occupancy reducer/model, and
              broadcasts the full model to every connected SSE client. That model includes
              room, Alexa, test, and connection-oriented state with an eight-event rolling
              log.
            </p>
            <div className={styles.behaviorRows}>
              <div>
                <span>webhook</span>
                <p>validate → normalize → reduce → broadcast</p>
              </div>
              <div>
                <span>state</span>
                <p>in-memory full model · rolling eight-event log</p>
              </div>
              <div>
                <span>fan-out</span>
                <p>all connected EventSource clients receive the current model</p>
              </div>
              <div>
                <span>lifecycle</span>
                <p>state resets whenever the local process restarts</p>
              </div>
            </div>
          </section>

          <section id="frontend" className={styles.chapter}>
            <p className={styles.chapterNumber}>05 / React client</p>
            <h2>The interface reflects connection state, not just occupancy.</h2>
            <p>
              The React/Vite client opens an <code>EventSource</code>, reduces each full
              snapshot, and marks the local receiver offline when the stream disconnects.
              Controls in the repository support simulate, clear, reset, and a five-minute
              test path, so the system can be exercised without waiting for a physical
              trigger every time.
            </p>
            <blockquote>
              An observable system shows whether the data path itself is available. A
              presence indicator without receiver state would hide the most important
              failure mode.
            </blockquote>
          </section>

          <section id="sse" className={styles.chapter}>
            <p className={styles.chapterNumber}>06 / Why SSE</p>
            <h2>The browser only needs a one-way state stream.</h2>
            <p>
              After controls or cloud events reach the receiver, updates travel from server
              to browser. SSE fits that direction with the browser&apos;s native EventSource API,
              a text stream, and reconnection semantics. The repository advertises a
              <code>1,500 ms</code> retry interval.
            </p>
            <div className={styles.comparison}>
              <div>
                <h3>SSE</h3>
                <p>Native one-way stream, automatic reconnection, simple event delivery.</p>
              </div>
              <div>
                <h3>Polling</h3>
                <p>Operationally simple, but repeats requests even when state is unchanged.</p>
              </div>
              <div>
                <h3>WebSocket</h3>
                <p>Useful for full duplex protocols; more machinery than this path needs.</p>
              </div>
            </div>
            <p className={styles.caption}>
              This is a contextual tradeoff, not a claim that SSE is universally superior.
            </p>
          </section>

          <section id="failure" className={styles.chapter}>
            <p className={styles.chapterNumber}>07 / Failure behavior</p>
            <h2>Each boundary has a different recovery story.</h2>
            <div className={styles.failureTable} role="table" aria-label="Failure behavior">
              <div role="row" className={styles.failureHeader}>
                <span role="columnheader">Boundary</span>
                <span role="columnheader">Observed behavior</span>
                <span role="columnheader">Implication</span>
              </div>
              <div role="row">
                <strong role="cell">Lambda</strong>
                <p role="cell">Outbound request aborts after 8 seconds.</p>
                <p role="cell">Alexa returns a spoken unreachable failure.</p>
              </div>
              <div role="row">
                <strong role="cell">ngrok / receiver</strong>
                <p role="cell">Tunnel URL or local process is unavailable.</p>
                <p role="cell">The cloud bridge cannot deliver the event.</p>
              </div>
              <div role="row">
                <strong role="cell">Webhook auth</strong>
                <p role="cell">Optional secret mismatch returns 401.</p>
                <p role="cell">No unauthorized event enters shared state.</p>
              </div>
              <div role="row">
                <strong role="cell">Event contract</strong>
                <p role="cell">Unsupported alias returns 400.</p>
                <p role="cell">Malformed state cannot propagate downstream.</p>
              </div>
              <div role="row">
                <strong role="cell">SSE client</strong>
                <p role="cell">EventSource disconnects and retries.</p>
                <p role="cell">The UI marks the receiver offline.</p>
              </div>
            </div>
          </section>

          <section id="security" className={styles.chapter}>
            <p className={styles.chapterNumber}>08 / Security</p>
            <h2>Authenticate the ingress without leaking the credential.</h2>
            <p>
              The local webhook can validate a secret supplied through the
              <code>x-alexa-webhook-secret</code> header or request body. A mismatch returns
              <code>401</code>. The secret is removed before a response or model broadcast,
              keeping it out of the browser-facing SSE payload.
            </p>
            <div className={styles.truthNote}>
              <span>Public case-study boundary</span>
              <p>
                This page exposes architectural behavior only. It contains no tunnel URL,
                credential, private source link, private IP, or deployable secret value.
              </p>
            </div>
          </section>

          <section id="tradeoffs" className={styles.chapter}>
            <p className={styles.chapterNumber}>09 / Tradeoffs</p>
            <h2>The development bridge is intentionally temporary.</h2>
            <ul className={styles.tradeoffList}>
              <li>
                <strong>Local availability</strong>
                <p>The Node receiver and the ngrok tunnel must remain active.</p>
              </li>
              <li>
                <strong>Ecosystem dependency</strong>
                <p>Occupancy events depend on supported Echo hardware, account, and locale.</p>
              </li>
              <li>
                <strong>Ephemeral state</strong>
                <p>The shared model and rolling log disappear when the process restarts.</p>
              </li>
              <li>
                <strong>One-way delivery</strong>
                <p>SSE matches browser updates, but is not a full duplex command protocol.</p>
              </li>
            </ul>
          </section>

          <section id="evolution" className={styles.chapter}>
            <p className={styles.chapterNumber}>10 / Production evolution</p>
            <h2>What a managed version could add.</h2>
            <p>
              These are possible next steps, not features claimed by the current project.
            </p>
            <ol className={styles.evolutionList}>
              <li><span>01</span><p>Managed ingress instead of a development tunnel.</p></li>
              <li><span>02</span><p>Rate limiting and stronger request authentication.</p></li>
              <li><span>03</span><p>A durable event queue for receiver outages and replay.</p></li>
              <li><span>04</span><p>Structured logs, traces, and delivery health metrics.</p></li>
              <li><span>05</span><p>Infrastructure as code and explicit secret rotation.</p></li>
              <li><span>06</span><p>Persistent history only if product requirements justify it.</p></li>
            </ol>
          </section>
        </article>
      </div>
    </main>
  );
}
