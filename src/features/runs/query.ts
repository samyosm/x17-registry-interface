export interface RunQuery {
  q: string;
  from: string;
  to: string;
  beam: "all" | "on" | "off" | "unknown";
  hasData: "all" | "true" | "false";
  sort: "newest" | "oldest";
  page: number;
  pageSize: 5 | 10 | 25 | 50 | 100;
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
  const requestedSize = Number(first(params.pageSize));
  const beam = first(params.beam);
  const hasData = first(params.hasData);

  return {
    q: first(params.q).trim().slice(0, 200),
    from: dateOnly(first(params.from)),
    to: dateOnly(first(params.to)),
    beam: beam === "on" || beam === "off" || beam === "unknown" ? beam : "all",
    hasData: hasData === "true" || hasData === "false" ? hasData : "all",
    sort: first(params.sort) === "oldest" ? "oldest" : "newest",
    page:
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1,
    pageSize:
      requestedSize === 10 ||
      requestedSize === 25 ||
      requestedSize === 50 ||
      requestedSize === 100
        ? requestedSize
        : 5,
  };
}

export function runsHref(query: RunQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.beam !== "all") params.set("beam", query.beam);
  if (query.hasData !== "all") params.set("hasData", query.hasData);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.pageSize !== 5) params.set("pageSize", String(query.pageSize));
  const suffix = params.toString();
  return suffix ? `/?${suffix}` : "/";
}

export function runHref(runId: string, query: RunQuery): string {
  const search = runsHref(query).slice(1);
  return `/runs/${encodeURIComponent(runId)}${search}`;
}
