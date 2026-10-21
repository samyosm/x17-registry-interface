import { EventsSkeleton } from "@/features/events/components/events-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="pt-16 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          Detector
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Latest events.
        </h1>
      </div>
      <EventsSkeleton />
    </div>
  );
}
