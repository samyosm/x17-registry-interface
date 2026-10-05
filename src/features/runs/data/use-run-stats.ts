"use client";

import { useEffect, useState } from "react";

export interface RunStats {
  pointCount: number;
  estimatedJsonBytes: number;
}

export function useRunStats(ids: readonly string[]) {
  const query = new URLSearchParams();
  for (const id of ids) query.append("id", id);
  const request = query.toString();
  const [loaded, setLoaded] = useState<{
    request: string;
    stats: Record<string, RunStats>;
  }>({ request: "", stats: {} });

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    fetch(`/api/v1/runs/stats?${request}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((body: { stats?: Record<string, RunStats> }) => {
        setLoaded({ request, stats: body.stats ?? {} });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ request, stats: {} });
      });
    return () => controller.abort();
  }, [request]);

  return {
    stats: loaded.request === request ? loaded.stats : {},
    pending: Boolean(request) && loaded.request !== request,
  };
}
