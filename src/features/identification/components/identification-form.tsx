import Link from "next/link";
import { presets } from "@/features/events/range";
import {
  type IdentificationQuery,
  identificationHref,
  MIN_LIMIT,
} from "../query";

const inputClass =
  "h-11 w-full border-b border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent";

const labelClass = "mb-2 block text-xs font-semibold text-ink";

const segment = (active: boolean) =>
  `block h-10 px-4 text-sm leading-10 ${
    active ? "bg-ink text-white" : "bg-white text-ink hover:bg-surface"
  }`;

export function IdentificationForm({ query }: { query: IdentificationQuery }) {
  const { range, limit, run } = query;
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
                    limit,
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
        className="grid gap-4 sm:grid-cols-[220px_220px_160px_auto] sm:items-end"
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
        <div>
          <label htmlFor="identify-limit" className={labelClass}>
            Maximum readings
          </label>
          <input
            id="identify-limit"
            name="limit"
            type="number"
            inputMode="numeric"
            min={MIN_LIMIT}
            step={100}
            required
            defaultValue={limit}
            className={inputClass}
          />
        </div>
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
