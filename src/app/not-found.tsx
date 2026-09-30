import Link from "next/link";
import { DataState } from "@/components/data-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <DataState
        title="Run not found"
        description="The run may have been removed, or the link may be incorrect."
        action={
          <Link href="/" className="font-medium text-accent hover:underline">
            Browse runs
          </Link>
        }
      />
    </div>
  );
}
