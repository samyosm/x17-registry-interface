import { NextResponse } from "next/server";
import { registryGet } from "@/features/runs/data/run-repository";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 200);
  if (!q) return NextResponse.json({ suggestions: [] });
  try {
    const response = await registryGet(
      `runs/suggestions?q=${encodeURIComponent(q)}`,
    );
    if (!response.ok)
      return NextResponse.json(
        { suggestions: [] },
        { status: response.status },
      );
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 503 });
  }
}
