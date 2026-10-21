export function EventsSkeleton() {
  return (
    <>
      <output
        className="mt-10 block border-t border-line pt-4 text-sm text-muted"
        aria-live="polite"
      >
        Loading detector events… Long time ranges can take a few seconds.
      </output>

      <div
        className="mt-8 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        aria-hidden="true"
      >
        {Array.from({ length: 16 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
            key={index}
            className="bg-white p-4"
          >
            <div className="h-4 w-10 bg-surface motion-safe:animate-pulse" />
            <div className="mt-3 h-[84px] bg-surface motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}
