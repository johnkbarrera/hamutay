# Calidad de código

El código de `src/` está en **TypeScript** (`.ts` / `.tsx`). La calidad combina el compilador, el linter y el formateador del ecosistema **[Oxc](https://oxc.rs/)**.

| Herramienta | Rol | Configuración en el repo |
|-------------|-----|---------------------------|
| **TypeScript** (`tsc`) | Comprobación de tipos sin emitir JS | `tsconfig.json`, `tsconfig.node.json` |
| **Oxlint** | Linter (reglas de estilo y corrección) | [`.oxlintrc.json`](../.oxlintrc.json) |
| **Oxfmt** | Formateador de código | [`.oxfmtrc.json`](../.oxfmtrc.json) |

**Oxlint no formatea**; el formato lo aplica **Oxfmt**. Documentación oficial: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html), [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html).

## Scripts

```bash
pnpm run typecheck   # tsc --noEmit
pnpm run lint        # oxlint en el proyecto
pnpm run lint:fix    # oxlint con correcciones automáticas seguras
pnpm run fmt         # aplicar formato (oxfmt) en el árbol del repo
pnpm run fmt:check   # falla si algo no está formateado (útil en CI)
```

Antes de integrar cambios, conviene ejecutar `typecheck`, `lint` y `fmt:check` (o al menos `fmt`).

## Git hooks (pre-commit)

Tras `pnpm install`, **Husky** ejecuta **lint-staged** en cada `git commit`: primero **Oxfmt**, luego **Oxlint**, solo sobre archivos `*.ts` / `*.tsx` incluidos en el commit. Si el formato no coincide o el linter falla, el commit se rechaza.

## Política

- **Oxlint** es el único linter JS/TS por defecto; no añadir ESLint salvo decisión explícita del equipo.
- En CI se pueden tratar los warnings como error con flags de Oxlint (p. ej. `--max-warnings 0`); ver la [CLI de Oxlint](https://oxc.rs/docs/guide/usage/linter/cli.html).
