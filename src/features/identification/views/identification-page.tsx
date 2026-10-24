import { formatUtc } from "@/features/runs/format";
import { ExcessChart } from "../components/excess-chart";
import { IdentificationForm } from "../components/identification-form";
import type { Identification, TriggerSetup } from "../model";
import type { IdentificationQuery } from "../query";

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
          Choose a period to find out whether a radioactive source was placed
          near the detector, which one, and next to which scintillator. The
          period is compared with a reference period without a source: a source
          shows as an excess of coincident U and D pulses, and its energy
          spectrum and its position along the bars identify it.
        </p>
      </div>

      <IdentificationForm query={query} />

      {children}
    </div>
  );
}

const headerClass = "px-4 py-3 font-semibold";

function sentence(data: Identification): { title: string; detail: string } {
  const { verdict } = data;
  const place =
    verdict.centre === null ? "" : ` near scintillator ${verdict.centre}`;
  if (verdict.code === "none")
    return {
      title: "No source seen",
      detail:
        "The window shows no excess over the reference period beyond what chance explains.",
    };
  if (verdict.code === "identified")
    return {
      title: `${verdict.source}${place}`,
      detail: "The excess has the spectrum and the position of this source.",
    };
  return {
    title: `A source is present${place}`,
    detail: `Its spectrum does not single out one isotope${
      verdict.candidates.length
        ? `; closest: ${verdict.candidates.join(", ")}`
        : ""
    }.`,
  };
}

function triggerText(setup: TriggerSetup): string {
  const thresholds =
    setup.thresholds.length === 0
      ? ""
      : `, threshold ${setup.thresholds.join("/")}`;
  return `mode ${setup.mode ?? "unknown"}, majority ${setup.majority ?? "unknown"}${thresholds}`;
}

const number = (value: number, digits = 1) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export function IdentificationResults({ data }: { data: Identification }) {
  const { title, detail } = sentence(data);
  const found = data.verdict.code !== "none";
  const unusable = data.bars.filter((bar) => !bar.usable);

  return (
    <>
      <div className="mt-10 border-t border-line pt-4 text-sm text-muted">
        <p>
          <span className="font-semibold text-ink tabular-nums">
            {data.events.window.toLocaleString()}
          </span>{" "}
          triggers · {formatUtc(data.from)} → {formatUtc(data.to)}
        </p>
        <p className="mt-2">
          Reference ({data.reference.mode}):{" "}
          <span className="tabular-nums">
            {data.reference.events.toLocaleString()}
          </span>{" "}
          triggers · {formatUtc(data.reference.from)} →{" "}
          {formatUtc(data.reference.to)}. A pair counts when both PMTs read at
          least {data.settings.threshold} ADC; the stored data is not changed.
        </p>
      </div>

      <p className="mt-2 text-sm text-muted">
        Trigger:{" "}
        {data.trigger.known && data.trigger.window ? (
          <>
            {triggerText(data.trigger.window)} in the window
            {data.trigger.same === false && data.trigger.reference
              ? `, ${triggerText(data.trigger.reference)} in the reference`
              : data.trigger.same
                ? ", the same in the reference"
                : ""}
            . From the saved TriggerApp history; the hardware is not read back.
          </>
        ) : (
          "not known: the trigger history does not cover this period."
        )}
      </p>

      {data.warnings.length > 0 && (
        <ul className="mt-6 space-y-2 border-l-4 border-[#f1c21b] bg-surface px-4 py-3 text-sm text-ink">
          {data.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <section className="mt-8 bg-surface px-6 py-6" aria-label="Verdict">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          {data.verdict.code === "identified"
            ? "Identified"
            : found
              ? "Detected"
              : "Result"}
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted">{detail}</p>
        <p className="mt-4 text-sm text-muted tabular-nums">
          {number(data.detection.excess, 0)} excess pairs over{" "}
          {number(data.detection.expected, 0)} expected (
          {data.detection.rateZ === null
            ? "no rate"
            : `${data.detection.rateZ >= 0 ? "+" : ""}${number(data.detection.rateZ)} σ`}
          ) · {data.detection.barsAbove3} scintillators above 3 σ
        </p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Spectrum of the excess
          </h2>
          <ExcessChart data={data} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Sources compared
          </h2>
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-surface text-xs font-semibold text-muted">
              <tr>
                <th scope="col" className={headerClass}>
                  Source
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Score
                </th>
                <th scope="col" className={`${headerClass} text-right`}>
                  Best position
                </th>
                <th scope="col" className={headerClass}>
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map((source) => (
                <tr key={source.name} className="border-b border-line">
                  <th scope="row" className="px-4 py-3 font-semibold text-ink">
                    {source.name}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {number(source.ts)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted tabular-nums">
                    {source.centre}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {source.plausible
                      ? ""
                      : `Only ${number(source.activityBq ?? 0, 0)} Bq today`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs leading-5 text-muted">
            Score: 2 ln of the likelihood gain over no source. Below{" "}
            {data.settings.detectionTs} nothing is reported; a source is named
            only when it leads the next one by {data.settings.marginTs}.
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">Pairs per scintillator</caption>
          <thead className="bg-surface text-xs font-semibold text-muted">
            <tr>
              <th scope="col" className={headerClass}>
                Scintillator
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Pairs
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Expected
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Excess
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                σ
              </th>
            </tr>
          </thead>
          <tbody>
            {data.bars.map((bar) => (
              <tr
                key={bar.scintillator}
                className="border-b border-line transition-colors hover:bg-[#f7f7f7]"
              >
                <th scope="row" className="px-4 py-3 font-semibold text-ink">
                  {bar.scintillator}
                  <span className="ml-2 font-normal text-muted">
                    D{bar.scintillator} + U{bar.scintillator}
                  </span>
                </th>
                {bar.usable ? (
                  <>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {bar.pairs.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted tabular-nums">
                      {number(bar.expected, 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {number(bar.excess, 0)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        bar.z !== null && bar.z >= 3
                          ? "font-semibold text-ink"
                          : "text-muted"
                      }`}
                    >
                      {bar.z === null ? "—" : number(bar.z)}
                    </td>
                  </>
                ) : (
                  <td colSpan={4} className="px-4 py-3 text-muted">
                    Not used{bar.reason ? `: ${bar.reason}` : ""}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        {unusable.length > 0
          ? `Scintillators ${unusable.map((bar) => bar.scintillator).join(", ")} are left out: their PMTs are noisy or dead. `
          : ""}
        The method needs a reference period recorded with the same trigger
        settings; when the trigger rate differs a warning is shown. Weak sources
        (Co-60, Na-22 at their present activity) cannot be seen, and the
        simulation behind the position model is approximate. The scores are not
        probabilities.
      </p>
    </>
  );
}
