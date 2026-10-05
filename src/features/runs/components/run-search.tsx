"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RunQuery } from "../query";

interface Suggestion {
  id: string;
  title: string;
  startedAt: string;
}

const inputClass =
  "h-11 w-full border-b border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-[#6f6f6f] focus:border-accent focus:ring-0";

export function RunSearch({ query }: { query: RunQuery }) {
  const [text, setText] = useState(query.q);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!text.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/v1/runs/suggestions?q=${encodeURIComponent(text.trim())}`,
          { signal: controller.signal },
        );
        if (response.ok) {
          const data = (await response.json()) as { suggestions: Suggestion[] };
          setSuggestions(data.suggestions);
        }
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  return (
    <form action="/" method="get" className="mt-10" aria-label="Search runs">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_auto] lg:items-end">
        <div className="relative">
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
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSuggestions([]);
            }}
            placeholder="Title or run ID"
            autoComplete="off"
            className={inputClass}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto border border-line bg-white shadow-sm">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <Link
                    href={`/runs/${encodeURIComponent(suggestion.id)}`}
                    prefetch={false}
                    className="block px-3 py-2 text-sm text-ink hover:bg-surface focus:bg-surface"
                  >
                    {suggestion.title || suggestion.id}
                    <span className="ml-2 text-xs text-muted">
                      {suggestion.startedAt.slice(0, 10)} UTC
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="w-44">
          <label
            htmlFor="beam-filter"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            Beam
          </label>
          <select
            id="beam-filter"
            name="beam"
            defaultValue={query.beam}
            className={inputClass}
          >
            <option value="all">Any status</option>
            <option value="on">Logged on</option>
            <option value="off">Logged off</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="w-44">
          <label
            htmlFor="data-filter"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            Detector data
          </label>
          <select
            id="data-filter"
            name="hasData"
            defaultValue={query.hasData}
            className={inputClass}
          >
            <option value="all">Any</option>
            <option value="true">Has data</option>
            <option value="false">No data</option>
          </select>
        </div>
        {query.sort === "oldest" && (
          <input type="hidden" name="sort" value="oldest" />
        )}
        {query.pageSize !== 5 && (
          <input type="hidden" name="pageSize" value={query.pageSize} />
        )}
        {(query.q ||
          query.from ||
          query.to ||
          query.beam !== "all" ||
          query.hasData !== "all") && (
          <Link
            href="/"
            className="pb-3 text-sm text-accent underline-offset-4 hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
