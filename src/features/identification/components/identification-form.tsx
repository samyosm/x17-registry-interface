import Link from "next/link";
import { presets } from "@/features/events/range";
import { type IdentificationQuery, identificationHref } from "../query";

const inputClass =
  "h-11 w-full border-b border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent";

const labelClass = "mb-2 block text-xs font-semibold text-ink";

const segment = (active: boolean) =>
  `block h-10 px-4 text-sm leading-10 ${
    active ? "bg-ink text-white" : "bg-white text-ink hover:bg-surface"
  }`;

export function IdentificationForm({ query }: { query: IdentificationQuery }) {
  const { range, run, reference } = query;
  return (
    <div className="mt-10 space-y-6">
      <nav aria-label="Time range">
        <p className="mb-2 text-xs font-semibold text-ink">Latest data</p>
        <ul className="flex flex-wrap gap-px bg-line">
          {presets.map((preset) => {
            const active = run && range.mode === preset.id;
            return (
              <li key={preset.id}>
                <Link
                  href={identificationHref(
                    { ...range, mode: preset.id },
                    query.reference,
                  )}
                  aria-current={active ? "true" : undefined}
                  className={segment(active)}
                >
                  Last {preset.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        action="/identification"
        method="get"
        aria-label="Custom period"
        className="grid gap-4 sm:grid-cols-[220px_220px_auto] sm:items-end"
      >
        <div>
          <label htmlFor="identify-from" className={labelClass}>
            From (UTC)
          </label>
          <input
            id="identify-from"
            name="from"
            type="datetime-local"
            required
            defaultValue={range.fromInput}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="identify-to" className={labelClass}>
            To (UTC)
          </label>
          <input
            id="identify-to"
            name="to"
            type="datetime-local"
            required
            defaultValue={range.toInput}
            className={inputClass}
          />
        </div>
        <details className="sm:col-span-3" open={reference !== null}>
          <summary className="cursor-pointer text-sm text-accent">
            Reference period (optional)
          </summary>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-muted">
            The window is compared with a period without a source. By default
            that is the 24 hours before the window (or as long as the window),
            or the period after it if there is too little data before. Give both
            times to choose it; it must not overlap the window.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-[220px_220px]">
            <div>
              <label htmlFor="identify-ref-from" className={labelClass}>
                Reference from (UTC)
              </label>
              <input
                id="identify-ref-from"
                name="refFrom"
                type="datetime-local"
                defaultValue={reference?.fromInput}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="identify-ref-to" className={labelClass}>
                Reference to (UTC)
              </label>
              <input
                id="identify-ref-to"
                name="refTo"
                type="datetime-local"
                defaultValue={reference?.toInput}
                className={inputClass}
              />
            </div>
          </div>
        </details>
        <button
          type="submit"
          className="h-11 bg-accent px-6 text-sm font-medium text-white hover:bg-[#0043ce]"
        >
          Identify
        </button>
      </form>
    </div>
  );
}
