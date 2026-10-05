import "server-only";

import { registryGet } from "@/features/runs/data/run-repository";
import type { Diagnostics } from "../model";

export async function getDiagnostics(): Promise<Diagnostics> {
  const response = await registryGet("diagnostics");
  if (!response.ok)
    throw new Error(`Registry diagnostics failed: ${response.status}`);
  return (await response.json()) as Diagnostics;
}
