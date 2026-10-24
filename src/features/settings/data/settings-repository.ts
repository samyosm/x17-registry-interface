import "server-only";

import { registryGet, registryPut } from "@/features/runs/data/run-repository";
import type { LabSource, SourcesOutcome } from "../model";

interface Problem {
  error?: { code?: string; message?: string };
  detail?: unknown;
}

async function outcome(response: Response): Promise<SourcesOutcome> {
  if (response.ok) {
    const body = (await response.json()) as { sources?: LabSource[] };
    return Array.isArray(body.sources)
      ? { status: "ok", sources: body.sources }
      : {
          status: "failed",
          message:
            "The registry answer lacks the list of sources. The registry on the server is older than this site: pull it and restart the service.",
        };
  }
  const body = (await response.json().catch(() => ({}))) as Problem;
  const message =
    body.error?.message ??
    (typeof body.detail === "string" ? body.detail : null) ??
    `The registry answered ${response.status}.`;
  return {
    status:
      response.status === 503 && body.error?.code === "identifier_unavailable"
        ? "unavailable"
        : "failed",
    message,
  };
}

async function guarded(request: () => Promise<Response>) {
  try {
    return await outcome(await request());
  } catch (error) {
    return {
      status: "failed",
      message: `The registry could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    } satisfies SourcesOutcome;
  }
}

export function getLabSources(): Promise<SourcesOutcome> {
  return guarded(() => registryGet("settings/sources"));
}

export function saveLabSources(enabled: number[]): Promise<SourcesOutcome> {
  return guarded(() => registryPut("settings/sources", { enabled }));
}
