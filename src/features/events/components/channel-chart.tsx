import { formatUtc } from "@/features/runs/format";
import type { EventBucket, PmtSeries } from "../model";
import type { EventScale } from "../range";

const W = 260;
const H = 84;
const PAD_X = 8;
const PAD_Y = 6;

function percentile(sorted: number[], fraction: number): number {
  return sorted[
    Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))
  ];
}

/**
 * Vertical range and the number of clipped buckets. Clipped mode sizes the
 * axis from the 2nd-98th percentile of bucket means, so isolated spikes do not
 * flatten the rest of the trace.
 */
function yRange(
  points: EventBucket[],
  scale: EventScale,
): [number, number, number] {
  if (points.length === 0) return [0, 1, 0];
  if (scale === "full") {
    return [
      Math.min(0, ...points.map((point) => point.min)),
      Math.max(1, ...points.map((point) => point.max)),
      0,
    ];
  }
  const means = points.map((point) => point.mean).sort((a, b) => a - b);
  const lo = percentile(means, 0.02);
  const hi = percentile(means, 0.98);
  const pad = Math.max(1, (hi - lo) * 0.15);
  const low = lo - pad;
  const high = hi + pad;
  return [
    low,
    high,
    points.filter((point) => point.mean < low || point.mean > high).length,
  ];
}

export function ChannelChart({
  series,
  from,
  to,
  bucketSeconds,
  scale,
}: {
  series: PmtSeries;
  from: number;
  to: number;
  bucketSeconds: number;
  scale: EventScale;
}) {
  const { points } = series;
  const [low, high, clipped] = yRange(points, scale);
  const x = (at: string) =>
    PAD_X +
    ((W - 2 * PAD_X) * (Date.parse(at) - from)) / Math.max(1, to - from);
  const y = (value: number) =>
    PAD_Y +
    (H - 2 * PAD_Y) *
      (1 -
        (Math.min(high, Math.max(low, value)) - low) / Math.max(1, high - low));
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
                fill={
                  point.mean < low || point.mean > high ? "white" : "#0f62fe"
                }
                stroke="#0f62fe"
                strokeWidth="1"
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
        {points.length
          ? `${Math.round(low)} – ${Math.round(high)} ADC${clipped ? ` · ${clipped} outside range` : ""}`
          : " "}
      </p>
    </figure>
  );
}
