# Editor (Cursor / VS Code)

## Extensión Oxc

Instala la extensión **[Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)** (`oxc.oxc-vscode`). El repositorio la recomienda en [`.vscode/extensions.json`](../.vscode/extensions.json).

**Oxfmt** y **Oxlint** deben estar instalados en el proyecto (`pnpm install`); la extensión usa las herramientas locales del ecosistema Oxc.

## Formato y diagnósticos al guardar

En [`.vscode/settings.json`](../.vscode/settings.json) el workspace define:

- Formateador por defecto Oxc para JavaScript, TypeScript, TSX y JSON.
- **Formateo al guardar** (`editor.formatOnSave`).

Si al guardar no se formatea:

1. Comprueba que la extensión Oxc esté instalada y habilitada.
2. Ejecuta **Developer: Reload Window**.
3. Prueba **Format Document** (`Shift+Alt+F`) y verifica que el formateador sea Oxc.

Los diagnósticos de **Oxlint** en el editor también pasan por la extensión Oxc. La extensión de **ESLint** no sustituye a Oxlint en este proyecto.
