import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Runs | X17 Registry",
    template: "%s | X17 Registry",
  },
  description: "Find X17 experiment runs and their data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ink antialiased">
        <SiteHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
