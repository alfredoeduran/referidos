# Configuración de Firebase para Goods & Co

Has decidido utilizar Firebase. Aquí tienes los pasos exactos y los servicios que debes adquirir/activar en la consola de Firebase.

## 1. Crear Proyecto en Firebase
1. Ve a [console.firebase.google.com](https://console.firebase.google.com/).
2. Crea un nuevo proyecto (ej. `goods-referidos`).
3. Desactiva Google Analytics si no lo necesitas (simplifica el setup).

## 2. Servicios a Activar (Esenciales)

### A. Authentication (Autenticación)
*   **Para qué sirve:** Gestionar usuarios (login/registro).
*   **Acción:** Ve a "Authentication" > "Sign-in method" > Activa **Email/Password**.

### B. Cloud Firestore (Base de Datos)
*   **Para qué sirve:** Guardar datos de referidos, usuarios y lotes.
*   **Acción:** Ve a "Firestore Database" > "Create Database" > Elige ubicación (ej. `us-central` o `southamerica-east1` si está disponible) > Empieza en **Production mode**.
*   **Nota Crítica:** Actualmente tu app usa **SQLite** (archivo local). **SQLite NO funciona en Firebase Hosting** (se borra). Tienes dos opciones:
    1.  **Migrar a Firestore:** Reescribir `actions.ts` para usar Firebase en lugar de Prisma (recomendado si te quedas 100% en Firebase).
    2.  **Usar SQL Externo:** Usar Firebase solo para Hosting/Auth y conectar Prisma a una base de datos PostgreSQL externa (como Neon.tech o Supabase).

### C. Storage (Almacenamiento de Archivos)
*   **Para qué sirve:** Guardar las cédulas, RUTs y certificaciones bancarias que suben los usuarios.
*   **Acción:** Ve a "Storage" > "Get started" > "Production mode".

## 3. Obtener Credenciales
1. En la consola, ve al engranaje ⚙️ > **Project settings**.
2. Baja a la sección "Your apps".
3. Haz clic en el icono `</>` (Web).
4. Registra la app (ej. "Goods Web").
5. Copia las variables de `const firebaseConfig` y pégalas en tu archivo `.env`.

## 4. Configurar Variables de Entorno
Abre tu archivo `.env` local y agrega esto (reemplaza con tus datos reales):

```env
NEXT_PUBLIC_FIREBASE_API_KEY="tu_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu_project_id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="tu_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="tu_app_id"
```

## 5. Despliegue (Hosting)
Para subir la web a Firebase:
1. Instala las herramientas: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Inicializa: `firebase init hosting`
   *   Detected framework: **Next.js** (¡Di que sí a usar web frameworks!)
   *   Server side content generation: **Yes** (usará Cloud Functions).

---

**ADVERTENCIA IMPORTANTE SOBRE SQLITE:**
Si despliegas ahora mismo a Firebase Hosting sin cambiar nada, **la base de datos se reseteará cada vez que el servidor se reinicie**, porque Firebase no guarda archivos locales permanentemente.
Para producción real en Firebase, **DEBES** migrar los datos a Firestore o conectar una BD externa.
