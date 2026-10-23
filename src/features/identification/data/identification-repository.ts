import "server-only";

import { registryGet } from "@/features/runs/data/run-repository";
import type {
  Diagnostics,
  DiagnosticsOutcome,
  Identification,
  IdentificationOutcome,
} from "../model";

async function unavailable(
  response: Response,
): Promise<{ status: "unavailable"; message: string } | null> {
  if (response.status !== 503) return null;
  const body = (await response.json().catch(() => null)) as {
    error?: { code?: string; message?: string };
  } | null;
  return body?.error?.code === "identifier_unavailable"
    ? { status: "unavailable", message: body.error.message ?? "" }
    : null;
}

export async function getIdentification(
  from: string,
  to: string,
  limit: number,
): Promise<IdentificationOutcome> {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const response = await registryGet(`identification?${params.toString()}`);
  const missing = await unavailable(response.clone());
  if (missing) return missing;
  if (!response.ok)
    throw new Error(`Registry identification failed: ${response.status}`);
  return { status: "ok", data: (await response.json()) as Identification };
}

export async function getDiagnostics(
  scintillator: string,
  from: string,
  to: string,
  limit: number,
): Promise<DiagnosticsOutcome> {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const response = await registryGet(
    `identification/${encodeURIComponent(scintillator)}?${params.toString()}`,
  );
  const missing = await unavailable(response.clone());
  if (missing) return missing;
  if (response.status === 404) return { status: "missing" };
  if (!response.ok)
    throw new Error(`Registry diagnostics failed: ${response.status}`);
  return { status: "ok", data: (await response.json()) as Diagnostics };
}
