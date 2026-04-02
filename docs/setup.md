# Configuración y entorno local

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (recomendado).
- [pnpm](https://pnpm.io/installation): versión alineada con el campo `packageManager` en `package.json`. Con [Corepack](https://nodejs.org/api/corepack.html): `corepack enable` y `corepack prepare pnpm@<versión> --activate`.
- Para login y datos reales: API backend (p. ej. FastAPI) en `http://localhost:8000`, según tu entorno.

## Validar el gestor de paquetes

Antes de `pnpm install`, comprueba que no tengas desactivados los scripts de instalación a nivel global (pnpm, npm o yarn):

```bash
pnpm run validate:pm
```

Si falla, corrige lo que indique el mensaje (por ejemplo, no debe estar `ignore-scripts=true` en npm/pnpm ni `enableScripts: false` en Yarn Berry).

## Instalación

En la raíz del repositorio:

```bash
pnpm install
```

El script `prepare` registra los hooks de Git (Husky) tras instalar.

## Servidor de desarrollo

```bash
pnpm run dev
```

Vite suele servir en **http://localhost:5173** con recarga en vivo (HMR). Detén el servidor con `Ctrl+C` en la terminal.

## Build de producción

```bash
pnpm run build
```

Genera la carpeta `dist/` lista para desplegar (Cloudflare Pages, Vercel, S3, etc.). Vista previa local:

```bash
pnpm run preview
```
