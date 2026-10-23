import "server-only";

import { registryGet } from "@/features/runs/data/run-repository";
import type { Identification, IdentificationOutcome } from "../model";

export async function getIdentification(
  from: string,
  to: string,
  limit: number,
): Promise<IdentificationOutcome> {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const response = await registryGet(`identification?${params.toString()}`);
  if (response.status === 503) {
    const body = (await response.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;
    if (body?.error?.code === "identifier_unavailable") {
      return { status: "unavailable", message: body.error.message ?? "" };
    }
  }
  if (!response.ok)
    throw new Error(`Registry identification failed: ${response.status}`);
  return { status: "ok", data: (await response.json()) as Identification };
}
