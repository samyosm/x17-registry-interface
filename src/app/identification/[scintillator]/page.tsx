import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DataState } from "@/components/data-state";
import { IdentificationSkeleton } from "@/features/identification/components/identification-skeleton";
import { getDiagnostics } from "@/features/identification/data/identification-repository";
import {
  type IdentificationQuery,
  parseQuery,
} from "@/features/identification/query";
import { DiagnosticsView } from "@/features/identification/views/diagnostics-page";

export const metadata: Metadata = { title: "Scintillator diagnostics" };

async function LoadedDiagnostics({
  scintillator,
  query,
}: {
  scintillator: string;
  query: IdentificationQuery;
}) {
  const outcome = await getDiagnostics(
    scintillator,
    query.range.from,
    query.range.to,
    query.limit,
  );
  if (outcome.status === "missing") notFound();
  if (outcome.status !== "ok") {
    return (
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <DataState
          title={
            outcome.status === "unavailable"
              ? "Source identification is not set up"
              : "Diagnostics failed"
          }
          description={outcome.message}
        />
      </div>
    );
  }
  return <DiagnosticsView data={outcome.data} query={query} />;
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/identification/[scintillator]">) {
  const { scintillator } = await params;
  const query = parseQuery(await searchParams);
  const view = [
    scintillator,
    query.range.mode,
    query.limit,
    query.range.mode === "custom"
      ? `${query.range.fromInput}/${query.range.toInput}`
      : "",
  ].join("|");
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <Suspense key={view} fallback={<IdentificationSkeleton />}>
        <LoadedDiagnostics scintillator={scintillator} query={query} />
      </Suspense>
    </div>
  );
}
