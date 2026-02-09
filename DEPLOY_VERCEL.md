# Guía de Despliegue en Vercel (Recomendado)

Vercel es la plataforma nativa de Next.js y es la opción **más rápida y robusta** para tu proyecto.

## El Reto: Base de Datos
Tu proyecto usa actualmente **SQLite** (un archivo local).
*   **Problema:** Vercel es "serverless" (sin servidor fijo). No puede escribir en archivos locales. Si usas SQLite en Vercel, la base de datos se borrará o bloqueará.
*   **Solución:** Usar **Vercel Postgres** (una base de datos en la nube que Vercel te regala en el plan gratuito).

---

## Pasos para Desplegar

### 1. Preparar el Proyecto (Cambio a PostgreSQL)

1.  Ve al archivo `prisma/schema.prisma`.
2.  Cambia el proveedor de `sqlite` a `postgresql`.
    ```prisma
    datasource db {
      provider = "postgresql" // Antes era "sqlite"
      url      = env("DATABASE_URL")
    }
    ```
    *(Nota: Si haces esto, en tu local dejará de funcionar hasta que conectes una URL de Postgres real, pero es necesario para producción).*

### 2. Subir a GitHub
Vercel se conecta a tu repositorio de GitHub.
1.  Asegúrate de que tu código esté subido a un repositorio en GitHub.

### 3. Crear Proyecto en Vercel
1.  Ve a [vercel.com](https://vercel.com) y regístrate (puedes usar tu cuenta de GitHub).
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Importa tu repositorio de GitHub.

### 4. Configurar Base de Datos (Storage)
**¡No despliegues todavía!** Antes de darle a "Deploy":

1.  En la pantalla de configuración del proyecto en Vercel, busca la sección **"Storage"** en el menú izquierdo (o una vez creado el proyecto).
2.  Haz clic en **"Create Database"** -> Selecciona **"Postgres"**.
3.  Acepta las condiciones y crea la base de datos.
4.  Vercel añadirá automáticamente las variables de entorno (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.) a tu proyecto.
5.  **Importante:** En la sección "Settings" -> "Environment Variables" de tu proyecto en Vercel, asegúrate de que la variable `DATABASE_URL` esté vinculada al valor de `POSTGRES_PRISMA_URL`.

### 5. Desplegar
1.  Ahora sí, haz clic en **Deploy**.
2.  Vercel construirá tu app.
3.  **Migración:** Una vez desplegado, es posible que necesites ejecutar las migraciones en la base de datos de producción.
    *   Vercel tiene una opción para ejecutar comandos, o puedes conectarte desde tu local a la base de datos remota y ejecutar `npx prisma migrate deploy`.

---

## ¿Por qué no Firebase?
*   **Tiempo:** Para usar Firebase bien, tendríamos que reescribir toda la lógica de `actions.ts` para dejar de usar Prisma (SQL) y usar Firestore (NoSQL). Eso tomaría horas de reprogramación.
*   **Compatibilidad:** Next.js funciona de forma nativa en Vercel. En Firebase es un "experimento" que envuelve la app en Cloud Functions, lo que suele ser más lento (cold starts).

**Resumen:** Vercel + Vercel Postgres es la ruta ganadora hoy.
