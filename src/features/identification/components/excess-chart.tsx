import type { Identification } from "../model";

const W = 720;
const H = 240;
const LEFT = 48;
const RIGHT = 12;
const TOP = 10;
const BOTTOM = 28;

/** Round tick values from 0; the last tick is at or above `max`. */
function ticks(max: number): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0];
  const step = 10 ** Math.floor(Math.log10(max / 4));
  const size =
    [1, 2, 5, 10].map((m) => m * step).find((s) => max / s <= 5) ?? step;
  return Array.from({ length: Math.ceil(max / size) + 1 }, (_, i) => i * size);
}

/** Pair spectrum of the window over what the reference period predicts, for the bars near the source. */
export function ExcessChart({ data }: { data: Identification }) {
  const { edges, window, expected, bars } = data.spectrum;
  const lo = edges[0];
  const hi = edges[edges.length - 1];
  const yTicks = ticks(Math.max(1, ...window, ...expected));
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
  const xTicks = Array.from(
    { length: Math.floor((hi - lo) / 20) + 1 },
    (_, i) => lo + i * 20,
  );
  const where =
    data.verdict.centre === null
      ? "all usable scintillators"
      : `scintillators ${bars.join(", ")}`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Pair spectrum of the window and of the reference, ${where}`}
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
          d={step(expected)}
          fill="none"
          stroke="#0f62fe"
          strokeWidth="1.5"
        />
        <path
          d={step(window)}
          fill="none"
          stroke="#161616"
          strokeWidth="1.25"
        />
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-ink align-middle" />
          Window
        </span>
        <span>
          <span className="mr-2 inline-block h-0.5 w-5 bg-accent align-middle" />
          Expected from the reference
        </span>
        <span>{where}. Horizontal axis: √(U·D) in ADC; pairs per bin.</span>
      </figcaption>
    </figure>
  );
}
