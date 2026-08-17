"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useXRay } from "./XRayProvider";

interface Edge { id: string; x1: number; y1: number; x2: number; y2: number; }

export function XRayCanvas() {
  const { enabled } = useXRay();
  const pathname = usePathname();
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-inspect-id][data-inspect-relationship]"));
        const next: Edge[] = [];
        for (const node of nodes) {
          const targetId = node.dataset.inspectRelationship?.split(",")[0]?.trim();
          if (!targetId) continue;
          const target = document.querySelector<HTMLElement>(`[data-inspect-id="${targetId}"]`);
          if (!target) continue;
          const from = node.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          if (from.bottom < 0 || from.top > innerHeight || to.bottom < 0 || to.top > innerHeight) continue;
          next.push({ id: `${node.dataset.inspectId}-${targetId}`, x1: from.left + from.width / 2, y1: from.top + from.height / 2, x2: to.left + to.width / 2, y2: to.top + to.height / 2 });
        }
        setEdges(next);
      });
    };
    const observer = new ResizeObserver(measure);
    document.querySelectorAll<HTMLElement>("[data-inspect-id]").forEach((node) => observer.observe(node));
    const timer = window.setTimeout(measure, 40);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.clearTimeout(timer); window.cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure);
    };
  }, [enabled, pathname]);

  if (!enabled || edges.length === 0) return null;
  return (
    <svg className="xray-canvas" aria-hidden="true">
      {edges.map((edge) => {
        const bend = Math.max(28, Math.abs(edge.x2 - edge.x1) * 0.34);
        return <path key={edge.id} d={`M ${edge.x1} ${edge.y1} C ${edge.x1 + bend} ${edge.y1}, ${edge.x2 - bend} ${edge.y2}, ${edge.x2} ${edge.y2}`} />;
      })}
    </svg>
  );
}
