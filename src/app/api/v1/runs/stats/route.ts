import { NextResponse } from "next/server";
import { registryGet } from "@/features/runs/data/run-repository";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.getAll("id").slice(0, 100);
  if (ids.length === 0) return NextResponse.json({ stats: {} });
  const query = new URLSearchParams();
  for (const id of ids) query.append("ids", id);
  try {
    const response = await registryGet(`runs/stats?${query}`);
    if (!response.ok)
      return NextResponse.json({ stats: {} }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ stats: {} }, { status: 503 });
  }
}
