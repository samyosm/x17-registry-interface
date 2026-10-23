import Link from "next/link";
import { formatUtc } from "@/features/runs/format";
import { RawChart } from "../components/raw-chart";
import { SpectrumChart } from "../components/spectrum-chart";
import type { Diagnostics, ValueSummary } from "../model";
import { type IdentificationQuery, identificationHref } from "../query";

const number = (value: number | null) =>
  value === null
    ? "—"
    : Math.abs(value) >= 100
      ? Math.round(value).toLocaleString()
      : value.toFixed(1);

const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : (100 * part) / whole;

/** Share of a PMT's readings at or above `threshold`; the raw histogram ends at start + length. */
function shareAbove(
  counts: number[],
  start: number,
  total: number,
  threshold: number,
): number {
  const inside = counts.reduce((sum, n) => sum + n, 0);
  const above = counts
    .slice(Math.max(0, Math.ceil(threshold - start)))
    .reduce((sum, n) => sum + n, 0);
  return percent(above + (total - inside), total);
}

/** Plain-language reasons the data may not match the templates. */
export function findings(data: Diagnostics): string[] {
  const result: string[] = [];
  const range = `${data.edges[0]}–${data.edges[data.edges.length - 1]}`;
  const readings = data.d.n + data.u.n;
  if (data.pairs === 0) {
    result.push(
      readings === 0
        ? "No readings of this scintillator's PMTs in this period."
        : "No U reading shares a time with a D reading, so no pairs can be formed. The two channels may not be stamped with the same time.",
    );
    return result;
  }
  const { filter } = data;
  if (data.matched > data.pairs)
    result.push(
      `${(data.matched - data.pairs).toLocaleString()} of ${data.matched.toLocaleString()} pairs were rejected by the acquisition threshold (${filter.mode === "both" ? "both readings" : "either reading"} at least ${filter.threshold}).`,
    );
  if (
    !filter.enabled &&
    data.values.p99 !== null &&
    data.values.p99 < 0.05 * data.templateMedian
  )
    result.push(
      `99 % of the pairs are below ${number(data.values.p99)}, far under the muon template (median ${number(data.templateMedian)}): they are baseline noise, not events. Set enabled = true under [filter] in config.toml, with a threshold above the noise.`,
    );
  if (percent(data.unpaired, readings) > 10)
    result.push(
      `${percent(data.unpaired, readings).toFixed(0)} % of the readings have no partner with the same time and are ignored.`,
    );
  const outside = percent(data.below + data.above, data.pairs);
  if (outside > 20)
    result.push(
      `${outside.toFixed(0)} % of the pairs fall outside the template range ${range}, so most of the spectrum is not compared.`,
    );
  if (percent(data.zero, data.pairs) > 5)
    result.push(
      `${percent(data.zero, data.pairs).toFixed(0)} % of the pairs are exactly 0: one of the two readings is zero or negative. A pedestal may need to be subtracted.`,
    );
  if (data.scale !== null && (data.scale < 0.7 || data.scale > 1.4)) {
    const { kevPerUnit } = data.calibration;
    result.push(
      kevPerUnit === null
        ? `The median pair value is ${data.scale.toFixed(2)} × the muon template median. If this scintillator has no source, the real data is ${data.scale.toFixed(2)} × larger than the simulation: raise the simulated gain by that factor, or divide the real values by it.`
        : `After the energy calibration, the median pair value is ${data.scale.toFixed(2)} × the muon template median. If this scintillator sees cosmic muons only, set kev_per_template_unit in config.toml to ${(kevPerUnit * data.scale).toFixed(1)} (now ${kevPerUnit}), regenerate the templates and restart the registry. It applies to every scintillator; check the others with Inspect afterwards.`,
    );
  }
  return result;
}

function SummaryRow({ label, s }: { label: string; s: ValueSummary }) {
  return (
    <tr className="border-b border-line">
      <th scope="row" className="px-4 py-3 font-semibold text-ink">
        {label}
      </th>
      {[s.n, s.negative, s.min, s.p1, s.p50, s.p99, s.max].map((value, i) => (
        <td
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed columns
          key={i}
          className="px-4 py-3 text-right text-muted tabular-nums"
        >
          {i < 2
            ? value === null
              ? "—"
              : value.toLocaleString()
            : number(value)}
        </td>
      ))}
    </tr>
  );
}

export function DiagnosticsView({
  data,
  query,
}: {
  data: Diagnostics;
  query: IdentificationQuery;
}) {
  const notes = findings(data);
  const headers = [
    "Readings",
    "Negative",
    "Min",
    "1 %",
    "Median",
    "99 %",
    "Max",
  ];
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <Link
          href={identificationHref(query.range)}
          className="text-sm text-accent hover:underline"
        >
          ← Source identification
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Scintillator {data.scintillator}.
        </h1>
        <p className="mt-4 text-sm text-muted">
          D{data.scintillator} + U{data.scintillator} ·{" "}
          {data.readings.toLocaleString()} readings · {formatUtc(data.from)} →{" "}
          {formatUtc(data.to)}
        </p>
      </div>

      <section className="mt-10" aria-labelledby="findings">
        <h2 id="findings" className="text-lg font-semibold text-ink">
          Findings
        </h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            The data is on the same scale as the templates. A wrong result is
            then a matter of spectrum shape, not scale.
          </p>
        ) : (
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-ink">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
        {data.scale !== null && (
          <p className="mt-4 text-sm text-muted">
            Median pair value{" "}
            <span className="text-ink tabular-nums">
              {number(data.values.p50)}
            </span>{" "}
            · muon template median{" "}
            <span className="text-ink tabular-nums">
              {number(data.templateMedian)}
            </span>{" "}
            · ratio{" "}
            <span className="font-semibold text-ink tabular-nums">
              {data.scale.toFixed(2)}
            </span>{" "}
            (valid only if the scintillator sees cosmic muons alone)
          </p>
        )}
        <p className="mt-2 text-sm text-muted">
          {data.calibration.kevPerUnit === null
            ? "No energy calibration: the stored √(UD) is compared with the templates as it is."
            : `Energy calibration: ${
                data.calibration.gamma === null
                  ? "mean γ"
                  : `γ = ${data.calibration.gamma} keV/ADC`
              } for this scintillator, one template unit = ${data.calibration.kevPerUnit} keV, so the stored √(UD) is multiplied by ${data.calibration.factor.toFixed(3)}.`}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="spectrum">
        <h2 id="spectrum" className="mb-4 text-lg font-semibold text-ink">
          Spectrum
        </h2>
        {data.pairs === 0 ? (
          <p className="border-y border-line py-10 text-center text-sm text-muted">
            No pairs to show.
          </p>
        ) : (
          <SpectrumChart data={data} />
        )}
        <p className="mt-3 text-xs text-muted tabular-nums">
          {data.pairs.toLocaleString()} pairs · {data.below.toLocaleString()}{" "}
          below and {data.above.toLocaleString()} above the range{" "}
          {data.edges[0]}–{data.edges[data.edges.length - 1]} (not drawn)
        </p>
      </section>

      <section className="mt-12" aria-labelledby="raw">
        <h2 id="raw" className="mb-4 text-lg font-semibold text-ink">
          Raw readings and the threshold
        </h2>
        <RawChart data={data} />
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
          Baseline noise piles up on the left. Real events appear as an excess
          above it. The acquisition threshold should sit just above the noise:
          too low and noise pairs flood the spectrum, too high and weak events
          are lost.
          {data.d.n > 0 && data.u.n > 0 && (
            <>
              {" "}
              At {data.filter.threshold} ADC,{" "}
              {shareAbove(
                data.raw.d,
                data.raw.start,
                data.d.n,
                data.filter.threshold,
              ).toFixed(2)}{" "}
              % of the D readings and{" "}
              {shareAbove(
                data.raw.u,
                data.raw.start,
                data.u.n,
                data.filter.threshold,
              ).toFixed(2)}{" "}
              % of the U readings are at or above it.
            </>
          )}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="scan">
        <h2 id="scan" className="text-lg font-semibold text-ink">
          Pairs kept at each threshold
        </h2>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
          Pairs of equal time (D{data.scintillator} + U{data.scintillator}) that
          have both readings at or above the threshold, over the whole period.{" "}
          {data.matched.toLocaleString()} pairs exist before any threshold.
          Noise needs both PMTs to be high at once, so a lower threshold than
          for a single PMT can still keep noise out.
        </p>
        <div className="mt-4 overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] border-collapse text-right text-sm">
            <caption className="sr-only">Pairs kept at each threshold</caption>
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Threshold (ADC)
                </th>
                {data.scan.thresholds.map((threshold) => (
                  <th
                    key={threshold}
                    scope="col"
                    className={`px-4 py-3 font-semibold ${
                      data.filter.enabled && threshold === data.filter.threshold
                        ? "text-accent"
                        : ""
                    }`}
                  >
                    {threshold}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-semibold text-ink"
                >
                  Pairs kept
                </th>
                {data.scan.pairs.map((pairs, i) => (
                  <td
                    key={data.scan.thresholds[i]}
                    className="px-4 py-3 text-muted tabular-nums"
                  >
                    {pairs.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="values">
        <h2 id="values" className="text-lg font-semibold text-ink">
          Raw values
        </h2>
        <div className="mt-4 overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Quantity
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SummaryRow label={`D${data.scintillator} ADC`} s={data.d} />
              <SummaryRow label={`U${data.scintillator} ADC`} s={data.u} />
              <SummaryRow label="√(U·D) of pairs" s={data.values} />
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
          ADC values are used as stored: no pedestal is subtracted and negative
          values count as 0 in the pair value. “Readings” for the pair row is
          the number of pairs.
        </p>
      </section>
    </div>
  );
}
