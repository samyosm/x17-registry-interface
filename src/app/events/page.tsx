import type { Metadata } from "next";
import { getDetectorEvents } from "@/features/events/data/events-repository";
import { parseRange, parseScale } from "@/features/events/range";
import { EventsPage } from "@/features/events/views/events-page";

export const metadata: Metadata = { title: "Latest events" };

export default async function Page({ searchParams }: PageProps<"/events">) {
  const params = await searchParams;
  const range = parseRange(params);
  return (
    <EventsPage
      range={range}
      scale={parseScale(params)}
      data={await getDetectorEvents(range.from, range.to)}
    />
  );
}
