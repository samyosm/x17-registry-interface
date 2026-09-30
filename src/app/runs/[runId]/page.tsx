import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { runRepository } from "@/features/runs/data/run-repository";
import { parseRunQuery } from "@/features/runs/query";
import { RunDetailPage } from "@/features/runs/views/run-detail-page";

export async function generateMetadata({
  params,
}: PageProps<"/runs/[runId]">): Promise<Metadata> {
  const { runId } = await params;
  const run = await runRepository.getById(runId);
  return {
    title: run ? `Run ${run.runNumber}: ${run.title}` : "Run not found",
  };
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/runs/[runId]">) {
  const [{ runId }, rawQuery] = await Promise.all([params, searchParams]);
  const run = await runRepository.getById(runId);
  if (!run) notFound();
  return <RunDetailPage run={run} query={parseRunQuery(rawQuery)} />;
}
