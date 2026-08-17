"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { primaryNavigation } from "@/lib/site";
import { XRayProvider } from "@/components/xray/XRayProvider";
import styles from "./Shell.module.css";

export function SystemShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const playground = pathname === "/playground";
  const home = pathname === "/";
  return <XRayProvider><div className={styles.environment}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={styles.header} data-home={home} data-playground={playground}>
      <Link className={styles.identity} href="/" aria-label="Vamshi home"><i>V</i><span>VAMSHI<small>INTERACTIVE SYSTEMS</small></span></Link>
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        {primaryNavigation.map(item => <Link key={item.href} href={item.href} data-active={pathname === item.href}>{item.label}</Link>)}
      </nav>
      <button className={styles.menuButton} onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      <AnimatePresence>{open && <motion.nav className={styles.mobileNav} initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>{primaryNavigation.map((item,index)=><Link href={item.href} key={item.href} onClick={()=>setOpen(false)}><span>0{index+1}</span>{item.label}</Link>)}</motion.nav>}</AnimatePresence>
    </header>
    <AnimatePresence mode="wait" initial={false}><motion.div key={pathname} className={styles.pageStage} initial={{opacity:0,filter:"blur(8px)"}} animate={{opacity:1,filter:"blur(0px)"}} exit={{opacity:0}} transition={{duration:.45,ease:[.22,1,.36,1]}}>{children}</motion.div></AnimatePresence>
  </div></XRayProvider>;
}
