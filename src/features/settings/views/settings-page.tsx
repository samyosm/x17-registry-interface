import { DataState } from "@/components/data-state";
import { saveSources } from "../actions";
import type { SourcesOutcome } from "../model";

const headerClass = "px-4 py-3 font-semibold";

function activity(bq: number): string {
  if (bq >= 1e6) return `${(bq / 1e6).toFixed(2)} MBq`;
  if (bq >= 1e3) return `${(bq / 1e3).toFixed(1)} kBq`;
  return `${bq.toFixed(bq < 10 ? 2 : 0)} Bq`;
}

export function SettingsPage({
  outcome,
  saved,
  error,
}: {
  outcome: SourcesOutcome;
  saved: boolean;
  error: string | null;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Settings
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Radioactive sources.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          The sources the lab holds, with their activity today, decayed from the
          measured one. The source identification only considers the ones
          selected here. A source can be selected only if its spectrum has been
          simulated.
        </p>
      </div>

      {saved && (
        <output className="mt-8 block border-l-4 border-accent bg-surface px-4 py-3 text-sm text-ink">
          Saved. The next identification uses this selection.
        </output>
      )}
      {error && (
        <p
          role="alert"
          className="mt-8 border-l-4 border-[#da1e28] bg-surface px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      {outcome.status !== "ok" ? (
        <div className="mt-10">
          <DataState
            title={
              outcome.status === "unavailable"
                ? "Source identification is not set up"
                : "The sources could not be read"
            }
            description={outcome.message}
          />
        </div>
      ) : (
        <form action={saveSources} className="mt-10">
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Radioactive sources of the lab
              </caption>
              <thead className="bg-surface text-xs font-semibold text-muted">
                <tr>
                  <th scope="col" className={headerClass}>
                    Report
                  </th>
                  <th scope="col" className={headerClass}>
                    Source
                  </th>
                  <th scope="col" className={`${headerClass} text-right`}>
                    Measured
                  </th>
                  <th scope="col" className={headerClass}>
                    On
                  </th>
                  <th scope="col" className={`${headerClass} text-right`}>
                    Today
                  </th>
                  <th scope="col" className={headerClass}>
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {outcome.sources.map((source) => (
                  <tr
                    key={source.id}
                    className={`border-b border-line ${source.supported ? "" : "text-muted"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name="enabled"
                        value={source.id}
                        defaultChecked={source.enabled}
                        disabled={!source.supported}
                        aria-label={`Report ${source.isotope} (${source.id})`}
                        className="h-4 w-4 accent-[#0f62fe]"
                      />
                    </td>
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-ink"
                    >
                      {source.isotope}
                      <span className="ml-2 font-normal text-muted tabular-nums">
                        {source.id}
                      </span>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {source.activityUci} µCi
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {source.referenceDate}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {activity(source.activityBq)}
                    </td>
                    <td className="px-4 py-3">{source.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center gap-6">
            <button
              type="submit"
              className="h-11 bg-accent px-6 text-sm font-medium text-white hover:bg-[#0043ce]"
            >
              Save
            </button>
            <p className="max-w-2xl text-xs leading-5 text-muted">
              Fewer selected sources make the naming easier but not more
              certain: a source that is not selected is never reported, even if
              it is the one in the detector. Anyone who can open this site can
              change the selection.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
