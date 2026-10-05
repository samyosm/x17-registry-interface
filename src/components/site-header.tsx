import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-accent"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="X17 registry, runs"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-ink text-sm font-semibold tracking-tight text-white">
            X17
          </span>
          <span className="text-sm font-semibold tracking-tight">Registry</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-6">
          <Link
            href="/"
            className="py-5 text-sm font-medium text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Runs
          </Link>
          <Link
            href="/diagnostics"
            className="py-5 text-sm font-medium text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Diagnostics
          </Link>
        </nav>
      </div>
    </header>
  );
}
