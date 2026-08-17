"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Command, Menu, ScanLine, X } from "lucide-react";
import { primaryNavigation, siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";
import { XRayProvider, useXRay } from "@/components/xray/XRayProvider";
import { XRayCanvas } from "@/components/xray/XRayCanvas";
import { CommandPalette } from "./CommandPalette";
import styles from "./Shell.module.css";

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { enabled: xray, toggle: toggleXRay } = useXRay();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen((value) => !value); }
      if (event.key === "Escape") { setPaletteOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const routeLabel = pathname === "/" ? "HOME" : pathname.split("/").filter(Boolean).join(" / ").toUpperCase();
  return (
    <div className={styles.environment}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={styles.environmentGrid} aria-hidden="true" /><div className={styles.stateLight} data-xray={xray} aria-hidden="true" />
      <header className={styles.header} data-inspect-id="system-shell">
        <div className={styles.headerInner}>
          <Link href="/" className={styles.identity} aria-label="Vamshi Systems Lab home"><span className={styles.identityMark}>{siteConfig.shortName}</span><span className={styles.identityText}><strong>VAMSHI</strong><small>SYSTEMS LAB</small></span></Link>
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {primaryNavigation.map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} data-active={active}>{item.label}</Link>; })}
          </nav>
          <div className={styles.utilities}>
            <button type="button" className={cn(styles.utility, xray && styles.utilityActive)} onClick={toggleXRay} aria-label={`X-Ray mode ${xray ? "on" : "off"}`} aria-pressed={xray}><ScanLine aria-hidden="true" size={15} /><span>X-Ray</span><b>{xray ? "ON" : "OFF"}</b></button>
            <button type="button" className={styles.utility} onClick={() => setPaletteOpen(true)} aria-label="Open command palette"><Command aria-hidden="true" size={15} /><span>Command</span><kbd>Ctrl K</kbd></button>
            <button type="button" className={styles.menuButton} onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}<span className="sr-only">Menu</span></button>
          </div>
        </div>
        <AnimatePresence>{menuOpen ? <motion.nav id="mobile-navigation" className={styles.mobileNav} aria-label="Mobile navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
          {primaryNavigation.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.label}</Link>)}
          <button type="button" onClick={() => { setPaletteOpen(true); setMenuOpen(false); }}>Open command palette <kbd>Ctrl K</kbd></button>
        </motion.nav> : null}</AnimatePresence>
      </header>
      <AnimatePresence mode="wait" initial={false}><motion.div key={pathname} className={styles.pageStage} data-page-stage initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div></AnimatePresence>
      <div className={styles.systemRail} aria-hidden="true"><span><i />SYSTEM / READY</span><span>ROUTE / {routeLabel}</span><span>RENDER / HYBRID</span><span>INSPECT / {xray ? "ACTIVE" : "STANDBY"}</span></div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} /><XRayCanvas />
    </div>
  );
}

export function SystemShell({ children }: { children: ReactNode }) { return <XRayProvider><ShellFrame>{children}</ShellFrame></XRayProvider>; }
