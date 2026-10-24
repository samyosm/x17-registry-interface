"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveLabSources } from "./data/settings-repository";

export async function saveSources(formData: FormData) {
  const enabled = formData
    .getAll("enabled")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const result = await saveLabSources(enabled);
  revalidatePath("/settings");
  redirect(
    result.status === "ok"
      ? "/settings?saved=1"
      : `/settings?error=${encodeURIComponent(result.message)}`,
  );
}
