import { formatUtc } from "@/features/runs/format";
import { AutoRefresh } from "../components/auto-refresh";
import { ChannelChart } from "../components/channel-chart";
import { RangePicker } from "../components/range-picker";
import type { DetectorEvents } from "../model";
import { type EventRange, type EventScale, formatInput } from "../range";

const groups = [
  { id: "D", title: "D-end PMTs" },
  { id: "U", title: "U-end PMTs" },
] as const;

function bucketLabel(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 120) return `${Math.round(seconds)} s`;
  return `${Math.round(seconds / 60)} min`;
}

/** Same-length range ending just after the newest stored detector record. */
function latestDataHref(data: DetectorEvents): string | null {
  if (!data.latestEventAt) return null;
  const length = Date.parse(data.to) - Date.parse(data.from);
  const end = new Date(Date.parse(data.latestEventAt) + 60_000);
  const start = new Date(end.getTime() - length);
  return `/events?from=${formatInput(start)}&to=${formatInput(end)}`;
}

export function EventsPage({
  range,
  scale,
  data,
}: {
  range: EventRange;
  scale: EventScale;
  data: DetectorEvents;
}) {
  const from = Date.parse(data.from);
  const to = Date.parse(data.to);
  const total = data.channels.reduce((sum, item) => sum + item.events, 0);
  const latestHref = latestDataHref(data);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Detector
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Latest events.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          ADC counts per photomultiplier tube (PMT), from VF48 records stored in
          the registry. Each chart shows the mean per time bucket with a band
          from the minimum to the maximum. Counts are digitised signals, not
          calibrated energy.
        </p>
      </div>

      <RangePicker range={range} scale={scale} />

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-muted">
        <p>
          <span className="font-semibold text-ink tabular-nums">
            {total.toLocaleString()}
          </span>{" "}
          ADC readings · {formatUtc(data.from)} → {formatUtc(data.to)} · one
          point per {bucketLabel(data.bucketSeconds)}
        </p>
        {range.mode !== "custom" && <AutoRefresh seconds={15} />}
      </div>

      {total === 0 ? (
        <output className="mt-8 block border border-line bg-surface p-6 text-sm">
          <p className="font-semibold text-ink">No events in this time range</p>
          <p className="mt-2 text-muted">
            {data.latestEventAt
              ? `The latest stored detector record is from ${formatUtc(data.latestEventAt)}.`
              : "No detector records are stored yet."}
          </p>
          {latestHref && (
            <a
              href={latestHref}
              className="mt-3 inline-block text-accent hover:underline"
            >
              Show the most recent data
            </a>
          )}
        </output>
      ) : (
        <div className="mt-10 space-y-12">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="text-lg font-semibold text-ink"
              >
                {group.title}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {data.channels
                  .filter((item) => item.end === group.id)
                  .map((item) => (
                    <ChannelChart
                      key={item.channel}
                      series={item}
                      from={from}
                      to={to}
                      bucketSeconds={data.bucketSeconds}
                      scale={scale}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted">
        Times are UTC. Readings from all VF48 boards are combined per channel.
        Hover a point for its bucket details.
        {scale === "clip" &&
          " With “Fit to typical values”, each axis covers the middle 96% of bucket means; hollow points lie outside it."}
      </p>
    </div>
  );
}
