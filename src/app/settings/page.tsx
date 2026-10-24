import type { Metadata } from "next";
import { getLabSources } from "@/features/settings/data/settings-repository";
import { SettingsPage } from "@/features/settings/views/settings-page";

export const metadata: Metadata = { title: "Settings" };

export default async function Page({ searchParams }: PageProps<"/settings">) {
  const params = await searchParams;
  return (
    <SettingsPage
      outcome={await getLabSources()}
      saved={params.saved === "1"}
      error={typeof params.error === "string" ? params.error : null}
    />
  );
}
