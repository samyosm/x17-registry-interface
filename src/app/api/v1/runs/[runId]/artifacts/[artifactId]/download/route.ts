import { registryGet } from "@/features/runs/data/run-repository";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/v1/runs/[runId]/artifacts/[artifactId]/download">,
) {
  const { runId, artifactId } = await context.params;
  const upstream = await registryGet(
    `runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(artifactId)}/download`,
    { stream: true },
  );
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status });
  }
  const headers = new Headers();
  for (const name of ["content-type", "content-disposition"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
