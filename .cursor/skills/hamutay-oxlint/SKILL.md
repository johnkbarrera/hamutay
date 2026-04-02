---
name: hamutay-oxlint
description: Use when running or configuring the linter, fixing lint failures, or deciding lint policy for CI in this repository.
---

# Oxlint in Hamutay

## Commands

- **Check:** `pnpm run lint` (runs `oxlint`).
- **Autofix:** `pnpm run lint:fix` (runs `oxlint --fix`).
- **Format (Oxfmt):** `pnpm run fmt` writes formatted output; `pnpm run fmt:check` fails if anything would change (CI-friendly). Config: **`.oxfmtrc.json`**. Oxlint does not format code; **Oxfmt** is the formatter ([Oxfmt docs](https://oxc.rs/docs/guide/usage/formatter.html)).

## Human-facing documentation

- Contributors: see **`docs/index.md`** and **`docs/code-quality.md`** for scripts, Oxlint vs Oxfmt, Git hooks, and Cursor/VS Code setup (`.vscode/`).

## Configuration

- Config file: **`.oxlintrc.json`** at the repo root (JSON with `$schema` pointing at `node_modules/oxlint/configuration_schema.json`).
- **Build output** `dist/` is ignored via `ignorePatterns` in that file.
- Plugins enabled include **eslint**, **typescript**, **unicorn**, **oxc**, and **react** (covers React, React Hooks, and React Refresh–style rules).

## Policy

- This project uses **Oxlint as the sole JS/TS linter**. Do not add ESLint, `eslint.config.*`, or ESLint plugins unless the team explicitly decides to reintroduce them.
- For CI, you can treat warnings as failures with Oxlint’s CLI (for example `--max-warnings 0` or `--deny-warnings` if your Oxlint version supports it); align the exact flag with the [Oxlint CLI reference](https://oxc.rs/docs/guide/usage/linter/cli.html).

## Typechecking

- TypeScript checking is separate: `pnpm run typecheck` runs `tsc --noEmit`. Run both **lint** and **typecheck** before merges when changing TS/TSX.

## Git pre-commit (Husky + lint-staged)

- On `git commit`, **`.husky/pre-commit`** runs **`pnpm exec lint-staged`**, which runs **`oxfmt`** then **oxlint** on **staged** `*.ts` / `*.tsx` files (see **`lint-staged`** in `package.json`). The commit fails if formatting would change a file or if oxlint reports errors.
- **Full-tree lint** (slower, no staging filter): `pnpm run lint` — useful in CI or when you want the same scope as local `lint`.
- After cloning, run **`pnpm install`** so the **`prepare`** script registers Husky hooks.
