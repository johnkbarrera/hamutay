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

## Deployment en Producción

### 1. Preparar la build

```bash
pnpm run build
```

Esto genera la carpeta `dist/` con los archivos optimizados y listos para servir en producción.

### 2. Variables de entorno

Las variables de entorno se pasan en el **workflow de GitHub Actions** (desde los Secrets), no en el archivo `.env` del repositorio.

**Variables a configurar en GitHub Secrets:**
- `VITE_API_URL_PROD`: URL de tu API en producción (ej: `https://api.kankunapaq.com`)
- `VITE_APP_URL_PROD`: URL de tu app en producción (ej: `https://hamutay.kankunapaq.com`)

**Localmente (desarrollo):**
Si necesitas testear la build localmente, usa:
```bash
VITE_API_URL=http://localhost:8000 VITE_APP_URL=http://localhost:5173 pnpm run build
```

**Nota:** Las variables deben tener el prefijo `VITE_` para ser expuestas al cliente en tiempo de build (ver [Vite Envs](https://vitejs.dev/guide/env-and-modes.html)). No se usan en `.env` en el repositorio.

### 3. Opciones de hosting

#### **Vercel** (Recomendado para React + Vite)
1. Conecta tu repositorio: https://vercel.com
2. Vercel detecta automáticamente Vite como framework
3. En **Settings → Environment Variables**, agrega:
   - `VITE_API_URL`: Tu URL de API en producción
   - `VITE_APP_URL`: Tu URL de app en producción
4. Deploy automático en cada push a `main`

#### **Cloudflare Pages**
1. Conecta tu repositorio: https://pages.cloudflare.com
2. **Build command:** `pnpm run build`
3. **Build output directory:** `dist`
4. Agrega variables de entorno en el dashboard
5. Despliega

#### **AWS S3 + CloudFront**
```bash
# Después de pnpm run build
aws s3 sync dist/ s3://tu-bucket-name/ --delete
# Invalida el caché de CloudFront (opcional)
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

#### **Docker** (para orquestación)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Testing antes de desplegar

```bash
# Comprueba tipos TypeScript
pnpm run typecheck

# Ejecuta el linter
pnpm run lint

# Verifica la build localmente
pnpm run preview
```

La vista previa simula cómo se comportará en producción. Sirve en **http://localhost:4173**.

### 5. Checklist de deployment

- [ ] `pnpm run typecheck` sin errores
- [ ] `pnpm run lint` sin advertencias críticas
- [ ] Variables de entorno `.env.production` configuradas
- [ ] `pnpm run build` genera `dist/` correctamente
- [ ] `pnpm run preview` funciona sin errores
- [ ] API backend está disponible desde la URL de producción
- [ ] CORS configurado correctamente en el backend
- [ ] Certificados SSL/TLS configurados (si usas HTTPS)
- [ ] pm2 instalado y configurado en el VPS
- [ ] nginx configurado como reverse proxy (opcional si ya está configurado)

### 6. CI/CD Automático con GitHub Actions

Este repositorio incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que **automatiza el deployment** en cada push a `main`:

**Pasos del workflow:**
1. ✅ Valida estructura de proyecto
2. 📦 Instala dependencias con pnpm
3. 🔍 Ejecuta typecheck (verificación de tipos)
4. 🎨 Ejecuta linter (oxlint)
5. 🏗️ Construye optimizado (`pnpm run build`)
6. 📤 Conecta al VPS vía SSH
7. 🚀 Inicia/reinicia app con pm2 (`serve -s dist -l 3000`)
8. ✅ Verifica salud del servicio (health check en puerto 3000)

**Configurar GitHub Secrets:**

En tu repositorio GitHub, ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `SERVER_IP` | IP de tu VPS | `15.235.49.139` |
| `SERVER_USER` | Usuario SSH | `deploy` |
| `SSH_PRIVATE_KEY` | Clave privada SSH | (contenido de `~/.ssh/id_rsa`) |
| `VITE_API_URL_PROD` | URL API en producción | `https://api.kankunapaq.com` |
| `VITE_APP_URL_PROD` | URL app en producción | `https://hamutay.kankunapaq.com` |

**Generar clave SSH (en tu máquina local):**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/hamutay_deploy -C "hamutay-deploy"
# Copia el contenido de ~/.ssh/hamutay_deploy (PRIVADA) a GitHub Secret SSH_PRIVATE_KEY
# Copia ~/.ssh/hamutay_deploy.pub (PÚBLICA) al servidor en ~/.ssh/authorized_keys
```

**Estructura esperada en el VPS:**
```bash
/home/deploy/open_projects/hamutay/  # Repositorio clonado + dist/
```

**Configuración con pm2:**

El repositorio incluye `ecosystem.config.js` con la configuración de pm2. Instala globalmente en el VPS:
```bash
npm install -g pm2 serve
pm2 startup
pm2 save
```

**Nota:** pm2 sirve la app en puerto 3000. Si tienes nginx configurado, debe hacer reverse proxy a este puerto. Si no tienes nginx, pm2 puede servir directamente (aunque no es recomendado para producción).

**Iniciar la app (en el VPS):**
```bash
cd ~/open_projects/hamutay
pm2 start ecosystem.config.js
# O para reinicar si ya está corriendo
pm2 restart ecosystem.config.js
```

**Certificados SSL con Let's Encrypt (Recomendado):**

```bash
# Instala Certbot en el VPS
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtén certificado para el subdominio
sudo certbot certonly --nginx -d hamutay.kankunapaq.com

# El certificado se guarda en: /etc/letsencrypt/live/hamutay.kankunapaq.com/
```

**nginx.conf actualizado con HTTPS (opcional si ya tienes nginx configurado):**
```nginx
# Redirect HTTP a HTTPS
server {
    listen 80;
    server_name hamutay.kankunapaq.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name hamutay.kankunapaq.com;

    ssl_certificate /etc/letsencrypt/live/hamutay.kankunapaq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hamutay.kankunapaq.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Para SPA React
        error_page 404 =200 /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Si ya tienes nginx configurado:** Solo asegúrate de que haga reverse proxy al puerto 3000 donde corre pm2.

**Renovación automática de certificados:**
```bash
# Certbot renueva automáticamente, pero puedes forzar con:
sudo certbot renew --dry-run
```

**Monitoreo con pm2:**
```bash
pm2 monit                    # Monitor en tiempo real
pm2 logs hamutay_frontend    # Ver logs
pm2 restart hamutay_frontend # Reiniciar manualmente
pm2 stop hamutay_frontend    # Detener
```

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
