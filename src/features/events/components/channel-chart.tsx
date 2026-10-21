import { formatUtc } from "@/features/runs/format";
import type { EventBucket, PmtSeries } from "../model";

const W = 260;
const H = 84;
const PAD_X = 8;
const PAD_Y = 6;

export function ChannelChart({
  series,
  from,
  to,
  bucketSeconds,
}: {
  series: PmtSeries;
  from: number;
  to: number;
  bucketSeconds: number;
}) {
  const { points } = series;
  const low = Math.min(0, ...points.map((point) => point.min));
  const high = Math.max(1, ...points.map((point) => point.max));
  const x = (at: string) =>
    PAD_X +
    ((W - 2 * PAD_X) * (Date.parse(at) - from)) / Math.max(1, to - from);
  const y = (value: number) =>
    PAD_Y + (H - 2 * PAD_Y) * (1 - (value - low) / Math.max(1, high - low));
  const coord = (point: EventBucket, value: number) =>
    `${x(point.at).toFixed(1)},${y(value).toFixed(1)}`;

  // Break lines across empty buckets so gaps in data stay visible.
  const runs: EventBucket[][] = [];
  for (const point of points) {
    const previous = runs.at(-1)?.at(-1);
    if (
      previous &&
      Date.parse(point.at) - Date.parse(previous.at) <= bucketSeconds * 1500
    ) {
      runs.at(-1)?.push(point);
    } else {
      runs.push([point]);
    }
  }

  const band = (run: EventBucket[]) =>
    run.length < 2
      ? ""
      : `M${run.map((p) => coord(p, p.max)).join("L")}L${[...run]
          .reverse()
          .map((p) => coord(p, p.min))
          .join("L")}Z`;
  const line = (run: EventBucket[]) =>
    run.length < 2 ? "" : `M${run.map((p) => coord(p, p.mean)).join("L")}`;

  const latest = points.at(-1);
  const summary = latest
    ? `${series.events.toLocaleString()} events, latest bucket mean ${latest.mean} ADC`
    : "No events";

  return (
    <figure className="bg-white p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{series.channel}</span>
        <span className="text-xs text-muted tabular-nums">
          {series.events.toLocaleString()} events
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full"
        role="img"
        aria-label={`${series.channel}: ${summary}`}
      >
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y(low)}
          y2={y(low)}
          stroke="#8d8d8d"
          strokeWidth="1"
        />
        {points.length === 0 ? (
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#6f6f6f"
          >
            No data
          </text>
        ) : (
          <>
            {runs.map((run) => (
              <g key={run[0].at}>
                <path d={band(run)} fill="#0f62fe" fillOpacity="0.14" />
                <path
                  d={line(run)}
                  fill="none"
                  stroke="#0f62fe"
                  strokeWidth="1.5"
                />
              </g>
            ))}
            {points.map((point) => (
              <circle
                key={point.at}
                cx={x(point.at)}
                cy={y(point.mean)}
                r="2"
                fill="#0f62fe"
              >
                <title>
                  {`${formatUtc(point.at)} · ${point.count} events · mean ${point.mean} (min ${point.min}, max ${point.max})`}
                </title>
              </circle>
            ))}
          </>
        )}
      </svg>
      <p className="text-xs text-muted tabular-nums">
        {points.length ? `${low} – ${high} ADC` : " "}
      </p>
    </figure>
  );
}
