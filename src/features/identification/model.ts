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

export interface AcquisitionFilter {
  enabled: boolean;
  mode: string;
  threshold: number;
}

export interface Identification {
  from: string;
  to: string;
  /** Every stored reading in the period, whether or not it passes the acquisition threshold. */
  readings: number;
  threshold: number;
  minPairs: number;
  filter: AcquisitionFilter;
  scintillators: ScintillatorResult[];
}

export type IdentificationProblem =
  | { status: "unavailable"; message: string }
  | { status: "failed"; message: string };

export type IdentificationOutcome =
  | { status: "ok"; data: Identification }
  | IdentificationProblem;

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
  readings: number;
  threshold: number;
  d: ValueSummary;
  u: ValueSummary;
  pairs: number;
  matched: number;
  filter: AcquisitionFilter;
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
  /** Energy calibration of this scintillator: template units = factor × the stored √(UD). */
  calibration: {
    kevPerUnit: number | null;
    gamma: number | null;
    factor: number;
  };
  /** Raw readings of the D and U PMT in bins of 1 ADC from `start`. */
  raw: { start: number; d: number[]; u: number[] };
  /** Pairs of equal time that have both readings at or above each candidate threshold. */
  scan: { thresholds: number[]; pairs: number[] };
}

export type DiagnosticsOutcome =
  | { status: "ok"; data: Diagnostics }
  | { status: "missing" }
  | IdentificationProblem;
