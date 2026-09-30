import type { ReactNode } from "react";

interface DataStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function DataState({ title, description, action }: DataStateProps) {
  return (
    <div className="border-y border-line px-1 py-14 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
