import type { Metadata } from "next";
import { getDiagnostics } from "@/features/diagnostics/data/diagnostics-repository";
import { DiagnosticsPage } from "@/features/diagnostics/views/diagnostics-page";

export const metadata: Metadata = { title: "Diagnostics" };

export default async function Page() {
  return <DiagnosticsPage data={await getDiagnostics()} />;
}
