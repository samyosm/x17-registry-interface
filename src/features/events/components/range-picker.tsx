import Link from "next/link";
import { type EventRange, presets } from "../range";

const inputClass =
  "h-11 w-full border-b border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent";

export function RangePicker({ range }: { range: EventRange }) {
  return (
    <div className="mt-10 space-y-6">
      <nav aria-label="Time range">
        <p className="mb-2 text-xs font-semibold text-ink">Latest data</p>
        <ul className="flex flex-wrap gap-px bg-line">
          {presets.map((preset) => {
            const active = range.mode === preset.id;
            return (
              <li key={preset.id}>
                <Link
                  href={`/events?range=${preset.id}`}
                  aria-current={active ? "true" : undefined}
                  className={`block h-10 px-4 text-sm leading-10 ${
                    active
                      ? "bg-ink text-white"
                      : "bg-white text-ink hover:bg-surface"
                  }`}
                >
                  Last {preset.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        action="/events"
        method="get"
        aria-label="Custom time range"
        className="grid gap-4 sm:grid-cols-[220px_220px_auto] sm:items-end"
      >
        <div>
          <label
            htmlFor="range-from"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            From (UTC)
          </label>
          <input
            id="range-from"
            name="from"
            type="datetime-local"
            required
            defaultValue={range.fromInput}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="range-to"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            To (UTC)
          </label>
          <input
            id="range-to"
            name="to"
            type="datetime-local"
            required
            defaultValue={range.toInput}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="h-11 bg-accent px-6 text-sm font-medium text-white hover:bg-[#0043ce]"
        >
          Show range
        </button>
      </form>
    </div>
  );
}
