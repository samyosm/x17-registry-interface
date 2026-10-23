import type { Diagnostics } from "../model";

const W = 720;
const H = 240;
const LEFT = 48;
const RIGHT = 12;
const TOP = 10;
const BOTTOM = 28;

function ticks(max: number): number[] {
  const step = 10 ** Math.floor(Math.log10(max / 4));
  const size = [1, 2, 5, 10].map((m) => m * step).find((s) => max / s <= 5);
  return Array.from(
    { length: Math.floor(max / (size ?? step)) + 1 },
    (_, i) => i * (size ?? step),
  );
}

/** Observed pair histogram over the muon template and the best fit, all on the template bins. */
export function SpectrumChart({ data }: { data: Diagnostics }) {
  const { edges, observed, muon, fit } = data;
  const lo = edges[0];
  const hi = edges[edges.length - 1];
  const top = Math.max(1, ...observed, ...muon, ...(fit?.expected ?? []));
  const yTicks = ticks(top);
  const yMax = yTicks[yTicks.length - 1];
  const x = (value: number) =>
    LEFT + ((W - LEFT - RIGHT) * (value - lo)) / (hi - lo);
  const y = (value: number) => TOP + (H - TOP - BOTTOM) * (1 - value / yMax);

  const step = (values: number[]) =>
    `M${values
      .map(
        (value, i) =>
          `${x(edges[i]).toFixed(1)},${y(value).toFixed(1)}L${x(edges[i + 1]).toFixed(1)},${y(value).toFixed(1)}`,
      )
      .join("L")}`;
  const line = (values: number[]) =>
    `M${values
      .map(
        (value, i) =>
          `${x((edges[i] + edges[i + 1]) / 2).toFixed(1)},${y(value).toFixed(1)}`,
      )
      .join("L")}`;
  const xTicks = ticks(hi - lo).map((tick) => lo + tick);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Histogram of the observed pair values with the muon template and the best fit"
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
              {tick}
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
        <path
          d={step(observed)}
          fill="none"
          stroke="#161616"
          strokeWidth="1.25"
        />
        <path d={line(muon)} fill="none" stroke="#0f62fe" strokeWidth="1.5" />
        {fit && (
          <path
            d={line(fit.expected)}
            fill="none"
            stroke="#8a3ffc"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-ink align-middle" />
          Observed pairs
        </span>
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-accent align-middle" />
          Cosmic muon template
        </span>
        {fit && (
          <span>
            <span className="mr-2 inline-block h-0.5 w-5 bg-[#8a3ffc] align-middle" />
            Best fit ({fit.isotope}, {(fit.fraction * 100).toFixed(1)} % source)
          </span>
        )}
        <span>Horizontal axis: √(U·D) in template units; counts per bin</span>
      </figcaption>
    </figure>
  );
}
