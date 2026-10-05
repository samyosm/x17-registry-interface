import { formatUtc } from "@/features/runs/format";

interface Marker {
  at: string;
  label: string;
  kind: "run" | "on" | "off";
  href?: string;
}

export function Timeline({
  title,
  markers,
  extent,
}: {
  title: string;
  markers: Marker[];
  extent: [number, number];
}) {
  if (markers.length === 0) {
    return (
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-4 text-sm text-muted">No logged events available.</p>
      </section>
    );
  }

  const [first, last] = extent;
  const position = (at: string) =>
    40 + (820 * (Date.parse(at) - first)) / Math.max(1, last - first);

  return (
    <section className="border-t border-line pt-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <span className="text-xs text-muted">
          {markers.length.toLocaleString()} logged
        </span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox="0 0 900 150"
          className="min-w-[540px] w-full"
          role="img"
          aria-label={`${title}, ${markers.length} events plotted by UTC time`}
        >
          <line
            x1="40"
            x2="860"
            y1="113"
            y2="113"
            stroke="#8d8d8d"
            strokeWidth="1"
          />
          {markers.map((marker, index) => {
            const x = position(marker.at);
            const y =
              marker.kind === "on" ? 55 : marker.kind === "off" ? 87 : 70;
            const color =
              marker.kind === "on"
                ? "#0f62fe"
                : marker.kind === "off"
                  ? "#525252"
                  : "#0f62fe";
            const dot = (
              <circle cx={x} cy={y} r="4" fill={color} fillOpacity="0.8">
                <title>{`${formatUtc(marker.at)} · ${marker.label}`}</title>
              </circle>
            );
            return (
              <g key={`${marker.at}-${marker.kind}-${index}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={y + 4}
                  y2="113"
                  stroke={color}
                  strokeOpacity="0.35"
                />
                {marker.href ? (
                  <a
                    href={marker.href}
                    aria-label={`${formatUtc(marker.at)} · ${marker.label}`}
                  >
                    {dot}
                  </a>
                ) : (
                  dot
                )}
              </g>
            );
          })}
          <text x="40" y="140" fill="#525252" fontSize="11">
            {formatUtc(new Date(first).toISOString())}
          </text>
          <text x="860" y="140" textAnchor="end" fill="#525252" fontSize="11">
            {formatUtc(new Date(last).toISOString())}
          </text>
        </svg>
      </div>
      {markers.some((marker) => marker.kind !== "run") && (
        <p className="mt-1 text-xs text-muted">
          <span className="text-accent">●</span> ON{" "}
          <span className="ml-3 text-muted">●</span> OFF
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Hover over a mark for its exact recorded time. Run marks open their run.
      </p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-accent">
          Exact timestamps
        </summary>
        <ol className="mt-2 max-h-52 space-y-1 overflow-y-auto border-l border-line pl-3 text-muted">
          {markers.map((marker, index) => (
            <li key={`${marker.at}-${marker.kind}-${index}`}>
              {formatUtc(marker.at)} ·{" "}
              {marker.href ? (
                <a href={marker.href} className="text-accent hover:underline">
                  {marker.label}
                </a>
              ) : (
                marker.label
              )}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
