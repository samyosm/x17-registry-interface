import type { BeamContext as BeamContextData } from "../model";
import { StatusLabel } from "./status-label";

export function BeamContext({ beam }: { beam: BeamContextData }) {
  const values = [
    { label: "Energy", value: beam.energy },
    { label: "Current", value: beam.current },
    { label: "Integrated charge", value: beam.charge },
  ];

  return (
    <section aria-labelledby="beam-title" className="border-t border-line pt-7">
      <h3 id="beam-title" className="text-base font-semibold text-ink">
        Beam context
      </h3>
      <p className="mt-1 text-xs text-muted">{beam.source}</p>
      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Recorded status</dt>
          <dd className="mt-1.5">
            <StatusLabel type="beam" value={beam.status} />
          </dd>
        </div>
        {values.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1.5 text-sm font-medium text-ink">
              {value ?? "Not recorded"}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 max-w-xl text-xs leading-5 text-muted">
        {beam.note ??
          "Beam entries describe operator-recorded conditions. Their timestamps are not instrument measurements."}
      </p>
    </section>
  );
}
