import type { Metadata } from "next";
import { getDetectorEvents } from "@/features/events/data/events-repository";
import { parseRange } from "@/features/events/range";
import { EventsPage } from "@/features/events/views/events-page";

export const metadata: Metadata = { title: "Latest events" };

export default async function Page({ searchParams }: PageProps<"/events">) {
  const range = parseRange(await searchParams);
  return (
    <EventsPage
      range={range}
      data={await getDetectorEvents(range.from, range.to)}
    />
  );
}
