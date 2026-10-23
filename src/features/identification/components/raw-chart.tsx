import type { Diagnostics } from "../model";

const W = 720;
const H = 240;
const LEFT = 48;
const RIGHT = 12;
const TOP = 10;
const BOTTOM = 28;

/** Raw readings of both PMTs in bins of 1 ADC, on a log axis, with the acquisition threshold. */
export function RawChart({ data }: { data: Diagnostics }) {
  const { raw, filter } = data;
  const start = raw.start;
  const end = start + raw.d.length;
  const peak = Math.max(1, ...raw.d, ...raw.u);
  const decades = Math.max(1, Math.ceil(Math.log10(peak)));
  const x = (value: number) =>
    LEFT + ((W - LEFT - RIGHT) * (value - start)) / (end - start);
  // Counts below 1 (empty bins) sit on the axis.
  const y = (count: number) =>
    TOP + (H - TOP - BOTTOM) * (1 - Math.log10(Math.max(1, count)) / decades);
  const line = (counts: number[]) =>
    `M${counts
      .map(
        (count, i) =>
          `${x(start + i).toFixed(1)},${y(count).toFixed(1)}L${x(start + i + 1).toFixed(1)},${y(count).toFixed(1)}`,
      )
      .join("L")}`;
  const yTicks = Array.from({ length: decades + 1 }, (_, i) => 10 ** i);
  const xTicks = Array.from(
    { length: Math.floor((end - start) / 20) + 1 },
    (_, i) => start + i * 20,
  ).filter((tick) => tick <= end);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Histogram of the raw ADC readings of the D and U PMTs, with the acquisition threshold"
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={LEFT}
              x2={W - RIGHT}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#e0e0e0"
            />
            <text
              x={LEFT - 6}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#6f6f6f"
            >
              {tick.toLocaleString()}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#6f6f6f"
          >
            {tick}
          </text>
        ))}
        <path d={line(raw.d)} fill="none" stroke="#0f62fe" strokeWidth="1.25" />
        <path d={line(raw.u)} fill="none" stroke="#8a3ffc" strokeWidth="1.25" />
        {filter.enabled &&
          filter.threshold >= start &&
          filter.threshold <= end && (
            <g>
              <line
                x1={x(filter.threshold)}
                x2={x(filter.threshold)}
                y1={TOP}
                y2={H - BOTTOM}
                stroke="#da1e28"
                strokeDasharray="4 3"
              />
              <text
                x={x(filter.threshold) + 4}
                y={TOP + 10}
                fontSize="11"
                fill="#da1e28"
              >
                threshold {filter.threshold}
              </text>
            </g>
          )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-accent align-middle" />
          D{data.scintillator} readings
        </span>
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-[#8a3ffc] align-middle" />
          U{data.scintillator} readings
        </span>
        <span>Horizontal axis: stored ADC value; log counts per ADC</span>
      </figcaption>
    </figure>
  );
}
