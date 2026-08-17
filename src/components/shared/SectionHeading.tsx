import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, copy, aside }: { eyebrow: string; title: string; copy?: string; aside?: ReactNode }) {
  return (
    <div className="section-heading-row">
      <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2>{copy ? <p className="lede">{copy}</p> : null}</div>
      {aside ? <div>{aside}</div> : null}
    </div>
  );
}
