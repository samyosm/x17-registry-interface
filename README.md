# X17 Registry Interface

Frontend repository for the unified X17 experiment registry.

## Stack

- Next.js App Router, React, and TypeScript
- pnpm
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

`pnpm dev` serves the page at `http://localhost:3000`. `pnpm typecheck` generates Next.js route types before running TypeScript, so it also works from a clean checkout. `pnpm check:fix` applies Biome's safe fixes. `pnpm format` formats files.
