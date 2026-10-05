import { DataState } from "@/components/data-state";
import { formatBytes } from "../format";
import type { Artifact } from "../model";

function ArtifactAction({ artifact }: { artifact: Artifact }) {
  if (artifact.downloadUrl && artifact.state === "ready") {
    return (
      <a
        href={artifact.downloadUrl}
        className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={`Download ${artifact.name}`}
      >
        Download JSON <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <span className="text-muted">
      {artifact.state === "pending" ? "Pending" : "Unavailable"}
    </span>
  );
}

export function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <section aria-labelledby="files-title" className="py-10">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="files-title" className="text-xl font-semibold text-ink">
          Detector data
        </h2>
        <span className="text-sm text-muted">
          {artifacts.length}{" "}
          {artifacts.length === 1 ? "export available" : "exports available"}
        </span>
      </div>
      {artifacts.length === 0 ? (
        <DataState
          title="No detector data available yet"
          description="InfluxDB points may still be syncing, or none were recorded during this run."
        />
      ) : (
        <ul className="border-t border-line">
          {artifacts.map((artifact) => (
            <li
              key={artifact.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-surface text-xs font-semibold text-ink"
                  aria-hidden="true"
                >
                  {artifact.format.slice(0, 3).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {artifact.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {artifact.format}{" "}
                    <span className="mx-1.5 text-[#a8a8a8]">·</span>
                    {artifact.source}{" "}
                    <span className="mx-1.5 text-[#a8a8a8]">·</span>
                    {formatBytes(artifact.sizeBytes)}
                  </p>
                </div>
              </div>
              <div className="pl-14 text-sm sm:pl-0">
                <ArtifactAction artifact={artifact} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
