export type BeamStatus = "on" | "off" | "unknown";
export type RunCompleteness = "complete" | "partial" | "pending";

export interface Artifact {
  id: string;
  name: string;
  format: string;
  source: string;
  sizeBytes: number | null;
  state: "ready" | "pending" | "unavailable";
  downloadUrl: string | null;
}

export interface RunSearchItem {
  id: string;
  runNumber: string;
  experimentId: string;
  title: string;
  startedAt: string;
  beamStatus: BeamStatus;
  artifactCount: number;
}

export interface BeamContext {
  status: BeamStatus;
  source: string;
  energy: string | null;
  current: string | null;
  charge: string | null;
  note: string | null;
}

export interface RunConfiguration {
  title: string | null;
  titleSource: string | null;
  triggerMode: string | null;
  majority: number | null;
  channels: string[];
  evidence: string;
}

export interface Run {
  id: string;
  runNumber: string;
  experimentId: string;
  title: string;
  titleSource: string;
  startedAt: string;
  endedAt: string | null;
  completeness: RunCompleteness;
  detectorSources: string[];
  beam: BeamContext;
  configuration: RunConfiguration | null;
  notes: string | null;
  artifacts: Artifact[];
}
