"use client";

import { RotateCcw } from "lucide-react";

import styles from "@/components/signals/Signals.module.css";

export default function SignalsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className={styles.signalsPage} id="main-content">
      <header className={styles.pageIntro}>
        <div>
          <span className={styles.eyebrow}>SOURCE STATE / UNAVAILABLE</span>
          <h1>Signals</h1>
        </div>
        <div className={styles.emptyState} role="alert">
          <span>STREAM ASSEMBLY FAILED</span>
          <p>The source layer did not initialize. Other parts of the Systems Lab remain local.</p>
          <button type="button" onClick={reset}>
            <RotateCcw size={14} aria-hidden="true" /> Try again
          </button>
        </div>
      </header>
    </main>
  );
}
