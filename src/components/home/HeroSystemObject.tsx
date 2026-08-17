"use client";

import { useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Boxes, Braces, Cloud, Cpu, Radio, Waypoints } from "lucide-react";
import styles from "./Home.module.css";

const nodes = [
  { id: "models", label: "Models", note: "Local inference and retrieval", x: 16, y: 24, Icon: Cpu },
  { id: "software", label: "Software", note: "Products with operational depth", x: 68, y: 12, Icon: Braces },
  { id: "devices", label: "Devices", note: "Physical events as inputs", x: 76, y: 58, Icon: Radio },
  { id: "infra", label: "Infrastructure", note: "Routes, queues, and lifecycle", x: 26, y: 72, Icon: Boxes },
  { id: "cloud", label: "Cloud", note: "Functions and controlled ingress", x: 47, y: 43, Icon: Cloud },
  { id: "observe", label: "Observability", note: "Make state and failure visible", x: 8, y: 48, Icon: Waypoints }
] as const;

const edges = [[0,4],[1,4],[2,4],[3,4],[5,4],[0,1],[2,3]] as const;

export function HeroSystemObject() {
  const [selected, setSelected] = useState<(typeof nodes)[number]>(nodes[4]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientX - rect.left) / rect.width - .5) * 5, y: ((event.clientY - rect.top) / rect.height - .5) * -5 });
  };

  return (
    <div className={styles.systemObject} onPointerMove={move} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <motion.div className={styles.systemObjectPlane} animate={{ rotateY: tilt.x, rotateX: tilt.y }} transition={{ type: "spring", stiffness: 160, damping: 24 }}>
        <svg viewBox="0 0 100 90" className={styles.systemObjectPaths} aria-hidden="true">
          {edges.map(([from,to]) => <line key={`${from}-${to}`} x1={nodes[from].x + 4} y1={nodes[from].y + 4} x2={nodes[to].x + 4} y2={nodes[to].y + 4} data-active={nodes[from].id === selected.id || nodes[to].id === selected.id} />)}
        </svg>
        {nodes.map((node, index) => {
          const Icon = node.Icon;
          return <button key={node.id} type="button" className={styles.systemNode} style={{ left: `${node.x}%`, top: `${node.y}%` }} data-active={selected.id === node.id} onClick={() => setSelected(node)} aria-pressed={selected.id === node.id}>
            <span className={styles.nodeIndex}>0{index + 1}</span><Icon aria-hidden="true" size={17} /><strong>{node.label}</strong>
          </button>;
        })}
        <div className={styles.systemObjectCore}><span>ENV</span><strong>V/E</strong><small>STATE / READY</small></div>
      </motion.div>
      <div className={styles.systemObjectReadout}><span>FOCUS / {selected.label.toUpperCase()}</span><p>{selected.note}</p></div>
    </div>
  );
}
