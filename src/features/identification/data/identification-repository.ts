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
    if (typeof body.detail === "string") detail = body.detail;
    else if (body.error?.message) detail = body.error.message;
  } catch {}
  return failed(
    `The registry answered ${response.status}${detail ? `: ${detail}` : "."}`,
  );
}

async function fetchJson<T>(
  path: string,
  accept404 = false,
): Promise<
  { status: "ok"; data: T } | { status: "missing" } | IdentificationProblem
> {
  let response: Response;
  try {
    response = await registryGet(path);
  } catch (error) {
    return failed(
      error instanceof Error && error.name === "TimeoutError"
        ? "The registry did not answer in time. Try a shorter period or a lower maximum."
        : `The registry could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (accept404 && response.status === 404) return { status: "missing" };
  if (!response.ok) return problem(response);
  try {
    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    return failed(
      `The registry answer could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getIdentification(
  from: string,
  to: string,
  limit: number,
): Promise<IdentificationOutcome> {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const result = await fetchJson<Identification>(
    `identification?${params.toString()}`,
  );
  return result.status === "missing"
    ? failed("The registry has no identification endpoint.")
    : result;
}

export async function getDiagnostics(
  scintillator: string,
  from: string,
  to: string,
  limit: number,
): Promise<DiagnosticsOutcome> {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  return fetchJson<Diagnostics>(
    `identification/${encodeURIComponent(scintillator)}?${params.toString()}`,
    true,
  );
}
