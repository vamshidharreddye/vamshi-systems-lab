"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import styles from "./state.module.css";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main id="main-content" className={styles.statePage}><div className={styles.stateCopy}><span>RENDER BOUNDARY / ERROR</span><h1>System<br />interrupted.</h1><p>This route failed inside an isolated rendering boundary. The persistent shell remains available.</p><button type="button" className="signal-button" onClick={reset}><RotateCcw size={14} /> Retry route</button></div><div className={styles.routeInstrument}><header><span>ERROR / ISOLATED</span><span>RECOVERY / READY</span></header><strong>ERR</strong><p>boundary → captured<br />shell → healthy<br />retry → user controlled</p><i /></div></main>;
}
