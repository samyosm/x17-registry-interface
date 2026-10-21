export const presets = [
  { id: "5m", label: "5 min", seconds: 300 },
  { id: "30m", label: "30 min", seconds: 1_800 },
  { id: "1h", label: "1 hour", seconds: 3_600 },
  { id: "6h", label: "6 hours", seconds: 21_600 },
  { id: "24h", label: "24 hours", seconds: 86_400 },
  { id: "7d", label: "7 days", seconds: 604_800 },
] as const;

export interface EventRange {
  /** Preset id, or "custom" for an explicit UTC interval. */
  mode: (typeof presets)[number]["id"] | "custom";
  from: string;
  to: string;
  /** `YYYY-MM-DDTHH:mm` values (UTC) for the custom range form. */
  fromInput: string;
  toInput: string;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

function utcInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export function parseRange(params: RawParams, now = new Date()): EventRange {
  const fromInput = first(params.from);
  const toInput = first(params.to);
  const from = utcInput(fromInput);
  const to = utcInput(toInput);
  if (from && to && from < to) {
    return {
      mode: "custom",
      from: from.toISOString(),
      to: to.toISOString(),
      fromInput,
      toInput,
    };
  }
  const preset =
    presets.find((item) => item.id === first(params.range)) ?? presets[1];
  const start = new Date(now.getTime() - preset.seconds * 1000);
  return {
    mode: preset.id,
    from: start.toISOString(),
    to: now.toISOString(),
    fromInput: formatInput(start),
    toInput: formatInput(now),
  };
}
