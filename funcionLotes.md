Implementación de Iframe Full Width en Detalle de Lotes + Módulo Flotante de Interés
🎯 Objetivo

Modificar la vista de detalle de cada lote en:

https://referidos-nine.vercel.app/lote/[slug]


Para que:

Se visualice la página original del lote desde goodsco.com.co dentro de un iframe full width.

Se mantenga visible el módulo flotante:

“¿Interesado en este lote?”

El módulo flotante conserve:

Código de referido activo

Botón “Invertir vía WhatsApp”

QR del referido

El iframe no afecte el funcionamiento del tracking de referidos.

🧩 ENLACES DE REFERENCIA
Página actual en la app
https://referidos-nine.vercel.app/lote/baru-beach-condominio

Página original WordPress
https://goodsco.com.co/inmueble/baru-beach-condominio/

🛠 IMPLEMENTACIÓN PASO A PASO
1️⃣ Construcción dinámica del iframe

En la vista:

/lote/[slug]


Debe construirse la URL del iframe dinámicamente:

const wpUrl = `https://goodsco.com.co/inmueble/${slug}/`;

2️⃣ Insertar iframe Full Width

Debe renderizarse dentro del layout principal:

<iframe
  src={wpUrl}
  className="lote-iframe"
  loading="lazy"
  allowFullScreen
/>

3️⃣ Estilos requeridos

El iframe debe:

Ocupar 100% del ancho

Tener altura mínima de 100vh

No tener bordes

Permitir scroll interno

Ejemplo CSS:

.lote-iframe {
  width: 100%;
  height: 100vh;
  border: none;
  display: block;
}

4️⃣ Validación importante (WordPress)

⚠️ Antes de implementar:

WordPress debe permitir ser embebido en iframe.

Verificar que NO tenga:

X-Frame-Options: SAMEORIGIN


Si lo tiene, deberá ajustarse en WordPress:

Revisar .htaccess

Revisar headers del servidor

Permitir embedding desde el dominio:

referidos-nine.vercel.app

5️⃣ Módulo Flotante “¿Interesado en este lote?”

El módulo actual (adjunto en imagen) debe:

Permanecer fuera del iframe

Posicionarse fijo

No depender del contenido interno del iframe

6️⃣ Posicionamiento del módulo

Debe estar:

Fijo a la derecha

Verticalmente centrado

Con z-index superior al iframe

Ejemplo CSS:

.interesado-box {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 360px;
  z-index: 999;
}

7️⃣ Datos que debe conservar el módulo

El módulo debe recibir:

Nombre del lote (slug o título)

ID del lote

Código de referido activo (si existe)

Debe funcionar igual que actualmente:

Botón WhatsApp con mensaje dinámico

QR apuntando a:

https://referidos-nine.vercel.app/r/[codigo]

8️⃣ Comportamiento en Responsive
Desktop

Iframe ocupa todo el ancho

Módulo flotante visible a la derecha

Tablet / Mobile

El módulo debe:

Pasar a posición sticky o inferior

No tapar contenido del iframe

Ajustarse a 100% width

Ejemplo móvil:

@media (max-width: 768px) {
  .interesado-box {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    transform: none;
  }
}

9️⃣ No modificar

No alterar el contenido del WordPress.

No intentar manipular el DOM interno del iframe.

No inyectar scripts dentro del iframe.

No romper el sistema de referidos existente.

🔐 Consideraciones Técnicas Importantes

El iframe es solo visual.

El tracking de referidos ocurre fuera del iframe.

El botón WhatsApp debe usar:

https://wa.me/573216583860


El mensaje debe incluir:

Nombre del lote

ID

Código de referido (si existe)

🚀 Resultado Esperado

Al ingresar a:

/lote/baru-beach-condominio


El usuario debe ver:

La web original de goodsco embebida full width.

El módulo flotante profesional.

Botón funcional.

QR funcional.

Sistema de referido intacto.

📌 Checklist de Validación Final

 El iframe carga correctamente

 No hay bloqueo por headers

 El módulo flota correctamente

 WhatsApp envía mensaje correcto

 QR apunta al link correcto

 Responsive funciona

 No hay errores en consola

🧠 Nota Final

Esta implementación permite:

Mantener WordPress como fuente visual oficial

No duplicar diseño

No rehacer contenido

Mantener sistema de referidos independiente

Escalar fácilmente en el futuro