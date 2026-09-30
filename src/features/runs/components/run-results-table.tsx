import Link from "next/link";
import { DataState } from "@/components/data-state";
import type { RunSearchResult } from "../data/run-repository";
import { formatUtc } from "../format";
import type { RunSearchItem } from "../model";
import { type RunQuery, runHref, runsHref } from "../query";
import { StatusLabel } from "./status-label";

function fileSummary(run: RunSearchItem): string {
  if (run.artifactCount === 0) return "No files listed";
  return `${run.artifactCount} ${run.artifactCount === 1 ? "file" : "files"} listed`;
}

export function RunResultsTable({
  result,
  query,
}: {
  result: RunSearchResult;
  query: RunQuery;
}) {
  const sortHref = runsHref({
    ...query,
    sort: query.sort === "newest" ? "oldest" : "newest",
    page: 1,
  });

  return (
    <section className="mt-12" aria-labelledby="results-heading">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 id="results-heading" className="text-lg font-semibold text-ink">
            Runs
          </h2>
          <span className="text-sm text-muted">
            {result.total} {result.total === 1 ? "result" : "results"}
          </span>
        </div>
        <span className="text-xs text-muted">All times UTC</span>
      </div>

      {result.total === 0 ? (
        <DataState
          title="No runs match these filters"
          description="Try another run number, title, or date range."
          action={
            <Link
              href="/"
              className="text-sm font-medium text-accent hover:underline"
            >
              Clear search
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className="w-[16%] px-4 py-3 font-semibold">
                  Run
                </th>
                <th scope="col" className="w-[32%] px-4 py-3 font-semibold">
                  Title
                </th>
                <th scope="col" className="w-[22%] px-4 py-3 font-semibold">
                  <Link
                    href={sortHref}
                    className="inline-flex items-center gap-2 hover:text-accent"
                  >
                    Started
                    <span aria-hidden="true">
                      {query.sort === "newest" ? "↓" : "↑"}
                    </span>
                    <span className="sr-only">
                      Sort {query.sort === "newest" ? "oldest" : "newest"} first
                    </span>
                  </Link>
                </th>
                <th scope="col" className="w-[16%] px-4 py-3 font-semibold">
                  Beam
                </th>
                <th scope="col" className="w-[14%] px-4 py-3 font-semibold">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {result.runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-line transition-colors hover:bg-[#f7f7f7]"
                >
                  <td className="px-4 py-4 align-top">
                    <Link
                      href={runHref(run.id, query)}
                      className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {run.runNumber}
                    </Link>
                    <div className="mt-1 font-mono text-[11px] text-muted">
                      {run.id}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Link
                      href={runHref(run.id, query)}
                      className="font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                    >
                      {run.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted">
                      {run.experimentId}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-top tabular-nums text-ink">
                    {formatUtc(run.startedAt)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusLabel type="beam" value={run.beamStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-top text-muted">
                    {fileSummary(run)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label="Results pages"
          className="mt-6 flex items-center justify-between text-sm"
        >
          <span className="text-muted">
            Page {result.page} of {result.totalPages}
          </span>
          <div className="flex gap-5">
            {result.page > 1 ? (
              <Link
                href={runsHref({ ...query, page: result.page - 1 })}
                className="font-medium text-accent hover:underline"
              >
                Previous
              </Link>
            ) : (
              <span className="text-[#a8a8a8]">Previous</span>
            )}
            {result.page < result.totalPages ? (
              <Link
                href={runsHref({ ...query, page: result.page + 1 })}
                className="font-medium text-accent hover:underline"
              >
                Next
              </Link>
            ) : (
              <span className="text-[#a8a8a8]">Next</span>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
