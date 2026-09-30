import { runRepository } from "@/features/runs/data/run-repository";
import { parseRunQuery } from "@/features/runs/query";
import { RunsPage } from "@/features/runs/views/runs-page";

export default async function Home({ searchParams }: PageProps<"/">) {
  const query = parseRunQuery(await searchParams);
  const result = await runRepository.search(query);
  return <RunsPage query={{ ...query, page: result.page }} result={result} />;
}
