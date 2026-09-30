import Link from "next/link";
import type { RunQuery } from "../query";

export function RunSearch({ query }: { query: RunQuery }) {
  const inputClass =
    "h-11 w-full border-b border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-[#6f6f6f] focus:border-accent focus:ring-0";

  return (
    <form action="/" method="get" className="mt-10" aria-label="Search runs">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_auto] lg:items-end">
        <div>
          <label
            htmlFor="run-query"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            Search runs
          </label>
          <input
            id="run-query"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Run ID, experiment, title, or note"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="from-date"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            From · UTC
          </label>
          <input
            id="from-date"
            name="from"
            type="date"
            defaultValue={query.from}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="to-date"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            To · UTC
          </label>
          <input
            id="to-date"
            name="to"
            type="date"
            defaultValue={query.to}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="h-11 cursor-pointer bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0043ce] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Search
        </button>
      </div>
      {query.sort === "oldest" ? (
        <input type="hidden" name="sort" value="oldest" />
      ) : null}
      {(query.q || query.from || query.to) && (
        <div className="mt-3 flex justify-end">
          <Link
            href="/"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Clear filters
          </Link>
        </div>
      )}
    </form>
  );
}
