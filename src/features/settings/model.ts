export interface LabSource {
  /** Lab catalogue number. */
  id: number;
  isotope: string;
  activityUci: number;
  referenceDate: string;
  halfLifeYears: number;
  /** Activity today, decayed from the measured one. */
  activityBq: number;
  /** False when the identification has no spectrum for this isotope. */
  supported: boolean;
  /** Reported by the identification. */
  enabled: boolean;
  note: string | null;
}

export type SourcesOutcome =
  | { status: "ok"; sources: LabSource[] }
  | { status: "unavailable" | "failed"; message: string };
