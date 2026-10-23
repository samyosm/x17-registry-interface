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

export interface ValueSummary {
  n: number;
  min: number | null;
  p1: number | null;
  p50: number | null;
  p99: number | null;
  max: number | null;
  negative: number | null;
}

export interface Diagnostics {
  scintillator: string;
  from: string;
  to: string;
  limit: number;
  readings: number;
  truncated: boolean;
  threshold: number;
  d: ValueSummary;
  u: ValueSummary;
  pairs: number;
  unpaired: number;
  values: ValueSummary;
  below: number;
  above: number;
  zero: number;
  edges: number[];
  observed: number[];
  muon: number[];
  fit: {
    isotope: string;
    fraction: number;
    delta: number | null;
    expected: number[];
  } | null;
  templateMedian: number;
  scale: number | null;
}

export type DiagnosticsOutcome =
  | { status: "ok"; data: Diagnostics }
  | { status: "unavailable"; message: string }
  | { status: "missing" };
