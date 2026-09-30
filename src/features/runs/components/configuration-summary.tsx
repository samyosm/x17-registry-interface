import type { RunConfiguration } from "../model";

export function ConfigurationSummary({
  configuration,
}: {
  configuration: RunConfiguration | null;
}) {
  return (
    <section
      aria-labelledby="configuration-title"
      className="border-t border-line pt-7"
    >
      <h3 id="configuration-title" className="text-base font-semibold text-ink">
        Trigger configuration
      </h3>
      {configuration ? (
        <>
          <p className="mt-1 text-xs text-muted">{configuration.evidence}</p>
          <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Configuration title</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {configuration.title ?? "Not recorded"}
              </dd>
              {configuration.titleSource ? (
                <dd className="mt-1 text-xs text-muted">
                  {configuration.titleSource}
                </dd>
              ) : null}
            </div>
            <div>
              <dt className="text-xs text-muted">Mode and majority</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {configuration.triggerMode ?? "Unknown"}
                {configuration.majority !== null
                  ? ` · MAJ ${configuration.majority}`
                  : ""}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted">Annotated channels</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {configuration.channels.length
                  ? configuration.channels.join(", ")
                  : "Not recorded"}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          No configuration is linked to this run.
        </p>
      )}
    </section>
  );
}
