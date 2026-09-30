import { formatUtc } from "../format";
import type { Run } from "../model";
import { StatusLabel } from "./status-label";

export function RunSummary({ run }: { run: Run }) {
  return (
    <section
      aria-labelledby="run-title"
      className="mt-9 border-b border-line pb-9"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Run {run.runNumber}
          </p>
          <h1
            id="run-title"
            className="mt-3 max-w-3xl text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-[2.5rem]"
          >
            {run.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {run.experimentId} <span className="mx-2 text-[#a8a8a8]">/</span>
            <span className="font-mono text-xs">{run.id}</span>
          </p>
        </div>
        <div className="border border-line px-3 py-2">
          <StatusLabel type="completeness" value={run.completeness} />
        </div>
      </div>
      <dl className="mt-8 grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-muted">Started</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums text-ink">
            {formatUtc(run.startedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Ended</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums text-ink">
            {formatUtc(run.endedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Title source</dt>
          <dd className="mt-1 text-sm text-ink">{run.titleSource}</dd>
        </div>
      </dl>
      {run.notes ? (
        <p className="mt-7 max-w-3xl text-sm leading-6 text-muted">
          {run.notes}
        </p>
      ) : null}
    </section>
  );
}
