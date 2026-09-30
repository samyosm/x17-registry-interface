"use client";

import { DataState } from "@/components/data-state";

export default function RegistryError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <DataState
        title="Could not load the registry"
        description="The data could not be loaded right now. Please try again."
        action={
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer font-medium text-accent hover:underline"
          >
            Try again
          </button>
        }
      />
    </div>
  );
}
