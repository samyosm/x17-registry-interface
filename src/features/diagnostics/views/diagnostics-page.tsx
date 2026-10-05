import { formatUtc } from "@/features/runs/format";
import { Timeline } from "../components/timeline";
import type { Diagnostics } from "../model";

const sourceNames = {
  trigger: "TriggerApp",
  logbook: "Logbook",
  influx: "VF48 / InfluxDB",
} as const;

export function DiagnosticsPage({ data }: { data: Diagnostics }) {
  const times = [...data.runStarts, ...data.beamChanges].map((event) =>
    Date.parse(event.at),
  );
  const extent: [number, number] = times.length
    ? [Math.min(...times), Math.max(...times)]
    : [0, 1];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Registry health
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Diagnostics.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Stored time ranges and the last successful polls. Event marks show
          operator records, not verified hardware transitions.
        </p>
      </div>

      <section className="mt-12" aria-labelledby="sync-title">
        <h2 id="sync-title" className="text-lg font-semibold text-ink">
          Source coverage
        </h2>
        <div className="mt-4 divide-y divide-line border-t border-b border-line">
          {(Object.keys(sourceNames) as (keyof typeof sourceNames)[]).map(
            (key) => {
              const source = data.sources[key];
              return (
                <div
                  key={key}
                  className="grid gap-3 py-4 text-sm sm:grid-cols-[170px_1fr_1fr]"
                >
                  <span className="font-semibold text-ink">
                    {sourceNames[key]}
                  </span>
                  <span className="text-muted">
                    Stored: {formatUtc(source.earliest)} →{" "}
                    {formatUtc(source.latest)}
                  </span>
                  <span className="text-muted">
                    Last successful poll: {formatUtc(source.lastSyncedAt)}
                  </span>
                  {key === "influx" &&
                    (source.scannedThrough || source.backfillCursor) && (
                      <span className="text-xs text-muted sm:col-start-2 sm:col-span-2">
                        Forward scan through{" "}
                        {formatUtc(source.scannedThrough ?? null)}
                        {source.backfillCursor
                          ? ` · Reverse scan ${formatUtc(source.backfillCursor)} → ${formatUtc(source.backfillUpper ?? null)}`
                          : ""}
                        {source.backfillLastSyncedAt
                          ? ` · Last backfill window ${formatUtc(source.backfillLastSyncedAt)}`
                          : ""}
                      </span>
                    )}
                </div>
              );
            },
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          Stored endpoints show where records exist; they do not prove every
          moment between them was scanned.
        </p>
      </section>

      <div className="mt-14 space-y-10">
        <Timeline
          title="Run starts · TriggerApp"
          markers={data.runStarts.map((run) => ({
            at: run.at,
            label: run.title || run.id,
            kind: "run",
            href: `/runs/${encodeURIComponent(run.id)}`,
          }))}
          extent={extent}
        />
        <Timeline
          title="Beam changes · Logbook"
          markers={data.beamChanges.map((event) => ({
            at: event.at,
            label: `Beam ${event.status}${event.publicId ? ` · ${event.publicId}` : ""}`,
            kind: event.status.toLowerCase() as "on" | "off",
          }))}
          extent={extent}
        />
      </div>
    </div>
  );
}
