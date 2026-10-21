export interface SourceStatus {
  earliest: string | null;
  latest: string | null;
  lastSyncedAt: string | null;
  scannedThrough?: string | null;
  backfillCursor?: string | null;
  backfillUpper?: string | null;
  backfillLastSyncedAt?: string | null;
  poll?: PollStatus | null;
}

export type PollState =
  | "idle"
  | "reading"
  | "retrying"
  | "catching_up"
  | "failing";

export interface PollStatus {
  state: PollState;
  updatedAt: string;
  attemptStartedAt?: string;
  window?: [string, string] | null;
  lastWindow?: [string, string] | null;
  failedWindow?: [string, string] | null;
  retries?: number;
  lastRetryReason?: string;
  consecutiveFailures?: number;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastRecords?: number;
  lastDurationSeconds?: number;
  lastError?: { type: string; message: string; at: string } | null;
}

export interface PollerStatus {
  state: "starting" | "polling" | "catching_up" | "waiting" | "stopped";
  updatedAt: string;
  startedAt: string;
  pid?: number;
  intervalSeconds: number | null;
  lastCycleAt?: string | null;
  stoppedAt?: string;
  behind?: string[];
}

export interface BackfillStatus {
  state: "running" | "completed" | "failed";
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  error?: string;
  since: string | null;
  phase: string | null;
  cursor: string | null;
  percentScanned: number | null;
  windowStart: string | null;
  windowEnd: string | null;
  windowSeconds: number | null;
  recordsRead: number | null;
  recordsSaved: number | null;
  oldestNeeded: string | null;
  newest: string | null;
}

export interface Checkpoint {
  name: string;
  value: string;
  updatedAt: string;
}

export interface Diagnostics {
  serverTime: string;
  poller: PollerStatus | null;
  backfill: BackfillStatus | null;
  checkpoints: Checkpoint[];
  sources: Record<"trigger" | "logbook" | "influx", SourceStatus>;
  runStarts: { at: string; id: string; title: string }[];
  beamChanges: { at: string; status: "ON" | "OFF"; publicId: string | null }[];
}
