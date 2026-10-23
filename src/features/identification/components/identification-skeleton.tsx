export function IdentificationSkeleton() {
  return (
    <>
      <output
        className="mt-10 block border-t border-line pt-4 text-sm text-muted"
        aria-live="polite"
      >
        Identifying sources… Long periods can take a few seconds.
      </output>
      <div className="mt-8 space-y-px" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
            key={index}
            className="h-10 bg-surface motion-safe:animate-pulse"
          />
        ))}
      </div>
    </>
  );
}
