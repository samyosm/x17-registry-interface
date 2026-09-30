import { beamLabel, completenessLabel } from "../format";
import type { BeamStatus, RunCompleteness } from "../model";

const dotClass: Record<RunCompleteness | BeamStatus, string> = {
  complete: "bg-[#198038]",
  partial: "bg-[#b28600]",
  pending: "bg-[#8d8d8d]",
  on: "bg-[#0f62fe]",
  off: "bg-[#8d8d8d]",
  unknown: "bg-[#b28600]",
};

export function StatusLabel({
  type,
  value,
}:
  | {
      type: "beam";
      value: BeamStatus;
    }
  | {
      type: "completeness";
      value: RunCompleteness;
    }) {
  const label = type === "beam" ? beamLabel(value) : completenessLabel(value);

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-ink">
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClass[value]}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
