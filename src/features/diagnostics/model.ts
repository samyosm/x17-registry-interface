export interface SourceStatus {
  earliest: string | null;
  latest: string | null;
  lastSyncedAt: string | null;
  scannedThrough?: string | null;
  backfillCursor?: string | null;
  backfillUpper?: string | null;
  backfillLastSyncedAt?: string | null;
}

export interface Diagnostics {
  sources: Record<"trigger" | "logbook" | "influx", SourceStatus>;
  runStarts: { at: string; id: string; title: string }[];
  beamChanges: { at: string; status: "ON" | "OFF"; publicId: string | null }[];
}
