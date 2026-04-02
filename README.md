# Hamutay Platform Dashboard

Plataforma principal de gestión e infraestructura administrativa para los colegios suscritos a Hamutay. Este repositorio contiene el **frontend** web (React + Vite + TypeScript), con diseño en CSS puro (tema andino, _glassmorphism_).

**Documentación detallada:** [docs/index.md](docs/index.md) (configuración, calidad de código, editor, arquitectura).

## Gestor de paquetes

Este repositorio usa **[pnpm](https://pnpm.io/)**. El campo `packageManager` en `package.json` fija la versión esperada; con Node 16.13+ puedes usar [Corepack](https://nodejs.org/api/corepack.html) para activarla automáticamente (`corepack enable`).

Antes de instalar dependencias, valida que no tengas desactivados los scripts de instalación en la configuración global de pnpm, npm o yarn:

```bash
pnpm run validate:pm
```

Si este comando falla, sigue las instrucciones que imprime (por ejemplo, no debe estar `ignore-scripts=true` en npm/pnpm ni `enableScripts: false` en Yarn Berry).

## Inicio rápido

```bash
pnpm install
pnpm run dev
```

Por defecto Vite suele usar **http://localhost:5173**. Requisitos, build de producción y más: **[docs/setup.md](docs/setup.md)**.

## Calidad de código (resumen)

| Comando | Descripción |
|---------|-------------|
| `pnpm run typecheck` | Comprueba tipos TypeScript |
| `pnpm run lint` / `pnpm run lint:fix` | Oxlint (linter) |
| `pnpm run fmt` / `pnpm run fmt:check` | Oxfmt (formato) |

En cada **commit**, Husky ejecuta **Oxfmt** y **Oxlint** sobre los `*.ts` / `*.tsx` staged. Detalle: **[docs/code-quality.md](docs/code-quality.md)**. Editor (Cursor/VS Code): **[docs/editor.md](docs/editor.md)**.

## Mantenimiento y tecnologías

- **Frameworks:** React 19, Vite 8, React Router v7, TypeScript
- **Calidad:** Oxlint (linter) y Oxfmt (formateador), Husky + lint-staged en commits
- **Iconografía:** Lucide React
- **Almacenamiento:** URLs prefirmadas (S3 / R2) desde el frontend cuando aplica

Estructura de carpetas, rutas y API: **[docs/architecture.md](docs/architecture.md)**.
