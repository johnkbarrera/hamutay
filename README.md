# Hamutay Platform Dashboard

Plataforma principal de gestión e infraestructura administrativa para los colegios suscritos a Hamutay.

## 🚀 Cómo iniciar el proyecto en local

Para ejecutar el entorno de frontend (React + Vite) en tu máquina local, sigue estos sencillos pasos:

### 1. Requisitos Previos
- Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- Para un funcionamiento pleno, recuerda tener el servidor de Backend (`hamutay_api` en FastAPI) corriendo en `http://localhost:8000` (esto es necesario para el login y obtención/subida de datos).

### 2. Instalación de Dependencias
Abre una terminal asegurándote de estar en la raíz de este proyecto (`hamutay`) e instala los paquetes necesarios ejecutando:

```bash
npm install
```

### 3. Ejecutar el Servidor de Desarrollo
Una vez descargadas todas las dependencias, inicializa el servidor local de Vite con el siguiente comando:

```bash
npm run dev
```

La consola te indicará que el proyecto está disponible localmente, por diseño de Vite esto generalmente es en la ruta: **http://localhost:5173** 

*Haz `Ctrl + C` (o `Cmd + C`) en la terminal para detener el servidor web cuando hayas terminado.*

### 4. Compilación para Producción (Opcional)
Cuando estés listo para subir los cambios a un entorno real o de staging, puedes empaquetar la aplicación con:
```bash
npm run build
```
Esto creará una carpeta `/dist` lista para ser desplegada en tu proveedor favorito (Cloudflare Pages, Vercel, AWS S3, etc.).

---

### Mantenimiento y Tecnologías
- **Frameworks:** React 19, Vite, React Router V7
- **Iconografía:** Lucide React
- **Almacenamiento:** Conexión para Presigned URLs (S3 / R2) directa desde el frontend evitando saturar el backend.
