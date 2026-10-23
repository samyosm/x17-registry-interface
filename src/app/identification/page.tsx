import type { Metadata } from "next";
import { Suspense } from "react";
import { DataState } from "@/components/data-state";
import { IdentificationSkeleton } from "@/features/identification/components/identification-skeleton";
import { getIdentification } from "@/features/identification/data/identification-repository";
import {
  type IdentificationQuery,
  parseQuery,
} from "@/features/identification/query";
import {
  IdentificationPage,
  IdentificationResults,
} from "@/features/identification/views/identification-page";

export const metadata: Metadata = { title: "Source identification" };

async function LoadedIdentification({ query }: { query: IdentificationQuery }) {
  const outcome = await getIdentification(query.range.from, query.range.to);
  if (outcome.status !== "ok") {
    return (
      <div className="mt-10">
        <DataState
          title={
            outcome.status === "unavailable"
              ? "Source identification is not set up"
              : "Source identification failed"
          }
          description={outcome.message}
        />
      </div>
    );
  }
  return <IdentificationResults data={outcome.data} query={query} />;
}

export default async function Page({
  searchParams,
}: PageProps<"/identification">) {
  const query = parseQuery(await searchParams);
  // Presets move with the clock, so the selection (not the timestamps)
  // identifies a view; a new key shows the skeleton while it loads.
  const view = [
    query.range.mode,
    query.range.mode === "custom"
      ? `${query.range.fromInput}/${query.range.toInput}`
      : "",
  ].join("|");
  return (
    <IdentificationPage query={query}>
      {query.run ? (
        <Suspense key={view} fallback={<IdentificationSkeleton />}>
          <LoadedIdentification query={query} />
        </Suspense>
      ) : null}
    </IdentificationPage>
  );
}
