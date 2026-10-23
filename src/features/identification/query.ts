import { type EventRange, parseRange, presets } from "@/features/events/range";

type RawParams = Record<string, string | string[] | undefined>;

export interface IdentificationQuery {
  range: EventRange;
  /** False until the visitor has chosen a period, so the page does not query on arrival. */
  run: boolean;
}

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

export function parseQuery(
  params: RawParams,
  now = new Date(),
): IdentificationQuery {
  const range = parseRange(params, now);
  const chosen =
    range.mode === "custom" ||
    presets.some((preset) => preset.id === first(params.range));
  return { range, run: chosen };
}

export function identificationHref(range: EventRange): string {
  const params = new URLSearchParams(
    range.mode === "custom"
      ? { from: range.fromInput, to: range.toInput }
      : { range: range.mode },
  );
  return `/identification?${params.toString()}`;
}

export function diagnosticsHref(
  scintillator: string,
  range: EventRange,
): string {
  const query = identificationHref(range).split("?")[1];
  return `/identification/${encodeURIComponent(scintillator)}?${query}`;
}
