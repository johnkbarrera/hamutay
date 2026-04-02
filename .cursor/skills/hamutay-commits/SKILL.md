---
name: hamutay-commits
description: >-
  Drafts and reviews Git commit messages for this repository using expressive
  emoji-led summaries and clear body text. Use when the user asks for a commit,
  commit message, conventional commits, changelog-style titles, or PR titles.
---

# Commit messages (Hamutay)

## Goal

Every commit message should be **easy to scan in `git log`**, reflect **what changed and why**, and use **emojis** so categories pop visually. Prefer **English or Spanish consistently** with the rest of the conversation; default to **Spanish** if the user writes in Spanish.

## Format (recommended)

Use a **short first line** (about 50–72 characters if possible), then a **blank line**, then an optional **body** with bullets or short paragraphs.

```text
<emoji> <emoji?> <type>(<scope>): <imperative summary>

<optional body: what changed, why, risks, follow-ups>
```

- **First line:** starts with **one or two emojis** (category + nuance), then **type** and optional **scope**, then **summary** in imperative mood (*add*, *fix*, *remove*, not *added* / *adding*).
- **Body:** explain **non-obvious** changes, migrations, breaking behaviour, or how to verify.

## Emoji cheat sheet (use generously)

| Emoji | Meaning |
|-------|---------|
| ✨ | Feature, UX improvement, something new and visible |
| 🐛 | Bugfix |
| 🔧 | Config, tooling, scripts, CI, hooks |
| ♻️ | Refactor without behaviour change |
| 📝 | Docs, comments, copy |
| 🎨 | Style, layout, CSS, formatting-only (Oxfmt) |
| ⚡ | Performance |
| 🔒 | Security, auth |
| 🧪 | Tests |
| 🚀 | Deploy, release, build output |
| 🗑️ | Removal, deprecation |
| 🌐 | i18n, locales |
| ♿ | Accessibility |
| 🧹 | Cleanup, dead code, small hygiene |
| 🔀 | Merge, rebase-related notes (rare on feature commits) |

Combine when it helps, e.g. `✨📝` for a documented feature, `🐛🔧` for a tooling fix that fixes builds.

## Types (Conventional Commits–style)

Use lowercase: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.

Examples of **titles**:

- `✨ feat(auth): add token refresh before dashboard load`
- `🐛 fix(table): prevent crash when rows are empty`
- `🔧 chore(husky): run oxfmt before oxlint in pre-commit`
- `📝 docs: split setup and architecture into docs/*.md`
- `♻️ refactor(modules): extract shared fetch helper for schools`
- `🎨 style: apply oxfmt to touched files`

## What the agent should do

1. Read `git diff` / `git status` (or the user’s description) and infer **scope** (area of the codebase).
2. Pick **emojis** that match the **dominant** change; add a second emoji if two themes are equally important.
3. Write a **clear summary**; add a **body** if the diff is large, risky, or touches migrations.
4. Avoid vague titles like `update` or `fix stuff` without scope.

## Anti-patterns

- A single emoji with no text detail.
- Entire message in ALL CAPS (unless the team explicitly wants it).
- Sensitive data (tokens, passwords) in the commit message.
