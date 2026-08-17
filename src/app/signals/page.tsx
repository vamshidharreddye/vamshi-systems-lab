import type { Metadata } from "next";

import { SignalExplorer } from "@/components/signals/SignalExplorer";
import { Inspectable } from "@/components/xray/Inspectable";
import styles from "@/components/signals/Signals.module.css";
import { getSignalFeed } from "@/lib/signals";

export const metadata: Metadata = {
  title: "Signals",
  description:
    "A focused stream of AI, infrastructure, research, security, and developer-tool developments for builders."
};

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const feed = await getSignalFeed();

  return (
    <Inspectable as="main" metadata={{ id: "signals-page", component: "SignalsPage", route: "/signals", execution: "server", source: "RSS/Atom adapters", cache: "process memory / TTL" }} className={styles.signalsPage} id="main-content" data-xray="signals-page">
      <header className={styles.pageIntro}>
        <div>
          <span className={styles.eyebrow}>ENGINEERING INTELLIGENCE / 04</span>
          <h1>Signals</h1>
        </div>
        <p className={styles.introCopy}>
          A focused stream of AI, infrastructure, research, and developer-tool developments.
          Source-first, deterministic, and tuned for people who build systems.
        </p>
      </header>
      <SignalExplorer feed={feed} />
    </Inspectable>
  );
}
