import "server-only";

import { registryGet } from "@/features/runs/data/run-repository";
import type { DetectorEvents } from "../model";

export async function getDetectorEvents(
  from: string,
  to: string,
): Promise<DetectorEvents> {
  const params = new URLSearchParams({ from, to, buckets: "120" });
  const response = await registryGet(`events?${params.toString()}`);
  if (!response.ok)
    throw new Error(`Registry events failed: ${response.status}`);
  return (await response.json()) as DetectorEvents;
}
