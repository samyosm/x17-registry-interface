import "server-only";

import { registryGet } from "@/features/runs/data/run-repository";
import type {
  Diagnostics,
  DiagnosticsOutcome,
  Identification,
  IdentificationOutcome,
  IdentificationProblem,
} from "../model";

function failed(message: string): IdentificationProblem {
  console.error(`Identification: ${message}`);
  return { status: "failed", message };
}

/** Reads the answer of a non-successful response into a problem the page can show. */
async function problem(response: Response): Promise<IdentificationProblem> {
  const text = await response.text().catch(() => "");
  let detail = text.slice(0, 300);
  try {
    const body = JSON.parse(text) as {
      detail?: unknown;
      error?: { code?: string; message?: string };
    };
    if (
      response.status === 503 &&
      body.error?.code === "identifier_unavailable"
    )
      return { status: "unavailable", message: body.error.message ?? "" };
    if (response.status === 422 && body.error?.code === "insufficient_data")
      return { status: "failed", message: body.error.message ?? "" };
    if (typeof body.detail === "string") detail = body.detail;
    else if (body.error?.message) detail = body.error.message;
  } catch {}
  return failed(
    `The registry answered ${response.status}${detail ? `: ${detail}` : "."}`,
  );
}

const IDENTIFICATION_FIELDS = [
  "reference",
  "events",
  "settings",
  "bars",
  "detection",
  "sources",
  "verdict",
  "spectrum",
  "warnings",
];

/** A whole period is analysed in the database, which can take a while; below Node's 300 s limit. */
const TIMEOUT_MS = 290_000;

const DIAGNOSTICS_FIELDS = [
  "scintillator",
  "threshold",
  "d",
  "u",
  "pairs",
  "matched",
  "filter",
  "unpaired",
  "values",
  "below",
  "above",
  "zero",
  "edges",
  "observed",
  "muon",
  "fit",
  "templateMedian",
  "scale",
  "raw",
  "scan",
  "calibration",
];

/** The registry and its x17-isotope-id library are deployed apart from this site and can lag behind it. */
function outdated(data: unknown, required: string[]): string | null {
  const missing = required.filter(
    (key) => (data as Record<string, unknown> | null)?.[key] === undefined,
  );
  return missing.length === 0
    ? null
    : `The registry answer lacks ${missing.join(", ")}. The registry or its x17-isotope-id library on the server is older than this site: pull both, then restart the registry service.`;
}

async function fetchJson<T>(
  path: string,
  required: string[],
  accept404 = false,
): Promise<
  { status: "ok"; data: T } | { status: "missing" } | IdentificationProblem
> {
  let response: Response;
  try {
    response = await registryGet(path, { timeoutMs: TIMEOUT_MS });
  } catch (error) {
    return failed(
      error instanceof Error && error.name === "TimeoutError"
        ? "The registry did not answer in time. Try a shorter period."
        : `The registry could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (accept404 && response.status === 404) return { status: "missing" };
  if (!response.ok) return problem(response);
  try {
    const data = (await response.json()) as T;
    const stale = outdated(data, required);
    return stale ? failed(stale) : { status: "ok", data };
  } catch (error) {
    return failed(
      `The registry answer could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getIdentification(
  from: string,
  to: string,
  reference: { from: string; to: string } | null,
): Promise<IdentificationOutcome> {
  const params = new URLSearchParams({ from, to });
  if (reference) {
    params.set("refFrom", reference.from);
    params.set("refTo", reference.to);
  }
  const result = await fetchJson<Identification>(
    `identification?${params.toString()}`,
    IDENTIFICATION_FIELDS,
  );
  return result.status === "missing"
    ? failed("The registry has no identification endpoint.")
    : result;
}

export async function getDiagnostics(
  scintillator: string,
  from: string,
  to: string,
): Promise<DiagnosticsOutcome> {
  const params = new URLSearchParams({ from, to });
  return fetchJson<Diagnostics>(
    `identification/${encodeURIComponent(scintillator)}?${params.toString()}`,
    DIAGNOSTICS_FIELDS,
    true,
  );
}
