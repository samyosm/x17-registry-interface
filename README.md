# X17 Registry Interface

Frontend repository for the unified X17 experiment registry. The application is deliberately blank while the interface and backend contracts are designed. It contains no DAQ or trigger hardware controls.

## Stack

- Next.js App Router, React, and strict TypeScript
- pnpm with a committed lockfile
- Tailwind CSS through PostCSS
- Biome for formatting, import organization, and lint checks

Use Node.js 22 and the pnpm version declared in `package.json`.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm typecheck
pnpm build
```

`pnpm dev` serves a blank page at `http://localhost:3000`. `pnpm check:fix` applies Biome's safe fixes. `pnpm format` formats files.

The production build uses Next.js's supported webpack option. In the current workspace, Turbopack's CSS worker cannot bind its internal port; the webpack build completes successfully.

## Code boundaries

`src/app/` is reserved for route entry points, layouts, and global styling. As the interface grows, keep domain-specific views and state in `src/features/<domain>/`, reusable presentation components in `src/components/`, and backend transport code in `src/lib/api/`. Place shared data types beside the feature that owns them; move them to a shared location only when several features need them.

The central backend will be the interface's data and lifecycle API. The browser should not connect directly to ZeroMQ, TriggerApp, or the beam logbook. Their separate middleware modules will feed the backend. Define request and response types from the backend contract once it exists, rather than inventing API shapes in this repository.

The root route intentionally renders nothing. No UI, API client, environment variables, or authentication flow has been added yet.
