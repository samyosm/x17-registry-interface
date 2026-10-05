import type { BeamStatus, RunCompleteness } from "./model";

const utcDateTime = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatUtc(value: string | null): string {
  return value ? `${utcDateTime.format(new Date(value))} UTC` : "Not recorded";
}

export function formatDuration(start: string, end: string | null): string {
  if (!end) return "Ongoing";
  const seconds = Math.max(
    0,
    Math.floor((Date.parse(end) - Date.parse(start)) / 1000),
  );
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days) return `${days} d ${hours} h`;
  if (hours) return `${hours} h ${minutes} min`;
  if (minutes) return `${minutes} min`;
  return `${seconds} s`;
}

export function formatBytes(value: number | null): string {
  if (value === null) return "Size unknown";
  if (value < 1_000) return `${value} B`;
  if (value < 1_000_000) return `${Math.round(value / 1_000)} KB`;
  return `${(value / 1_000_000).toFixed(1)} MB`;
}

export function beamLabel(status: BeamStatus): string {
  switch (status) {
    case "on":
      return "Logged on";
    case "off":
      return "Logged off";
    case "unknown":
      return "Unknown";
  }
}

export function completenessLabel(status: RunCompleteness): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "partial":
      return "Incomplete";
    case "pending":
      return "Pending";
  }
}
