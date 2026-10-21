import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsSkeleton } from "@/features/events/components/events-skeleton";
import { getDetectorEvents } from "@/features/events/data/events-repository";
import {
  type EventRange,
  type EventScale,
  parseRange,
  parseScale,
} from "@/features/events/range";
import { EventsPage, EventsResults } from "@/features/events/views/events-page";

export const metadata: Metadata = { title: "Latest events" };

async function LoadedEvents({
  range,
  scale,
}: {
  range: EventRange;
  scale: EventScale;
}) {
  const data = await getDetectorEvents(range.from, range.to);
  return <EventsResults range={range} scale={scale} data={data} />;
}

export default async function Page({ searchParams }: PageProps<"/events">) {
  const params = await searchParams;
  const range = parseRange(params);
  const scale = parseScale(params);
  // Presets move with the clock, so only the selection (not the timestamps)
  // identifies a view. A new key shows the skeleton while data loads; the
  // periodic refresh keeps the same key and so keeps the old charts visible.
  const view = [
    range.mode,
    scale,
    range.mode === "custom" ? `${range.fromInput}/${range.toInput}` : "",
  ].join("|");
  return (
    <EventsPage range={range} scale={scale}>
      <Suspense key={view} fallback={<EventsSkeleton />}>
        <LoadedEvents range={range} scale={scale} />
      </Suspense>
    </EventsPage>
  );
}
