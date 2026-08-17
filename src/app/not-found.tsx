import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./state.module.css";

export default function NotFound() {
  return <main id="main-content" className={styles.statePage}><div className={styles.stateCopy}><span>ROUTING FAILURE / RECOVERABLE</span><h1>Route<br />not found.</h1><p>The persistent environment is healthy; this address is not part of its route manifest.</p><Link href="/" className="signal-button"><ArrowLeft size={14} /> Return to system</Link></div><div className={styles.routeInstrument} aria-label="Route status"><header><span>ROUTER / INSPECT</span><span>STATE / COMPLETE</span></header><strong>404</strong><p>requested_route → no match<br />fallback_boundary → active<br />recovery_action → available</p><i /></div></main>;
}
