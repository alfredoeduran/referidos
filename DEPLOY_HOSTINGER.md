# Guía de Despliegue en Hostinger (VPS / Plan Node.js)

Esta aplicación utiliza **Next.js (App Router) + Prisma + SQLite**. Debido a que usa Server Actions y base de datos, **NO** puede ser desplegada como un sitio estático en un hosting compartido convencional (cPanel básico).

Necesitas un **Plan VPS** o un **Plan de Hosting Node.js** en Hostinger.

## Paso 1: Preparación del Proyecto

Hemos configurado `output: 'standalone'` en `next.config.ts`. Esto optimiza la compilación para producción.

1.  En tu terminal local, ejecuta:
    ```bash
    npm run build
    ```
2.  Esto generará una carpeta `.next/standalone` y una carpeta `.next/static`.

## Paso 2: Subir Archivos al Servidor

Debes subir los siguientes archivos/carpetas a tu servidor Hostinger (usando FileZilla o el Administrador de Archivos):

1.  El contenido de `.next/standalone` (esta será tu raíz).
2.  La carpeta `.next/static` debe copiarse dentro de `.next/standalone/.next/static`.
3.  La carpeta `public` debe copiarse dentro de `.next/standalone/public`.
4.  La carpeta `prisma` (necesaria para migraciones).
5.  El archivo `.env` (configurado para producción).

**Estructura final en el servidor:**
```
/home/usuario/domains/tudominio.com/public_html/
├── .next/
│   ├── static/  <-- (Copiada desde tu build local .next/static)
├── public/      <-- (Copiada desde tu raíz local)
├── prisma/      <-- (Schema y migraciones)
├── .env         <-- (Variables de entorno)
├── server.js    <-- (Generado automáticamente por Next.js en standalone)
└── package.json <-- (Generado automáticamente)
```

## Paso 3: Configuración en Hostinger (Node.js)

1.  Ve a tu panel de Hostinger -> **Node.js**.
2.  Versión de Node.js: Selecciona **Node.js 18** o superior (recomendado 20).
3.  Application Startup File: `server.js`.
4.  Instalar dependencias (si es necesario):
    *   Normalmente el modo standalone ya trae `node_modules`. Si falta algo, puedes dar clic en "NPM Install" en el panel.
5.  **Base de Datos (Importante):**
    *   Como usas SQLite, el archivo `dev.db` se creará en la carpeta `prisma/`.
    *   Ejecuta las migraciones en la terminal del servidor (SSH o Terminal del panel):
        ```bash
        npx prisma migrate deploy
        ```

## Paso 4: Variables de Entorno (.env)

Crea o edita el archivo `.env` en el servidor:

```env
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_BASE_URL="https://tudominio.com"
# Genera una clave segura para JWT o Auth si implementas auth real más adelante
```

## Paso 5: Iniciar la Aplicación

En el panel de Hostinger, haz clic en **Restart** o **Start**.

## Notas sobre SQLite en Producción

*   SQLite es un archivo. Si borras la carpeta del servidor para volver a subir la web, **borrarás tu base de datos**.
*   **Recomendación:** Haz backups regulares del archivo `.db` que está en `prisma/`.
*   O considera cambiar a PostgreSQL o MySQL (que Hostinger ofrece gratis) cambiando el `provider` en `schema.prisma`.

---

## Alternativa: Docker (Solo VPS)

Si tienes un VPS completo (no hosting compartido Node.js), la forma más fácil es usar Docker.

1.  Crear `Dockerfile`.
2.  Construir imagen.
3.  Correr contenedor.
