import { describe, expect, it } from "vitest";
import { simulateScene } from "./engine";
import type { SceneObject } from "./types";

const base: SceneObject[] = [
  { id: "r", kind: "router", label: "Router", x: -4, y: 0, power: true, strength: 90 },
  { id: "s", kind: "receiver", label: "Speaker", x: 4, y: 0 },
];

describe("signal playground engine", () => {
  it("disconnects receivers when every router is powered off", () => {
    const result = simulateScene([{ ...base[0], power: false }, base[1]]);
    expect(result.readings.s.quality).toBe("Disconnected");
    expect(result.readings.s.sourceId).toBeNull();
  });

  it("applies deterministic material attenuation", () => {
    const open = simulateScene(base).readings.s.value;
    const blocked = simulateScene([...base, { id: "w", kind: "wall", label: "Metal", x: 0, y: 0, material: "metal" }]).readings.s;
    expect(blocked.value).toBeLessThan(open);
    expect(blocked.obstructed).toBe(true);
  });

  it("reports movement when a person crosses an active path", () => {
    const result = simulateScene([...base, { id: "p", kind: "person", label: "Person", x: 0, y: .2 }], true);
    expect(result.presence).toBe("MOVEMENT DETECTED");
    expect(result.readings.s.personNearPath).toBe(true);
  });
});
