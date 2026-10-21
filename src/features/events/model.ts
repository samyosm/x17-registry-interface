export interface EventBucket {
  at: string;
  count: number;
  mean: number;
  min: number;
  max: number;
}

export interface PmtSeries {
  channel: string;
  end: "D" | "U";
  events: number;
  points: EventBucket[];
}

export interface DetectorEvents {
  from: string;
  to: string;
  bucketSeconds: number;
  latestEventAt: string | null;
  channels: PmtSeries[];
}
