import { type EventRange, parseRange, presets } from "@/features/events/range";

type RawParams = Record<string, string | string[] | undefined>;

export interface IdentificationQuery {
  range: EventRange;
  /** A chosen reference period (UTC ISO times and the form values), or null for the registry's choice. */
  reference: {
    from: string;
    to: string;
    fromInput: string;
    toInput: string;
  } | null;
  /** False until the visitor has chosen a period, so the page does not query on arrival. */
  run: boolean;
}

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

function utc(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseReference(params: RawParams): IdentificationQuery["reference"] {
  const fromInput = first(params.refFrom);
  const toInput = first(params.refTo);
  const from = utc(fromInput);
  const to = utc(toInput);
  return from && to && from < to
    ? { from: from.toISOString(), to: to.toISOString(), fromInput, toInput }
    : null;
}

export function parseQuery(
  params: RawParams,
  now = new Date(),
): IdentificationQuery {
  const range = parseRange(params, now);
  const chosen =
    range.mode === "custom" ||
    presets.some((preset) => preset.id === first(params.range));
  return { range, reference: parseReference(params), run: chosen };
}

export function identificationHref(
  range: EventRange,
  reference: IdentificationQuery["reference"] = null,
): string {
  const params = new URLSearchParams(
    range.mode === "custom"
      ? { from: range.fromInput, to: range.toInput }
      : { range: range.mode },
  );
  if (reference) {
    params.set("refFrom", reference.fromInput);
    params.set("refTo", reference.toInput);
  }
  return `/identification?${params.toString()}`;
}

export function diagnosticsHref(
  scintillator: string,
  range: EventRange,
): string {
  const query = identificationHref(range).split("?")[1];
  return `/identification/${encodeURIComponent(scintillator)}?${query}`;
}
