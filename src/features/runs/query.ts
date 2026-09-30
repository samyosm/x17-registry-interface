export interface RunQuery {
  q: string;
  from: string;
  to: string;
  sort: "newest" | "oldest";
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

function dateOnly(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? ""
    : value;
}

export function parseRunQuery(params: RawParams): RunQuery {
  const requestedPage = Number(first(params.page));

  return {
    q: first(params.q).trim().slice(0, 200),
    from: dateOnly(first(params.from)),
    to: dateOnly(first(params.to)),
    sort: first(params.sort) === "oldest" ? "oldest" : "newest",
    page:
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1,
  };
}

export function runsHref(query: RunQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const suffix = params.toString();
  return suffix ? `/?${suffix}` : "/";
}

export function runHref(runId: string, query: RunQuery): string {
  const search = runsHref(query).slice(1);
  return `/runs/${encodeURIComponent(runId)}${search}`;
}
