import { RunResultsTable } from "../components/run-results-table";
import { RunSearch } from "../components/run-search";
import type { RunSearchResult } from "../data/run-repository";
import type { RunQuery } from "../query";

export function RunsPage({
  result,
  query,
}: {
  result: RunSearchResult;
  query: RunQuery;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Experiment archive
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-[3.25rem]">
          Find a run.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Search recorded experiments, review their conditions, and find the
          data attached to each run.
        </p>
      </div>
      <RunSearch query={query} />
      <RunResultsTable result={result} query={query} />
    </div>
  );
}
