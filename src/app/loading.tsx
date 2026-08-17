import styles from "./state.module.css";

export default function Loading() { return <div className={styles.loading} role="status"><span>RESOLVING SYSTEM ROUTE</span><div><i /></div><small>Rendering the next environment layer…</small></div>; }
