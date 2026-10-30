# TWSU, Fase 3, About, Join, correo y medición

Instrucciones para construir `/about`, `/join`, la conexión real con la herramienta de correo y la medición, sobre la base de las Fases 0, 1 y 2. Complementa a TWSU-base-del-desarrollo.md; donde este archivo dice algo distinto, manda este archivo.

## Estado

- **Parte A (3.1 a 3.5): en curso.** 3.1 y 3.2 hechas (validación y antispam, con pruebas). Faltan 3.3 (adaptador), 3.4 (medición) y 3.5 (About). Lógica pura y probada, sin diseño y sin proveedor de correo.
- **Parte B (3.6 a 3.8): bloqueada por diseño.** Falta el diseño del cliente de About y de Join (ver bloqueos).
- **Parte C (3.9 a 3.11): bloqueada por datos del cliente.** Proveedor de correo y códigos de medición.

## Objetivo de la fase

Al terminar la Fase 3, `/about` muestra el resumen del proyecto con sus personajes, `/join` envía el formulario de contacto completo, la suscripción del pie y el formulario de Join llegan de verdad a la herramienta de correo, y el tag de Google y los pixels de Meta y TikTok cargan solo si el cliente entregó sus códigos. Se trabaja en tres partes, en este orden:

1. **Parte A, lógica.** Validación, antispam, adaptador de correo y generación de scripts de medición. No espera nada del cliente, salvo que el adaptador se escribe contra una interfaz, no contra un proveedor.
2. **Parte B, diseño.** About y Join sobre los diseños del cliente.
3. **Parte C, conexión real y prueba.** Correo y medición en producción.

## Punto de partida (ya existe)

- `/about` y `/join` como páginas provisionales con título y texto de relleno (`uiText.about`, `uiText.join`).
- `/api/subscribe`: valida con `zod`, campo trampa `website`, tiempo mínimo de 3 s y respuesta genérica. Termina en un `TODO Fase 3`: hoy **no envía nada** al proveedor.
- `SubscribeBar` (cliente) con el campo trampa y `startedAt`, `Input` y `Button` en `src/components/ui/`.
- `serverEnv` con `MAIL_API_KEY`, `MAIL_LIST_ID`, `MAIL_SERVER_PREFIX` y `CONTACT_TO_EMAIL`, todas opcionales. `publicEnv` ya declara `NEXT_PUBLIC_GOOGLE_TAG_ID`, `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, opcionales.
- Pie con la suscripción en el layout (oculto en móvil solo en Perspectives y artículo).
- Footer con enlace de contacto y de privacidad: revisar a dónde apuntan.

## Ajustes al documento base

- `/api/contact` no existe todavía. Recibe nombre, teléfono, empresa y correo (sección 12) y además un mensaje si el diseño lo trae.
- Los correos no se guardan en el hosting: viven en la herramienta de correo. Para el formulario de Join, que es un contacto y no una suscripción, hay que decidir si va a la lista o se envía por correo a `CONTACT_TO_EMAIL` (ver bloqueos).
- Sección 13: sin GA4 ni eventos propios. Solo se cargan los scripts con los códigos del cliente.

## Reglas para todas las tareas

- **Un commit por tarea,** con mensaje `fase-3: <número> <descripción corta>`.
- **Comprobaciones al cerrar cada tarea:** `npm run lint`, `npm run typecheck`, `npm run build` y `npm run test`, sin errores.
- **Reglas de código** de la sección 16: sin `any`, sin colores ni tamaños sueltos, sin llamadas a Sanity fuera de `lib/data` y sin texto dentro de los componentes.
- **Pruebas primero en la Parte A.** Cada función pura trae su `.test.ts` con casos válidos, límites y vacíos.
- **Secretos solo en el servidor.** Ninguna clave de correo llega al cliente ni se escribe en el repo.

---

# Parte A, lógica

## 3.1 Validación de los formularios

**Contexto.** Sección 12.

**Objetivo.** Un solo esquema por formulario, compartido entre el cliente y la ruta de la API, con mensajes que salen de `ui-text`.

**Pasos**
1. Crear `src/lib/forms/schemas.ts` con `subscribeSchema` (correo) y `contactSchema` (nombre, teléfono, empresa, correo y mensaje opcional). Recortar espacios, límites de largo con constantes con nombre, teléfono con formato permisivo.
2. Mover aquí el esquema que hoy vive dentro de `/api/subscribe`.
3. Función `getFieldErrors(error)` que devuelve un mapa campo a clave de mensaje, sin textos escritos en la lógica.
4. Pruebas: correo inválido, vacío, con espacios, demasiado largo, teléfono con y sin prefijo, campos opcionales ausentes.

**Archivos.** `src/lib/forms/schemas.ts` y `.test.ts`.

**Criterio de aceptación.** La ruta de suscripción usa el esquema compartido y sus pruebas pasan.

## 3.2 Antispam

**Contexto.** Sección 12, "campo trampa, tiempo mínimo de envío y límite por IP".

**Objetivo.** Decidir si un envío se descarta, sin que quien lo envía lo sepa.

**Pasos**
1. Crear `src/lib/forms/antispam.ts` con `isSpam({ website, startedAt }, now)` (campo trampa lleno o envío en menos de `MIN_FILL_MS`) y mover `MIN_FILL_MS` a `constants.ts`.
2. Crear `src/lib/forms/rate-limit.ts` con un limitador por clave (IP) con ventana fija, función pura que recibe el estado y el reloj. Constantes `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_MS`.
3. Documentar el límite: en un entorno sin servidor persistente (Vercel) el contador en memoria no es compartido entre instancias. Dejar la interfaz lista para cambiar el almacén sin tocar la lógica.
4. Pruebas: campo trampa, envío rápido, ventana que se reinicia, límite exacto y una IP que no afecta a otra.

**Archivos.** `src/lib/forms/antispam.ts`, `src/lib/forms/rate-limit.ts` y sus `.test.ts`.

**Criterio de aceptación.** Un envío descartado recibe la misma respuesta que uno normal.

## 3.3 Adaptador de correo

**Contexto.** Sección 12 y pendiente "Mailchimp o Brevo".

**Objetivo.** Que el resto del código no sepa qué proveedor se usa.

**Pasos**
1. Definir en `src/lib/mail/types.ts` la interfaz `MailProvider` con `subscribe(email)` y `sendContact(contact)`, y un resultado `{ ok: true } | { ok: false, reason }` sin datos del proveedor.
2. `src/lib/mail/provider.ts` elige el proveedor según las variables presentes; sin ellas devuelve un proveedor que no envía y registra el aviso solo en desarrollo.
3. Implementar el proveedor elegido en `src/lib/mail/<proveedor>.ts` con `fetch`, tiempo máximo de espera y sin reintentos que dupliquen envíos.
4. Respuestas genéricas: un correo que ya existe se trata como éxito.
5. Pruebas con `fetch` simulado: éxito, correo ya registrado, error del proveedor, tiempo agotado, sin configuración.

**Archivos.** `src/lib/mail/` y sus `.test.ts`.

**Criterio de aceptación.** Las pruebas pasan sin red y sin claves reales. **Se escribe cuando el cliente confirme el proveedor**; hasta entonces solo se hace la interfaz y el proveedor vacío.

## 3.4 Scripts de medición

**Contexto.** Sección 13.

**Objetivo.** Generar los scripts de los tres servicios solo con los identificadores válidos.

**Pasos**
1. Crear `src/lib/tracking/scripts.ts` con `buildTrackingScripts(env)` que devuelve la lista de scripts a cargar (`id`, `src` o código en línea) según qué identificadores existen.
2. Validar el formato de cada identificador (Google `G-`/`GT-`/`GTM-`, Meta solo dígitos, TikTok alfanumérico) para que un valor mal pegado no inserte código arbitrario en la página.
3. Sin identificadores, la lista queda vacía.
4. Pruebas: ninguno, uno, los tres, un identificador con caracteres raros que se descarta.

**Archivos.** `src/lib/tracking/scripts.ts` y `.test.ts`.

**Criterio de aceptación.** Un valor con comillas, espacios o etiquetas nunca llega al script.

## 3.5 Contenido de About

**Contexto.** Sección 4: "Resumen, quién qué por qué cómo, personajes".

**Objetivo.** Decidir dónde viven los textos y los personajes, y dejar el modelo listo.

**Pasos**
1. Decidir con el cliente si el contenido se edita en Studio o queda fijo en `ui-text` (ver bloqueos). Valor por defecto propuesto: **Studio**, con un documento único `aboutPage` (resumen y cuatro bloques: quién, qué, por qué, cómo) y una lista de documentos `character` (nombre, rol, foto con `alt`, texto, orden).
2. Si va a Studio: esquema en `sanity/schemas/`, consulta con `defineQuery`, `npm run typegen`, función en `src/lib/data/about.ts` con etiqueta propia y el webhook de revalidación ampliado a ese tipo.
3. Mapper a un tipo de vista y pruebas del mapper (personajes sin foto, orden estable, sin personajes).

**Archivos.** `sanity/schemas/`, `src/lib/data/about.ts`, `src/lib/sanity/queries.ts` y pruebas.

**Criterio de aceptación.** Editar un personaje en Studio se refleja en `/about` sin desplegar.

---

# Parte B, diseño

## 3.6 Página About

Resumen y los cuatro bloques con sus personajes, según el diseño. Escritorio primero y luego móvil, igual que en la Fase 2. Un `h1`, estructura de títulos sin saltos, imágenes con `alt`.

## 3.7 Formulario de Join

Formulario con etiquetas visibles, errores asociados a su campo (`aria-describedby`, `aria-invalid`), mensaje de estado con `role="status"`, botón que se desactiva mientras envía y campo trampa. Debe poder enviarse sin JavaScript si el formulario lo permite (`action` a la ruta con redirección) o, si no, dejar la decisión documentada. Componente reutilizable de campo para no duplicar lo que ya hace `SubscribeBar`.

## 3.8 Ruta `/api/contact`

Valida con `contactSchema`, aplica antispam y límite, llama al adaptador y responde igual en éxito y en descarte. Pruebas de la ruta con el adaptador simulado.

## 3.9 Accesibilidad y revisión de About y Join

Misma lista que la 2.10: teclado, foco, contraste, errores de formulario anunciados, `lang`, un solo `h1`.

---

# Parte C, conexión real y prueba

## 3.10 Correo real y medición en producción

1. Cargar las variables del proveedor en Vercel y probar suscripción y contacto contra una lista de prueba.
2. Cargar los identificadores de medición y confirmar con las herramientas del navegador que cada servicio recibe la visita; sin ellos, que no se cargue nada.
3. Si el cliente pide banner de consentimiento, los scripts no se cargan hasta aceptar (ver bloqueos).

## 3.11 Cierre de fase

- [ ] `/about` muestra el contenido y los personajes, en escritorio y móvil
- [ ] Editar un personaje en Studio se refleja sin desplegar
- [ ] `/join` envía y el contacto llega al destino
- [ ] La suscripción del pie llega a la lista
- [ ] Un envío con el campo trampa lleno o demasiado rápido recibe éxito y no llega a ningún lado
- [ ] Un correo repetido no revela que ya existe
- [ ] Sin claves de correo el sitio no se rompe
- [ ] Con los identificadores, los tres servicios cargan; sin ellos, no hay ningún script de medición
- [ ] Ninguna clave aparece en el código que recibe el navegador
- [ ] `lint`, `typecheck`, `build` y `test` sin errores

## Definición de terminado de la Fase 3

Las casillas de 3.11 marcadas, `docs/decisiones-tecnicas.md` al día y todo en `main` desplegado en Vercel.

---

## Bloqueos y preguntas para el cliente

- [ ] **Diseño de About y de Join.** Bloquea 3.6 y 3.7. Escritorio y móvil.
- [ ] **Herramienta de correo: Mailchimp o Brevo.** Bloquea 3.3 y 3.10. Hace falta cuenta, clave de API e identificador de la lista. Con Mailchimp también el prefijo del servidor.
- [ ] **Destino del formulario de Join.** Valor por defecto: correo a `CONTACT_TO_EMAIL`. La alternativa es agregar el contacto a la lista, que obliga a campos personalizados. Si es por correo, hace falta un servicio de envío (el proveedor elegido o similar).
- [ ] **Contenido y personajes de About.** Textos, fotos con descripción, orden, y si el cliente los editará en Studio (valor por defecto) o quedan fijos.
- [ ] **Códigos de Google, Meta y TikTok.** Bloquean 3.10. Mientras no lleguen, no se carga nada.
- [ ] **Banner de consentimiento de cookies.** Afecta a la medición y a los videos incrustados de YouTube. Hay que decidirlo antes de cargar los pixels en producción.
- [ ] **Texto legal.** A dónde apunta "Privacy" del pie y si Join necesita aviso de privacidad y casilla de aceptación.
- [ ] **Idioma de los textos de About y Join.** Los diseños de Perspectives están en inglés y el resto de `ui-text` en español.
- [ ] **Campos de Join.** Confirmar cuáles son obligatorios y si hay mensaje libre.

## Riesgos a vigilar

- **Límite por IP en Vercel.** El contador en memoria no se comparte entre instancias, así que protege poco. Si el cliente recibe spam real, hace falta un almacén compartido o la protección de la plataforma.
- **Datos personales.** Nombre, teléfono y empresa son datos personales. No se guardan ni se escriben en registros; revisar que los errores no los impriman.
- **Scripts de terceros** pueden afectar la velocidad y el LCP. Cargarlos después de que la página sea interactiva (`next/script`) y medir con Lighthouse.
- **Correo ya registrado.** Cada proveedor responde distinto; el adaptador debe normalizarlo a éxito.
