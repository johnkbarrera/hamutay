# Arquitectura del frontend

Aplicación **React + Vite** con diseño en **CSS puro** (tema andino, _glassmorphism_, tipografías vía Google Fonts en `src/index.css`).

## Stack

- **React 19**, **Vite 8**, **React Router 7** (`react-router-dom`).
- **TypeScript** en todo `src/`.
- **lucide-react** para iconos.
- **Oxlint / Oxfmt** para lint y formato ([calidad de código](code-quality.md)).

## Estructura de carpetas

| Ruta | Contenido |
|------|-----------|
| `src/main.tsx` | Entrada: monta React en el DOM. |
| `src/App.tsx` | Rutas y layouts (público con header/footer, rutas protegidas). |
| `src/index.css` | Sistema de diseño: variables, utilidades (p. ej. `.glass-card`), animaciones. |
| `src/pages/` | Pantallas de nivel superior (landing, login, dashboards, portal). |
| `src/pages/modules/` | Módulos embebidos en dashboards (usuarios, colegios, roles, estructura académica, planes). |
| `src/components/` | Componentes compartidos (`PlatformTable`, `ProtectedRoute`, `StorageImage`). |

## Rutas (referencia)

Definidas en `src/App.tsx`:

- **Públicas con layout:** `/`, `/login`.
- **Semi-pública:** `/select-school` (usa `sessionStorage` tras el login).
- **Protegidas (admin plataforma):** `/dashboard`, `/dashboard/schools/:id`.
- **Protegidas (portal escolar):** `/school-portal`.

`ProtectedRoute` envuelve rutas privadas; la autenticación usa `localStorage` (`token`, `user`) y a veces `sessionStorage` (`pending_login` para elegir colegio).

## Configuración y API

- URLs base en `src/config.ts`: `API_URL`, `APP_URL`.
- Variables de entorno Vite (opcionales): `VITE_API_URL`, `VITE_APP_URL` (por defecto suelen apuntar a localhost en desarrollo).
- Las llamadas a la API suelen enviar `Authorization: Bearer` con el token de `localStorage`, siguiendo el patrón de los módulos existentes.

## UI y copy

- Textos de interfaz orientados a **español**, salvo que se esté trabajando en i18n explícita.

## Almacenamiento de archivos

- URLs prefirmadas (S3 / R2 u otro objeto storage) para no saturar el backend; ver uso de `StorageImage` y flujos similares en el código.
