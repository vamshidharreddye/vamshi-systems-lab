export type ExecutionMode = "client" | "server" | "static";

export interface InspectionMetadata {
  id: string;
  component: string;
  route: string;
  execution: ExecutionMode;
  source: string;
  cache?: string;
  relationship?: string;
  interactive?: boolean;
}
