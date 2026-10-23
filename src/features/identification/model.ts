export interface ScintillatorResult {
  scintillator: string;
  pairs: number;
  pairsInRange: number;
  /** An isotope, "muon-only", or null when too few pairs were in range. */
  verdict: string | null;
  best: string | null;
  fraction: number | null;
  delta: number | null;
  margin: number | null;
}

export interface Identification {
  from: string;
  to: string;
  limit: number;
  readings: number;
  truncated: boolean;
  readingsUntil: string | null;
  threshold: number;
  minPairs: number;
  scintillators: ScintillatorResult[];
}

export type IdentificationOutcome =
  | { status: "ok"; data: Identification }
  | { status: "unavailable"; message: string };
