import Link from "next/link";
import { DataState } from "@/components/data-state";
import { formatUtc } from "@/features/runs/format";
import { IdentificationForm } from "../components/identification-form";
import type { Identification, ScintillatorResult } from "../model";
import { diagnosticsHref, type IdentificationQuery } from "../query";

/** Title and period controls; the data-dependent part is passed as children. */
export function IdentificationPage({
  query,
  children,
}: {
  query: IdentificationQuery;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Detector
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Source identification.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Choose a period to find which radioactive source, if any, is near each
          scintillator. The readings of its two PMTs are paired and combined
          into one energy histogram, which is compared with the spectra of the
          known sources and of cosmic muons.
        </p>
      </div>

      <IdentificationForm query={query} />

      {children}
    </div>
  );
}

function verdictLabel(item: ScintillatorResult, minPairs: number): string {
  if (item.verdict === null)
    return item.pairs === 0 ? "No data" : `Fewer than ${minPairs} pairs`;
  return item.verdict === "muon-only" ? "Cosmic muons only" : item.verdict;
}

const headerClass = "px-4 py-3 font-semibold";

export function IdentificationResults({
  data,
  query,
}: {
  data: Identification;
  query: IdentificationQuery;
}) {
  const identified = data.scintillators.filter(
    (item) => item.verdict !== null && item.verdict !== "muon-only",
  ).length;

  return (
    <>
      <div className="mt-10 border-t border-line pt-4 text-sm text-muted">
        <p>
          <span className="font-semibold text-ink tabular-nums">
            {data.readings.toLocaleString()}
          </span>{" "}
          readings · {formatUtc(data.from)} → {formatUtc(data.to)} ·{" "}
          <span className="font-semibold text-ink tabular-nums">
            {identified}
          </span>{" "}
          of {data.scintillators.length} scintillators with a source
        </p>
        {data.truncated && data.readingsUntil && (
          <p className="mt-2 text-ink">
            Only the first {data.limit.toLocaleString()} readings of the period
            were used, up to {formatUtc(data.readingsUntil)}. Raise the maximum
            or shorten the period to cover the rest.
          </p>
        )}
      </div>

      {data.readings === 0 ? (
        <div className="mt-8">
          <DataState
            title="No detector readings in this period"
            description="Pick a period that contains stored detector records."
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border-t border-line">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Source identification per scintillator
            </caption>
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className={headerClass}>
                  Scintillator
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Pairs
                </th>
                <th scope="col" className={headerClass}>
                  Result
                </th>
                <th scope="col" className={headerClass}>
                  Closest source
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Source share
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Δ
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Diagnostics
                </th>
              </tr>
            </thead>
            <tbody>
              {data.scintillators.map((item) => {
                const found =
                  item.verdict !== null && item.verdict !== "muon-only";
                return (
                  <tr
                    key={item.scintillator}
                    className="border-b border-line transition-colors hover:bg-[#f7f7f7]"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-ink"
                    >
                      {item.scintillator}
                      <span className="ml-2 font-normal text-muted">
                        D{item.scintillator} + U{item.scintillator}
                      </span>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.pairs.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 ${found ? "font-semibold text-ink" : "text-muted"}`}
                    >
                      {verdictLabel(item, data.minPairs)}
                    </td>
                    <td className="px-4 py-3 text-muted">{item.best ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-muted tabular-nums">
                      {item.fraction === null
                        ? "—"
                        : `${(item.fraction * 100).toFixed(1)} %`}
                    </td>
                    <td className="px-4 py-3 text-right text-muted tabular-nums">
                      {item.delta === null ? "—" : item.delta.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={diagnosticsHref(
                          item.scintillator,
                          query.range,
                          query.limit,
                        )}
                        prefetch={false}
                        className="text-accent hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        One histogram per scintillator for the whole period, from the pairs of D
        and U readings with the same time. A source is reported when Δ, the
        likelihood gain of the best source over cosmic muons alone, is above{" "}
        {data.threshold}. Δ and the source share are scores, not probabilities,
        and at most one source is assumed per scintillator. Readings are used as
        stored, without calibration, and weak sources need many pairs.
      </p>
    </>
  );
}
