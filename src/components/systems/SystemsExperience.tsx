"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Cloud, Code2, Copy, Database, LockKeyhole, Pause, Pin, Play, Radio, Search, ShieldCheck, Unplug, Wifi } from "lucide-react";
import { projects } from "@/lib/projects";
import { Inspectable } from "@/components/xray/Inspectable";
import styles from "./Systems.module.css";

const corpus = [
  "The occupancy event enters through an Alexa Routine and custom skill before Lambda posts a normalized payload to the local webhook receiver.",
  "Server-Sent Events fan the current in-memory state to every connected React client. EventSource retries when the local receiver disappears.",
  "The local AI index keeps file metadata available even when embeddings or the optional vector collection cannot be reached.",
  "Backpressure protects a downstream dependency by limiting admission instead of allowing an unbounded queue to hide overload."
];

function LocalAiExplorer() {
  const [query, setQuery] = useState("How does the event pipeline reach React?");
  const [chunkSize, setChunkSize] = useState(120);
  const [topK, setTopK] = useState(2);
  const [vector, setVector] = useState(true);
  const chunks = useMemo(() => corpus.flatMap((doc, docIndex) => {
    const size = Math.max(60, chunkSize);
    const output: Array<{ id: string; text: string; score: number }> = [];
    for (let start = 0; start < doc.length; start += Math.max(40, size - 24)) {
      const text = doc.slice(start, start + size);
      const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
      const matches = terms.filter((term) => text.toLowerCase().includes(term)).length;
      output.push({ id: `${docIndex}-${start}`, text, score: matches + (vector ? ((docIndex * 7 + start) % 10) / 20 : 0) });
    }
    return output;
  }).sort((a,b) => b.score - a.score), [query, chunkSize, vector]);
  const selected = chunks.slice(0, topK);

  return (
    <section id="local-ai" className={styles.localAi}>
      <header><div><span>02 / PUBLIC SOURCE</span><h2>Local AI</h2><p>Private retrieval over local files</p></div><a href="https://github.com/vamshidharreddye/llmlocalai" target="_blank" rel="noreferrer"><Code2 size={14} /> View GitHub</a></header>
      <div className={styles.localAiBoundary}>
        <div className={styles.queryRail}><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="RAG demo query" /></label><div><label>Chunk size <output>{chunkSize}</output><input type="range" min="80" max="220" step="20" value={chunkSize} onChange={(event) => setChunkSize(Number(event.target.value))} /></label><label>Top K <output>{topK}</output><input type="range" min="1" max="4" value={topK} onChange={(event) => setTopK(Number(event.target.value))} /></label></div><button type="button" onClick={() => setVector((value) => !value)} data-mode={vector ? "vector" : "metadata"}><Database size={14} />{vector ? "VECTOR / AVAILABLE" : "VECTOR / DISABLED · KEYWORD FALLBACK"}</button></div>
        <div className={styles.chunkRail}><div className={styles.railLabel}><span>EXTRACTED CHUNKS / {chunks.length}</span><span>RANKING / DETERMINISTIC DEMO</span></div>{chunks.slice(0,7).map((chunk,index) => <div key={chunk.id} className={styles.chunk} data-selected={index < topK}><span>{String(index + 1).padStart(2,"0")}</span><p>{chunk.text}</p><b>{chunk.score.toFixed(2)}</b></div>)}</div>
        <div className={styles.contextLens}><div><span>CONTEXT WINDOW</span><b>{selected.reduce((total,chunk) => total + chunk.text.length,0)} / 640 UNITS*</b></div>{selected.map((chunk) => <p key={chunk.id}>{chunk.text}</p>)}<blockquote>{selected.some((chunk) => chunk.text.includes("Server-Sent Events")) ? "The local receiver fans normalized state to React through an SSE stream." : "The selected local chunks form a bounded context for an answer."}</blockquote><small>*Character-derived demo units, not production token counts.</small></div>
      </div>
      <p className={styles.disclosure}>Verified source behavior · in-memory metadata index, overlapping chunks, local Ollama embeddings, optional Chroma, query routing, path deduplication, and explicit model/vector fallbacks. Portfolio surface · fixed educational corpus; no local paths, running Ollama, or production-RAG claim.</p>
    </section>
  );
}

const demoClips = [
  { id: 1, type: "CODE", content: "const stream = new EventSource('/events')", source: "Code" },
  { id: 2, type: "LINK", content: "http://localhost:8787/events", source: "Browser" },
  { id: 3, type: "TEXT", content: "Make failure state visible in the interface.", source: "Notes" },
  { id: 4, type: "FILE", content: "architecture-notes.md", source: "Finder" }
];

function ClipStashExplorer() {
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState<number[]>([1]);
  const [paused, setPaused] = useState(false);
  const visible = demoClips.filter((clip) => `${clip.type} ${clip.content} ${clip.source}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)));
  return (
    <section id="clipstash" className={styles.clipstash}>
      <div className={styles.clipNarrative}><span>03 / PRIVATE SOURCE · ARCHITECTURE SHOWN</span><h2>ClipStash</h2><p>A native capture loop made visible: sample payloads enter, classify, deduplicate, persist locally, and return on demand.</p><div className={styles.captureRail}><span><Copy />CAPTURE</span><i /><span>CLASSIFY</span><i /><span>DEDUPE</span><i /><span>PERSIST</span></div></div>
      <div className={styles.macUtility}>
        <div className={styles.utilityBar}><strong>CLIPSTASH</strong><button type="button" onClick={() => setPaused((value) => !value)}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Resume" : "Pause"}</button></div>
        <label className={styles.utilitySearch}><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search demo clips" aria-label="Search demo clipboard items" /></label>
        <div className={styles.clipQueue}>{visible.map((clip) => <button type="button" key={clip.id} className={styles.clipItem} onClick={() => setPinned((items) => items.includes(clip.id) ? items.filter((id) => id !== clip.id) : [clip.id,...items])}><span data-type={clip.type}>{clip.type}</span><p>{clip.content}</p><small>{clip.source}</small>{pinned.includes(clip.id) ? <Pin size={13} fill="currentColor" /> : <Pin size={13} />}</button>)}</div>
        <div className={styles.captureActivity}><span>DEMO ACTIVITY / 24 BINS</span><div>{[1,0,2,3,1,0,4,2,1,3,6,2,1,0,4,1,2,5,1,0,3,2,1,4].map((value,index) => <i key={index} style={{ height: `${Math.max(2,value * 5)}px` }} />)}</div></div>
        <footer><span><i data-paused={paused} />{paused ? "MONITORING PAUSED" : "CAPTURING / 1.0s POLL"}</span><small>FICTIONAL DEMO CLIPS</small></footer>
      </div>
    </section>
  );
}

function ApplicationExplorer() {
  const stages = ["Applied","Screening","Interview","Offer","Rejected"];
  const [status, setStatus] = useState("Applied");
  const [helper, setHelper] = useState(true);
  return (
    <section id="application-intelligence" className={styles.application}>
      <header><span>04 / PRIVATE SOURCE · ARCHITECTURE SHOWN</span><div><h2>Application<br />Intelligence</h2><p>Microsoft Careers extraction → Chrome local storage → local helper → Ollama summary → manual tracker state.</p></div></header>
      <div className={styles.applicationScene}>
        <div className={styles.browserPlane}><div><i /><i /><i /><span>careers.example / demo posting</span></div><small>DEMO DATA</small><h3>Northstar Systems</h3><strong>Infrastructure Engineer</strong><dl><dt>JOB ID</dt><dd>DEMO-1042</dd><dt>FIELDS</dt><dd>7 detected</dd><dt>DOMAIN</dt><dd>supported demo</dd></dl><button type="button" onClick={() => setHelper((value) => !value)}>{helper ? <Wifi size={14} /> : <Unplug size={14} />}{helper ? "Helper online" : "Helper offline"}</button></div>
        <div className={styles.summaryPlane}><span>LOCAL SUMMARY</span><CircleDot size={14} /><p>{helper ? "Role emphasizes event-driven infrastructure, observability, and careful operational ownership." : "Summary unavailable. Local tracker save remains available while helper sync is offline."}</p><small>{helper ? "OLLAMA / LOCAL MODEL PATH" : "FALLBACK / LOCAL SAVE QUEUED"}</small></div>
        <div className={styles.trackerPlane}><span>APPLICATION ROUTE</span><strong>{status}</strong><div>{stages.map((stage,index) => <button key={stage} type="button" data-active={stage === status} onClick={() => setStatus(stage)}><i /><span>0{index + 1}</span>{stage}</button>)}</div><small>Status is manual · no automatic email tracking</small></div>
      </div>
      <p className={styles.disclosure}>Primary documented path · Python/Flask, local JSON, and Ollama. A separate Node/OpenAI/OAuth helper branch exists in source but is not presented here as the active implementation. Demo data · manual status only.</p>
    </section>
  );
}

function NetworkExplorer() {
  const states = ["guardrail","provision","deploy","connect","inspect","stop","destroy"] as const;
  const [active, setActive] = useState<(typeof states)[number]>("guardrail");
  const activeIndex = states.indexOf(active);
  return (
    <section id="network-lab" className={styles.network}>
      <header><div><span>05 / PRIVATE SOURCE · ARCHITECTURE SHOWN</span><h2>Network Lab</h2><p>Automating a private WireGuard route on AWS, with cost and lifecycle state included in the system model.</p></div><ShieldCheck size={38} /></header>
      <div className={styles.networkInstrument}>
        <div className={styles.lifecycle}>{states.map((state,index) => <button type="button" key={state} onClick={() => setActive(state)} data-state={index < activeIndex ? "passed" : index === activeIndex ? "active" : "idle"}><span>0{index + 1}</span><i />{state}</button>)}</div>
        <div className={styles.routeMap}><div><Radio /><span>CLIENT</span><small>TUNNEL / {activeIndex >= 3 && activeIndex < 5 ? "UP" : "DOWN"}</small></div><svg viewBox="0 0 500 80" aria-hidden="true"><path d="M0 40 C100 40 120 8 250 40 S410 72 500 40" data-active={activeIndex >= 3 && activeIndex < 5} /></svg><div><Cloud /><span>AWS RESOURCE</span><small>EC2 / {active === "destroy" ? "DESTROYED" : active === "stop" ? "STOPPED" : activeIndex > 0 ? "RUNNING" : "NOT CREATED"}</small></div><b>ENCRYPTED ROUTE</b></div>
        <aside><div><LockKeyhole size={16} /><span><small>COST GATE</small><strong>{activeIndex > 0 ? "CHECKED" : "AWAITING ACKNOWLEDGEMENT"}</strong></span></div><dl><dt>endpoint</dt><dd>sanitized / dynamic</dd><dt>address</dt><dd>not exposed</dd><dt>handshake</dt><dd>{active === "inspect" ? "fresh / demo" : "—"}</dd><dt>resource</dt><dd>{active.toUpperCase()}</dd></dl></aside>
      </div>
      <p className={styles.disclosure}>Reference tradeoff · broadly open ingress and disabled SSH host-key checking in the development automation require production hardening and are not a recommended security posture. Simulation · no real IPs, keys, generated configuration, account data, or geo-bypass framing.</p>
    </section>
  );
}

export function SystemsExperience() {
  return (
    <main id="main-content" className={styles.page}>
      <section className={`${styles.intro} page-container`}><div><p className="eyebrow">Systems / selected work</p><h1 className="display-title">Not projects in boxes.<br />Systems in motion.</h1><p className="lede">Five implementations, each translated into the behavior that makes it worth discussing.</p></div><ol>{projects.map((project) => <li key={project.id}><span>{project.index}</span><a href={`#${project.id}`}>{project.title}</a><small>{project.subtitle}</small></li>)}</ol></section>
      <Inspectable metadata={{ id: "systems-wifi", component: "ProjectWifiManifest", route: "/systems/project-wifi", execution: "client", source: "verified private architecture", interactive: true }} className="page-container">
        <section id="project-wifi" className={styles.wifiManifest}><header><div><span>01 / SIGNATURE SYSTEM</span><h2>Project WiFi</h2><p>Ambient Presence Infrastructure</p></div><Link className="signal-button" href="/systems/project-wifi">Enter architecture <ArrowRight size={14} /></Link></header><div className={styles.wifiManifestFlow}>{["Echo","Routine","Skill","Lambda","ngrok","webhook","SSE","React"].map((stage,index) => <div key={stage}><span>0{index + 1}</span><i /><strong>{stage}</strong>{index < 7 ? <b /> : null}</div>)}</div><footer><p>A physical occupancy event becomes a normalized, inspectable interface state across eight boundaries.</p><span>PRIVATE SOURCE · ARCHITECTURE SHOWN</span></footer></section>
      </Inspectable>
      <Inspectable metadata={{ id: "systems-local-ai", component: "LocalAiExplorer", route: "/systems#local-ai", execution: "client", source: "educational deterministic corpus", relationship: "systems-wifi", interactive: true }} className="page-container"><LocalAiExplorer /></Inspectable>
      <Inspectable metadata={{ id: "systems-clipstash", component: "ClipStashExplorer", route: "/systems#clipstash", execution: "client", source: "fictional demo clips", relationship: "systems-local-ai", interactive: true }} className="page-container"><ClipStashExplorer /></Inspectable>
      <Inspectable metadata={{ id: "systems-application", component: "ApplicationIntelligenceExplorer", route: "/systems#application-intelligence", execution: "client", source: "fictional application data", relationship: "systems-clipstash", interactive: true }} className="page-container"><ApplicationExplorer /></Inspectable>
      <Inspectable metadata={{ id: "systems-network", component: "NetworkLifecycleExplorer", route: "/systems#network-lab", execution: "client", source: "sanitized infrastructure model", relationship: "systems-application", interactive: true }} className="page-container"><NetworkExplorer /></Inspectable>
      <section className={`${styles.outro} page-container`}><span>SYSTEM INDEX / COMPLETE</span><h2>Want to change the inputs?</h2><p>The Lab exposes the mechanisms directly—queues, retries, routes, retrieval, and latency budgets.</p><Link href="/lab" className="signal-button">Open the Lab <ArrowRight size={14} /></Link></section>
    </main>
  );
}
