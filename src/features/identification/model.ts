export interface AcquisitionFilter {
  enabled: boolean;
  mode: string;
  threshold: number;
}

export type VerdictCode = "none" | "detected" | "identified";

export interface BarResult {
  scintillator: string;
  usable: boolean;
  /** Why the bar is left out of the analysis, when it is. */
  reason: string | null;
  /** Pairs with both PMTs above the selection threshold in the window. */
  pairs: number;
  /** Pairs expected from the reference period at the same number of triggers. */
  expected: number;
  excess: number;
  z: number | null;
}

export interface SourceScore {
  name: string;
  /** Likelihood-ratio statistic of the best position of this source against no source. */
  ts: number;
  /** Bar index (0-15) of the best position. */
  centre: number;
  /** False when the activity of the source today is too low to be seen. */
  plausible: boolean;
  activityBq: number | null;
}

export interface Period {
  from: string;
  to: string;
}

export interface Identification {
  from: string;
  to: string;
  reference: Period & {
    /** "before" or "after" the window (chosen by the registry), or "custom". */
    mode: string;
    events: number;
    rate: number;
  };
  events: { window: number; rate: number; scale: number };
  settings: {
    threshold: number;
    binWidth: number;
    max: number;
    detectionTs: number;
    marginTs: number;
  };
  bars: BarResult[];
  unusableBars: number[];
  detection: {
    pairs: number;
    expected: number;
    excess: number;
    rateZ: number | null;
    barsAbove3: number;
  };
  sources: SourceScore[];
  verdict: {
    code: VerdictCode;
    source: string | null;
    candidates: string[];
    centre: number | null;
  };
  spectrum: {
    edges: number[];
    bars: number[];
    window: number[];
    expected: number[];
  };
  trigger: TriggerComparison;
  warnings: string[];
}

export interface TriggerSetup {
  /** When the configuration was saved in TriggerApp. */
  since: string;
  title: string | null;
  mode: string | null;
  majority: number | null;
  /** The distinct thresholds of the channels. */
  thresholds: number[];
}

export interface TriggerComparison {
  /** False when the trigger history does not cover the window or the reference. */
  known: boolean;
  same: boolean | null;
  differences: string[];
  window: TriggerSetup | null;
  reference: TriggerSetup | null;
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
