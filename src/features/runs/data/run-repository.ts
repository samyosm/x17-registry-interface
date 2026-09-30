import "server-only";

import type { Run, RunSearchItem } from "../model";
import type { RunQuery } from "../query";

export interface RunSearchResult {
  runs: RunSearchItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RunRepository {
  search(query: RunQuery): Promise<RunSearchResult>;
  getById(id: string): Promise<Run | null>;
}

export function registryConfig(): { url: string; token: string } {
  const url = process.env.X17_REGISTRY_API_URL;
  const token = process.env.X17_REGISTRY_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "X17_REGISTRY_API_URL and X17_REGISTRY_API_TOKEN must be set.",
    );
  }
  return { url: url.replace(/\/$/, ""), token };
}

export async function registryGet(path: string): Promise<Response> {
  const { url, token } = registryConfig();
  return fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export const runRepository: RunRepository = {
  async search(query) {
    const params = new URLSearchParams({
      sort: query.sort,
      page: String(query.page),
    });
    if (query.q) params.set("q", query.q);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    const response = await registryGet(`runs?${params.toString()}`);
    if (!response.ok)
      throw new Error(`Registry search failed: ${response.status}`);
    return (await response.json()) as RunSearchResult;
  },
  async getById(id) {
    const response = await registryGet(`runs/${encodeURIComponent(id)}`);
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`Registry run lookup failed: ${response.status}`);
    return (await response.json()) as Run;
  },
};
