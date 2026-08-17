import type { Material, ReceiverReading, SceneObject, SimulationOutput } from "./types";

export const MATERIAL_LOSS: Record<Material, number> = { drywall: 8, glass: 6, wood: 12, concrete: 24, metal: 38 };

function distance(a: SceneObject, b: SceneObject) { return Math.hypot(a.x - b.x, a.y - b.y); }

function pointToSegment(point: SceneObject, a: SceneObject, b: SceneObject) {
  const dx = b.x - a.x; const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function quality(value: number): ReceiverReading["quality"] {
  if (value >= 78) return "Excellent"; if (value >= 58) return "Strong";
  if (value >= 38) return "Moderate"; if (value >= 16) return "Weak"; return "Disconnected";
}

export function simulateScene(objects: SceneObject[], moving = false): SimulationOutput {
  const routers = objects.filter((item) => item.kind === "router" && item.power !== false);
  const receivers = objects.filter((item) => item.kind === "receiver");
  const obstacles = objects.filter((item) => item.kind === "wall");
  const people = objects.filter((item) => item.kind === "person");
  const readings: Record<string, ReceiverReading> = {};
  let anyNearPath = false;
  for (const receiver of receivers) {
    let best: ReceiverReading = { sourceId: null, quality: "Disconnected", value: 0, obstructed: false, personNearPath: false };
    for (const router of routers) {
      const wall = obstacles.find((item) => pointToSegment(item, router, receiver) < .75);
      const personNearPath = people.some((item) => pointToSegment(item, router, receiver) < .65);
      const loss = wall ? MATERIAL_LOSS[wall.material ?? "drywall"] : 0;
      const value = Math.max(0, Math.round((router.strength ?? 80) + 18 - distance(router, receiver) * 8 - loss - (personNearPath ? 9 : 0)));
      if (value > best.value) best = { sourceId: router.id, quality: quality(value), value, obstructed: Boolean(wall), personNearPath };
      anyNearPath ||= personNearPath;
    }
    readings[receiver.id] = best;
  }
  return { readings, presence: anyNearPath ? (moving ? "MOVEMENT DETECTED" : "PRESENCE LIKELY") : moving ? "SIGNAL CHANGE" : "NO ACTIVITY" };
}
