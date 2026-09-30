import Link from "next/link";
import { ArtifactList } from "../components/artifact-list";
import { BeamContext } from "../components/beam-context";
import { ConfigurationSummary } from "../components/configuration-summary";
import { RunSummary } from "../components/run-summary";
import type { Run } from "../model";
import { type RunQuery, runsHref } from "../query";

export function RunDetailPage({ run, query }: { run: Run; query: RunQuery }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm">
        <Link
          href={runsHref(query)}
          className="text-accent underline-offset-4 hover:underline"
        >
          Runs
        </Link>
        <span className="mx-3 text-[#a8a8a8]" aria-hidden="true">
          /
        </span>
        <span className="text-muted">{run.id}</span>
      </nav>

      <RunSummary run={run} />
      <ArtifactList artifacts={run.artifacts} />

      <section
        aria-labelledby="conditions-title"
        className="border-t border-line py-9"
      >
        <h2 id="conditions-title" className="text-xl font-semibold text-ink">
          Conditions & configuration
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Context recorded around this run. Sources and confidence matter when
          comparing data.
        </p>
        <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <BeamContext beam={run.beam} />
          <ConfigurationSummary configuration={run.configuration} />
        </div>
      </section>

      <section
        aria-labelledby="sources-title"
        className="border-t border-line pt-9"
      >
        <h2 id="sources-title" className="text-xl font-semibold text-ink">
          Detector sources
        </h2>
        <p className="mt-3 text-sm text-muted">
          {run.detectorSources.length
            ? run.detectorSources.join(" · ")
            : "Not recorded"}
        </p>
      </section>
    </div>
  );
}
