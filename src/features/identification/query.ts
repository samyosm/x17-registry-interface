import { type EventRange, parseRange, presets } from "@/features/events/range";

export const DEFAULT_LIMIT = 10_000;
export const MIN_LIMIT = 100;

type RawParams = Record<string, string | string[] | undefined>;

export interface IdentificationQuery {
  range: EventRange;
  limit: number;
  /** False until the visitor has chosen a period, so the page does not query on arrival. */
  run: boolean;
}

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

export function parseLimit(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(MIN_LIMIT, parsed);
}

export function parseQuery(
  params: RawParams,
  now = new Date(),
): IdentificationQuery {
  const range = parseRange(params, now);
  const chosen =
    range.mode === "custom" ||
    presets.some((preset) => preset.id === first(params.range));
  return { range, limit: parseLimit(first(params.limit)), run: chosen };
}

export function identificationHref(range: EventRange, limit: number): string {
  const params = new URLSearchParams(
    range.mode === "custom"
      ? { from: range.fromInput, to: range.toInput }
      : { range: range.mode },
  );
  params.set("limit", String(limit));
  return `/identification?${params.toString()}`;
}

export function diagnosticsHref(
  scintillator: string,
  range: EventRange,
  limit: number,
): string {
  const query = identificationHref(range, limit).split("?")[1];
  return `/identification/${encodeURIComponent(scintillator)}?${query}`;
}
