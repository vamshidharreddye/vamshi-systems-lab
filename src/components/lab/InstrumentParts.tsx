import type { CSSProperties, ReactNode } from "react";

import styles from "./LabExperience.module.css";

interface RangeControlProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  onChange: (value: number) => void;
}

export function RangeControl({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  unit = "",
  minLabel,
  maxLabel,
  onChange,
}: RangeControlProps) {
  const progress = ((value - min) / Math.max(1, max - min)) * 100;
  const style = { "--range-progress": `${progress}%` } as CSSProperties;

  return (
    <div className={styles.rangeControl}>
      <div className={styles.rangeLabelRow}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className={styles.rangeOutput}>
          {value.toLocaleString()}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={style}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <div className={styles.rangeScale} aria-hidden="true">
        <span>{minLabel ?? `${min}${unit}`}</span>
        <span>{maxLabel ?? `${max}${unit}`}</span>
      </div>
    </div>
  );
}

interface InstrumentHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  statusDetail: string;
  tone?: "nominal" | "warning" | "critical" | "info";
  actions?: ReactNode;
}

export function InstrumentHeading({
  index,
  eyebrow,
  title,
  description,
  status,
  statusDetail,
  tone = "info",
  actions,
}: InstrumentHeadingProps) {
  return (
    <header className={styles.instrumentHeading}>
      <div className={styles.instrumentIdentity}>
        <span className={styles.instrumentIndex}>{index}</span>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>{title}</h2>
          <p className={styles.instrumentDescription}>{description}</p>
        </div>
      </div>
      <div className={styles.instrumentStatusArea}>
        <div className={`${styles.instrumentStatus} ${styles[`tone_${tone}`]}`}>
          <span className={styles.statusGlyph} aria-hidden="true" />
          <span>
            <strong>{status}</strong>
            <small>{statusDetail}</small>
          </span>
        </div>
        {actions ? <div className={styles.headingActions}>{actions}</div> : null}
      </div>
    </header>
  );
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.resetButton} onClick={onClick}>
      <span aria-hidden="true">↺</span> Reset instrument
    </button>
  );
}

interface MetricProps {
  label: string;
  value: ReactNode;
  detail?: string;
}

export function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

export function ModelNote({ children }: { children: ReactNode }) {
  return (
    <p className={styles.modelNote}>
      <span aria-hidden="true">MODEL NOTE</span>
      {children}
    </p>
  );
}
