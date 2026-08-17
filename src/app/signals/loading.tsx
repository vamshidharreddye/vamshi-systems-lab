import styles from "@/components/signals/Signals.module.css";

export default function SignalsLoading() {
  return (
    <main className={styles.signalsPage} id="main-content" aria-busy="true">
      <header className={styles.pageIntro}>
        <div>
          <span className={styles.eyebrow}>ENGINEERING INTELLIGENCE / CONNECTING</span>
          <h1>Signals</h1>
        </div>
        <p className={styles.introCopy}>Opening isolated source adapters and checking memory cache.</p>
      </header>
      <div className={styles.instrumentBar} aria-label="Loading signal sources">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <span className={styles.instrumentLabel}>SOURCE {index + 1}</span>
            <strong className={styles.instrumentValue}>PENDING</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
