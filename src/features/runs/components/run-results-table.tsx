import Link from "next/link";
import { DataState } from "@/components/data-state";
import type { RunSearchResult } from "../data/run-repository";
import { formatDuration, formatUtc } from "../format";
import { type RunQuery, runHref, runsHref } from "../query";
import { StatusLabel } from "./status-label";

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
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">All times UTC</span>
          <form
            action="/"
            method="get"
            className="flex items-center gap-2 text-xs"
          >
            {query.q && <input type="hidden" name="q" value={query.q} />}
            {query.from && (
              <input type="hidden" name="from" value={query.from} />
            )}
            {query.to && <input type="hidden" name="to" value={query.to} />}
            {query.beam !== "all" && (
              <input type="hidden" name="beam" value={query.beam} />
            )}
            {query.hasData !== "all" && (
              <input type="hidden" name="hasData" value={query.hasData} />
            )}
            {query.sort !== "newest" && (
              <input type="hidden" name="sort" value={query.sort} />
            )}
            <label htmlFor="page-size" className="text-muted">
              Rows
            </label>
            <select
              id="page-size"
              name="pageSize"
              defaultValue={query.pageSize}
              className="border-b border-line bg-surface px-2 py-1 text-ink"
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="font-medium text-accent hover:underline"
            >
              Show
            </button>
          </form>
        </div>
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
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className="w-[14%] px-4 py-3 font-semibold">
                  Run
                </th>
                <th scope="col" className="w-[28%] px-4 py-3 font-semibold">
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
                <th scope="col" className="w-[12%] px-4 py-3 font-semibold">
                  Duration
                </th>
                <th scope="col" className="w-[12%] px-4 py-3 font-semibold">
                  Beam
                </th>
                <th scope="col" className="w-[12%] px-4 py-3 font-semibold">
                  Detector data
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
                      prefetch={false}
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
                      prefetch={false}
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
                  <td className="whitespace-nowrap px-4 py-4 align-top tabular-nums text-ink">
                    {formatDuration(run.startedAt, run.endedAt)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusLabel type="beam" value={run.beamStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-top text-ink">
                    {run.artifactCount > 0 ? "Available" : "None"}
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
