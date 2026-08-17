export type ObjectKind = "router" | "receiver" | "person" | "wall" | "desk" | "couch" | "cabinet" | "laptop";
export type Material = "drywall" | "glass" | "wood" | "concrete" | "metal";

export interface SceneObject {
  id: string;
  kind: ObjectKind;
  label: string;
  x: number;
  y: number;
  power?: boolean;
  strength?: number;
  material?: Material;
  rotation?: number;
  width?: number;
}

export interface ReceiverReading {
  sourceId: string | null;
  quality: "Excellent" | "Strong" | "Moderate" | "Weak" | "Disconnected";
  value: number;
  obstructed: boolean;
  personNearPath: boolean;
}

export interface SimulationOutput {
  readings: Record<string, ReceiverReading>;
  presence: "NO ACTIVITY" | "SIGNAL CHANGE" | "MOVEMENT DETECTED" | "PRESENCE LIKELY";
}
