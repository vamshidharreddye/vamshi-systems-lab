"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BookOpenText, BriefcaseBusiness, Code2, Microscope, Radar, ScanLine, Search, UserRound, Wifi } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useXRay } from "@/components/xray/XRayProvider";
import styles from "./Shell.module.css";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toggle: toggleXRay } = useXRay();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const commands = useMemo(() => [
    { label: "Open Project WiFi", detail: "Signature system", icon: Wifi, run: () => router.push("/systems/project-wifi") },
    { label: "Simulate presence", detail: "Open event flow", icon: Activity, run: () => router.push("/systems/project-wifi?run=presence") },
    { label: "Explore Local AI", detail: "Retrieval microscope", icon: Radar, run: () => router.push("/systems#local-ai") },
    { label: "Open Systems", detail: "Five selected systems", icon: BriefcaseBusiness, run: () => router.push("/systems") },
    { label: "Open Lab", detail: "Deterministic instruments", icon: Microscope, run: () => router.push("/lab") },
    { label: "Open Signals", detail: "Engineering intelligence", icon: ScanLine, run: () => router.push("/signals") },
    { label: "Read Field Notes", detail: "Technical writing", icon: BookOpenText, run: () => router.push("/field-notes") },
    { label: "Open About", detail: "Principles and contact", icon: UserRound, run: () => router.push("/about") },
    { label: "Toggle X-Ray", detail: "Inspect this website", icon: ScanLine, run: toggleXRay },
    { label: "Open GitHub", detail: "vamshidharreddye", icon: Code2, run: () => window.open(siteConfig.github, "_blank", "noopener,noreferrer") }
  ], [router, toggleXRay]);

  const filtered = commands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);
  if (!open) return null;

  const closePalette = () => { setQuery(""); setActiveIndex(0); onClose(); };

  const invoke = (index: number) => {
    const command = filtered[index];
    if (!command) return;
    command.run(); closePalette();
  };

  return (
    <div className={styles.paletteBackdrop} role="presentation" onMouseDown={closePalette}>
      <div className={styles.palette} role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => {
        if (event.key === "Escape") closePalette();
        if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, filtered.length - 1)); }
        if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
        if (event.key === "Enter") { event.preventDefault(); invoke(activeIndex); }
        if (event.key === "Tab") { event.preventDefault(); setActiveIndex((index) => event.shiftKey ? Math.max(0, index - 1) : Math.min(filtered.length - 1, index + 1)); }
      }}>
        <div className={styles.paletteSearch}><Search aria-hidden="true" size={18} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder="Navigate or inspect…" aria-label="Search commands" /><kbd>esc</kbd></div>
        <div className={styles.paletteResults} role="listbox" aria-label="Commands">
          {filtered.map((command, index) => {
            const Icon = command.icon;
            return <button key={command.label} type="button" role="option" aria-selected={activeIndex === index} className={styles.paletteResult} data-active={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => invoke(index)}>
              <Icon aria-hidden="true" size={17} /><span><strong>{command.label}</strong><small>{command.detail}</small></span><kbd>↵</kbd>
            </button>;
          })}
          {filtered.length === 0 ? <p className={styles.paletteEmpty}>No command matches that signal.</p> : null}
        </div>
        <div className={styles.paletteFooter}><span><kbd>↑↓</kbd> move</span><span><kbd>↵</kbd> open</span><span>Control plane · local navigation</span></div>
      </div>
    </div>
  );
}
