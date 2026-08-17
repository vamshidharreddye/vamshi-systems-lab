"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpenText, Check, ChevronRight, CircleDot, Command, Gauge, Pause, Pin, Play, Search, ShieldCheck } from "lucide-react";
import { Inspectable } from "@/components/xray/Inspectable";
import { HeroSystemObject } from "./HeroSystemObject";
import styles from "./Home.module.css";

const wifiStages = ["Echo", "Routine", "Skill", "Lambda", "ngrok", "webhook", "SSE", "React"];

function WifiFeature() {
  const [stage, setStage] = useState(-1);
  const [eventType, setEventType] = useState<"people_detected" | "presence_cleared">("people_detected");
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(0);
  const reduced = useReducedMotion();

  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  const run = (type: typeof eventType) => {
    stop(); setEventType(type); started.current = performance.now(); setStage(0); setElapsed(0);
    if (reduced) { setStage(wifiStages.length - 1); setElapsed(Math.round(performance.now() - started.current)); return; }
    let next = 0;
    timer.current = setInterval(() => {
      next += 1; setStage(next); setElapsed(Math.round(performance.now() - started.current));
      if (next >= wifiStages.length - 1) stop();
    }, 360);
  };

  return (
    <section className={styles.wifiFeature}>
      <div className={styles.wifiTopline}><span>01 / SIGNATURE SYSTEM</span><span>INTERACTIVE ARCHITECTURE SIMULATION</span><span data-state={stage >= wifiStages.length - 1 ? "complete" : "standby"}>{stage >= 0 ? "EVENT IN FLIGHT" : "READY"}</span></div>
      <div className={styles.wifiHeading}><div><p className="eyebrow">Physical event → live interface</p><h2>Project WiFi</h2><p>Ambient presence infrastructure observed as a distributed event—not presented as a static diagram.</p></div><Link href="/systems/project-wifi" className="signal-button">Explore system <ArrowRight size={15} /></Link></div>
      <div className={styles.wifiTheater}>
        <div className={styles.wifiPipeline} role="list" aria-label="Project WiFi event pipeline">
          <div className={styles.wifiLine} aria-hidden="true"><motion.span animate={{ width: stage < 0 ? "0%" : `${(stage / (wifiStages.length - 1)) * 100}%` }} /></div>
          {wifiStages.map((item,index) => <button key={item} type="button" role="listitem" className={styles.wifiNode} data-state={index < stage ? "passed" : index === stage ? "active" : "idle"} onClick={() => setStage(index)} aria-label={`Inspect ${item} stage`}><span>0{index + 1}</span><i /><strong>{item}</strong><small>{["device","orchestration","voice bridge","compute","public ingress","normalization","event stream","interface"][index]}</small></button>)}
        </div>
        <aside className={styles.eventInspector} aria-live="polite">
          <div><span>EVENT INSPECTOR</span><CircleDot size={14} /></div>
          <dl><dt>event</dt><dd>{stage < 0 ? "—" : eventType}</dd><dt>stage</dt><dd>{stage < 0 ? "waiting" : wifiStages[stage]}</dd><dt>source</dt><dd>alexa_occupancy_simulation</dd><dt>transport</dt><dd>{stage < 0 ? "—" : stage < 4 ? "voice / invoke" : stage < 6 ? "HTTPS / POST" : "text/event-stream"}</dd><dt>state</dt><dd>{stage >= wifiStages.length - 1 ? (eventType === "people_detected" ? "presence_detected" : "clear") : "propagating"}</dd><dt>simulation elapsed</dt><dd>{elapsed} ms</dd></dl>
          <div className={styles.inspectorActions}><button type="button" onClick={() => run("people_detected")}><Play size={13} /> Simulate presence</button><button type="button" onClick={() => run("presence_cleared")}><Pause size={13} /> Clear</button></div>
        </aside>
      </div>
    </section>
  );
}

function SystemsTableau() {
  const [query, setQuery] = useState("event pipeline");
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState("Interview");
  const [network, setNetwork] = useState<"guarded" | "running">("guarded");
  return (
    <section className={styles.systemsSection}>
      <div className={styles.systemsIntro}><div><p className="eyebrow">Selected systems</p><h2 className="section-title">Five systems.<br />Five behaviors.</h2></div><p>Shared engineering principles, deliberately different interaction models. No repeated project-card shell.</p></div>
      <div className={styles.systemsTableau}>
        <Link href="/systems#local-ai" className={styles.localAiPreview} id="home-local-ai"><div className={styles.previewLabel}><span>02</span><strong>Local AI</strong><small>RETRIEVAL MICROSCOPE</small></div><div className={styles.chunkField}>{[.28,.64,.46,.83,.36,.72,.52,.9,.43,.67,.31,.76].map((value,index) => <i key={index} style={{ height: `${value * 100}%` }} data-selected={index === 3 || index === 7} />)}</div><div className={styles.contextWindow}><span>QUERY</span><strong>{query}</strong><small>top-k / 2 · context / bounded</small></div></Link>
        <div className={styles.clipPreview}><div className={styles.previewLabel}><span>03</span><strong>ClipStash</strong><small>CAPTURE / CLASSIFY / RETRIEVE</small></div><label className={styles.clipSearch}><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Filter demo clipboard" /></label><button type="button" className={styles.clipRow} onClick={() => setPinned((value) => !value)}><code>const pipeline = event → state</code><span>{pinned ? <Check size={13} /> : <Pin size={13} />}</span></button><div className={styles.clipRow}><span>http://localhost:8787/events</span><small>LINK</small></div><div className={styles.clipActivity}>{[1,2,1,4,2,6,3,7,2,4,1,3].map((value,index) => <i key={index} style={{ height: `${value * 4}px` }} />)}</div></div>
        <div className={styles.applicationPreview}><div className={styles.previewLabel}><span>04</span><strong>Application Intelligence</strong><small>DEMO DATA</small></div><div className={styles.applicationFlow}><span>JOB PAGE</span><ChevronRight /><span>LOCAL SUMMARY</span><ChevronRight /><span>TRACKER</span></div><div className={styles.demoCompany}><span>DEMO / NORTHSTAR SYSTEMS</span><strong>Infrastructure Engineer</strong></div><div className={styles.statusSteps}>{["Applied","Screening","Interview","Offer"].map((item) => <button type="button" key={item} data-active={item === status} onClick={() => setStatus(item)}><i />{item}</button>)}</div></div>
        <div className={styles.networkPreview}><div className={styles.previewLabel}><span>05</span><strong>Network Lab</strong><small>LIFECYCLE / ROUTE</small></div><div className={styles.routeTopology}><span>CLIENT</span><b data-active={network === "running"}>ENCRYPTED TUNNEL</b><span>AWS / EC2</span><b>ROUTE</b><span>NETWORK</span></div><div className={styles.guardrail}><ShieldCheck size={16} /><span><small>COST GUARDRAIL</small><strong>{network === "running" ? "RESOURCE RUNNING" : "CHECKED / STOPPED"}</strong></span><button type="button" onClick={() => setNetwork((value) => value === "running" ? "guarded" : "running")}>{network === "running" ? "Stop" : "Start demo"}</button></div></div>
      </div>
      <Link className={styles.sectionLink} href="/systems">Explore all systems <ArrowRight size={15} /></Link>
    </section>
  );
}

export function HomeExperience() {
  return (
    <main id="main-content">
      <Inspectable metadata={{ id: "hero-system", component: "HeroSystem", route: "/", execution: "client", source: "static profile + pointer state", interactive: true }}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}><p className="eyebrow">Software engineer · AI systems · Infrastructure</p><h1>I build systems that connect models, software, infrastructure, and the physical world.</h1><p>A living engineering space for distributed events, local AI, developer tools, infrastructure experiments, and the decisions behind them.</p><div className={styles.heroActions}><Link className="signal-button" href="/systems">Explore systems <ArrowRight size={15} /></Link><Link className="signal-button" data-variant="quiet" href="/lab">Open the Lab <Gauge size={15} /></Link><button type="button" className={styles.commandHint} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}><Command size={14} /> Command</button></div></div>
          <HeroSystemObject />
          <div className={styles.signalStrip}><span><i />BUILDING / AMBIENT PRESENCE</span><span>EXPLORING / LOCAL AI</span><span>THINKING / AGENT SYSTEMS</span><small>CURATED IDENTITY SIGNALS</small></div>
        </section>
      </Inspectable>
      <Inspectable metadata={{ id: "wifi-feature", component: "ProjectWifiFeature", route: "/", execution: "client", source: "deterministic architecture simulation", relationship: "hero-system", interactive: true }} className="page-container"><WifiFeature /></Inspectable>
      <Inspectable metadata={{ id: "systems-preview", component: "SystemsTableau", route: "/systems", execution: "client", source: "static project content + demo state", relationship: "wifi-feature", interactive: true }} className="page-container"><SystemsTableau /></Inspectable>
      <Inspectable metadata={{ id: "lab-preview", component: "LabInstrumentPreview", route: "/lab", execution: "client", source: "deterministic reducers", relationship: "systems-preview", interactive: true }} className="page-container">
        <section className={styles.labPreview}><div><p className="eyebrow">The Lab</p><h2 className="section-title">Stress the mechanism.<br />Watch the behavior.</h2><p className="lede">Retry amplification, queue saturation, retrieval windows, route decisions, and latency budgets—rendered as instruments you can manipulate.</p><Link href="/lab" className="text-link">Open five experiments <ArrowRight size={14} /></Link></div><div className={styles.labInstrument}><div className={styles.instrumentHeader}><span>RETRY STORM / TRACE 01</span><b>LOAD × 3.4</b></div><svg viewBox="0 0 600 220" aria-label="Retry amplification preview"><path d="M0 185 C80 180 88 140 142 143 S210 170 248 110 S326 147 366 80 S452 130 492 44 S550 84 600 24" /><line x1="0" y1="126" x2="600" y2="126" /></svg><div className={styles.instrumentScale}><span>REQUEST</span><i /><i /><i /><i /><span>FAILURE PRESSURE</span></div></div></section>
      </Inspectable>
      <section className={`${styles.editorialBridge} page-container`}>
        <Inspectable metadata={{ id: "signals-preview", component: "SignalsPreview", route: "/signals", execution: "server", source: "RSS adapters", cache: "memory / TTL", relationship: "lab-preview" }} className={styles.signalsPreview}><div className={styles.editorialTitle}><p className="eyebrow">Signals / engineering intelligence</p><Link href="/signals">View all <ArrowRight size={14} /></Link></div>{[
          ["AI SYSTEMS","Designing reliable agent infrastructure beyond the demo","SOURCE / ENGINEERING"],
          ["INFRASTRUCTURE","Backpressure is an admission-control decision","SOURCE / SYSTEMS"],
          ["DEV TOOLS","Local models change the privacy boundary","SOURCE / RELEASES"]
        ].map((item,index) => <article key={item[1]}><span>0{index + 1}</span><div><small>{item[0]}</small><h3>{item[1]}</h3><p>{item[2]} · CURATED FALLBACK</p></div></article>)}</Inspectable>
        <Inspectable metadata={{ id: "notes-preview", component: "FieldNotesPreview", route: "/field-notes", execution: "static", source: "MDX", relationship: "signals-preview" }} className={styles.notesPreview}><p className="eyebrow">Field Notes</p><BookOpenText size={24} /><h2>Engineering decisions, written down while the tradeoffs are still visible.</h2><Link href="/field-notes">Read field notes <ArrowRight size={14} /></Link><div><span>01</span><p>Why I used SSE for a local presence dashboard</p><span>6 MIN</span></div><div><span>02</span><p>Retries are not reliability</p><span>6 MIN</span></div></Inspectable>
      </section>
      <section className={`${styles.principles} page-container`}><div><p className="eyebrow">Engineering stance</p><h2 className="section-title">Make state visible.<br />Keep claims honest.<br />Design the failure path.</h2></div><ol><li><span>01</span><strong>Systems over screenshots</strong><p>Show the path an event takes and the constraints it carries.</p></li><li><span>02</span><strong>Local when privacy matters</strong><p>Move the trust boundary deliberately, then explain the tradeoff.</p></li><li><span>03</span><strong>Interaction as explanation</strong><p>Motion earns its place by making causality easier to understand.</p></li></ol><Link href="/about" className="text-link">About Vamshi <ArrowRight size={14} /></Link></section>
      <footer className={styles.footer}><div className="page-container"><div><strong>V/E</strong><span>VAMSHI / SYSTEMS LAB</span></div><p>Software · AI systems · Infrastructure</p><nav><Link href="/systems">Systems</Link><Link href="/lab">Lab</Link><Link href="/signals">Signals</Link><a href="https://github.com/vamshidharreddye" target="_blank" rel="noreferrer">GitHub</a></nav><small>Built as an inspectable engineering environment.</small></div></footer>
    </main>
  );
}
