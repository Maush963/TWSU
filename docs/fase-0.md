# TWSU, Fase 0, base

Instrucciones para dejar la base funcionando antes de construir Home y Atlas. Complementa a TWSU-base-del-desarrollo.md, y donde este archivo dice algo distinto, manda este archivo.

## Objetivo de la fase

Al terminar la Fase 0 existe un sitio desplegado en Hostinger con todas las rutas vacías, un Studio de Sanity con el modelo final, datos de prueba cargados, la capa de datos tipada, los filtros por URL validados y la revalidación por webhook comprobada. Todavía no hay diseño ni componentes visuales elaborados.

## Ajustes al documento base

Estos cambios salen de la revisión del plan y aplican desde ya.

- **Cambio posterior (decidido con el cliente): `atlasCategories` se descarta y vuelve `inAtlas: boolean`.** Un artículo con `inAtlas` ocupa un lugar en cada una de sus `categories` y es un punto; el tooltip enciende sus `categories`. Donde este archivo diga `atlasCategories`, léase `inAtlas` (el aviso de cupo cuenta, por cada categoría del artículo, los artículos con `inAtlas` del mismo año).
- **Atlas por llave.** `inAtlas: boolean` se reemplaza por `atlasCategories: Category[]`, que debe ser un subconjunto de `categories`. Un artículo puede ocupar un lugar en varias llaves. Las 50 menciones son 50 espacios (10 por llave y año), no necesariamente 50 puntos.
- **Un punto es un artículo.** Cada artículo con `atlasCategories` es un punto. En hover y en foco de teclado muestra un tooltip con título, descripción y la miniatura de las 5 llaves. Las llaves encendidas son las de `atlasCategories`, pendiente de confirmar con el cliente.
- **Lugar.** `place` es opcional, pero obligatorio si el artículo tiene `atlasCategories`.
- **Paginación.** `page` aplica solo a Perspectives. El Atlas no pagina.
- **Nombres de tipos.** Los tipos cambian de nombre para no chocar con los componentes.
  - `ArticleCard` pasa a `ArticleSummary`
  - `AtlasPin` pasa a `AtlasPinData`
  - `AtlasFilters` pasa a `AtlasFilterParams`
- **Constantes compartidas.** Viven en `src/lib/constants.ts`, que no importa nada de Next para que Sanity Studio también pueda usarlo.
- **Idioma.** La interfaz va en español y las rutas se quedan en inglés.
- **Orden.** El despliegue de prueba en Hostinger va al inicio de la fase, no al final.
- **Valores por defecto mientras el cliente no diga otra cosa.**
  - Atlas: se muestra el año más reciente que tenga datos.
  - Perspectives: 10 artículos por página.
  - Destacado: es el mismo en Home y en Perspectives. Si hay varios, gana el de `publishedAt` más reciente; si no hay ninguno, se oculta el bloque.
  - Relacionadas: primero los artículos con más categorías en común, luego los más recientes, sin incluir el artículo actual.

## Reglas para todas las tareas

- **Un commit por tarea,** con mensaje `fase-0: <número> <descripción corta>`.
- **Comprobaciones al cerrar cada tarea.** Cada tarea termina con estos tres comandos sin errores: `npm run lint`, `npm run typecheck` y `npm run build`.
- **Pruebas.** Si la tarea tiene pruebas, también se corre `npm run test`.
- **Reglas de código.** Aplican las de la sección 16 del documento base.
  - Sin `any`
  - Sin colores ni tamaños sueltos
  - Sin llamadas a Sanity fuera de `lib/data`
  - Sin texto dentro de los componentes

---

## 0.0 Entorno

**Contexto.** Sección 14 del documento base. La carpeta actual tiene dos problemas.
- `C:\Users\salas` entera es un repo git (`C:\Users\salas\.git`), así que cualquier carpeta debajo queda dentro de ese repo.
- El proyecto está dentro de OneDrive, que bloquea archivos y sincroniza `node_modules` y `.next`.

**Objetivo.** Tener una carpeta de proyecto limpia, fuera de OneDrive y con su propio repo.

**Pasos**
1. Crear `C:\dev\twsu`, fuera de OneDrive.
2. Correr `git init` ahí mismo. Comprobar con `git rev-parse --show-toplevel` que responde `C:/dev/twsu`.
3. Crear el repo en GitHub (privado) y conectarlo como `origin`. La rama principal es `main`.
4. Usar Node 22 LTS y npm.
5. Copiar `TWSU-base-del-desarrollo.md` y este archivo a `docs/`.
6. Revisar aparte qué pasa con `C:\Users\salas\.git`. Probablemente se creó por accidente, pero no se borra sin antes ver qué contiene.

**Archivos.** `docs/TWSU-base-del-desarrollo.md` y `docs/fase-0.md`.

**Criterio de aceptación**
- `git rev-parse --show-toplevel` responde `C:/dev/twsu`.
- El primer commit está en GitHub.

---

## 0.1 Proyecto base

**Contexto.** Secciones 2, 3 y 16.

**Objetivo.** Un proyecto Next.js con TypeScript estricto, Tailwind, lint, pruebas y variables de entorno validadas.

**Pasos**
1. `npx create-next-app@latest .` con TypeScript, ESLint, Tailwind, `src/`, App Router y alias `@/*`.
2. En `tsconfig.json`, `strict: true` y `noUncheckedIndexedAccess: true`.
3. En ESLint, `@typescript-eslint/no-explicit-any` como error.
4. Scripts en `package.json`:
   - `typecheck` corre `tsc --noEmit`
   - `test` corre `vitest run`
5. Instalar `vitest`, `zod` y `server-only`.
6. Crear `.env.example` con todas las variables, sin valores:
   ```
   NEXT_PUBLIC_SITE_URL
   NEXT_PUBLIC_SANITY_PROJECT_ID
   NEXT_PUBLIC_SANITY_DATASET
   SANITY_API_READ_TOKEN
   SANITY_REVALIDATE_SECRET
   MAIL_API_KEY
   MAIL_LIST_ID
   MAIL_SERVER_PREFIX
   CONTACT_TO_EMAIL
   NEXT_PUBLIC_GOOGLE_TAG_ID
   NEXT_PUBLIC_META_PIXEL_ID
   NEXT_PUBLIC_TIKTOK_PIXEL_ID
   ```
   `MAIL_SERVER_PREFIX` solo hace falta si se elige Mailchimp. `CONTACT_TO_EMAIL` es el destino del formulario de Join, por confirmar.
7. En `src/lib/env.ts`, validar con zod en dos esquemas, `serverEnv` y `publicEnv`.
   - Obligatorias en Fase 0: las de Sanity y `NEXT_PUBLIC_SITE_URL`.
   - Opcionales por ahora: las de correo y medición.
   - Si falta una obligatoria, el error dice cuál.
   - `serverEnv` importa `server-only`.
8. `.gitignore` incluye `.env*` excepto `.env.example`.

**Archivos.** `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `.env.example` y `src/lib/env.ts`.

**Criterio de aceptación**
- Los cuatro comandos pasan: `npm run lint`, `npm run typecheck`, `npm run build` y `npm run test` (este último sin pruebas todavía o con una de ejemplo).
- Si se agrega un `any`, el lint falla.

---

## 0.2 Prueba de humo en Hostinger

**Contexto.** Sección 14, "Prueba temprana". Va antes que todo lo demás porque si Hostinger no corre bien Next.js, conviene saberlo hoy.

**Objetivo.** Una página mínima desplegada desde GitHub que demuestra que las variables de entorno se leen en producción.

**Pasos**
1. Crear `src/app/api/health/route.ts`. Responde JSON con `ok: true` y un objeto que dice si cada variable existe, con booleanos. Nunca devuelve valores.
2. En Hostinger, en el plan Web Apps con Node.js:
   - Conectar el repo de GitHub y la rama `main`.
   - Comando de build `npm run build`, comando de inicio `npm run start`.
   - Cargar las variables de entorno. Para esta prueba basta con `NEXT_PUBLIC_SITE_URL` y unas de prueba.
3. Anotar en `docs/hostinger.md`:
   - Versión de Node
   - Dónde se configuran las variables
   - Cuánto tarda un despliegue
   - Si un push a `main` despliega solo

**Archivos.** `src/app/api/health/route.ts` y `docs/hostinger.md`.

**Criterio de aceptación**
- La URL pública carga la página de inicio.
- `/api/health` responde `ok: true` con las variables cargadas marcadas como presentes.
- Un push a `main` se refleja en el sitio.

---

## 0.3 Constantes compartidas

**Contexto.** Sección 5, "Constantes compartidas", con el ajuste de archivo.

**Objetivo.** Una sola fuente para categorías, continentes y límites, que sirva a Next y a Sanity.

**Pasos**
1. Crear `src/lib/constants.ts` con:
   - `CATEGORIES` y `CONTINENTS`, igual que en el documento base
   - `ATLAS_SLOTS_PER_CATEGORY = 10`
   - `PERSPECTIVES_PAGE_SIZE = 10`
   - `RELATED_ARTICLES_LIMIT = 3`
   - `HOME_RECENT_LIMIT = 3`
2. Exportar los tipos `Category` y `Continent`, y los guards `isCategory(value: string): value is Category` y `isContinent(...)`.
3. El archivo no importa nada de `next`, `react` ni `server-only`.

**Archivos.** `src/lib/constants.ts` y `src/lib/constants.test.ts`.

**Criterio de aceptación**
- Hay pruebas de los guards con valores válidos e inválidos.
- El archivo no tiene imports externos.

---

## 0.4 Tokens de diseño

**Contexto.** Sección 8. Tailwind v4 se configura desde CSS, no desde `tailwind.config`.

**Objetivo.** Que todo valor visual salga de variables y que Tailwind las use.

**Pasos**
1. Crear `src/styles/tokens.css` con las variables de la sección 8 y agregar una escala de tipografía temporal (`--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`).
2. En `src/app/globals.css`, importar Tailwind y los tokens. Mapear las variables con `@theme inline` (colores, fuentes, espacio, radio y tipografía) para que existan clases como `bg-bg`, `text-text`, `text-accent` y `rounded`.
3. Crear el script `check:tokens` en `scripts/check-tokens.mjs`.
   - Busca colores hexadecimales, `rgb(`, valores en `px` y clases arbitrarias de Tailwind con corchetes (`w-[37px]`) dentro de `src/app` y `src/components`.
   - Si encuentra algo, falla y dice el archivo y la línea.
4. Agregar `check:tokens` al script `lint` para que corra junto con ESLint.

**Archivos.** `src/styles/tokens.css`, `src/app/globals.css`, `scripts/check-tokens.mjs` y `package.json`.

**Criterio de aceptación**
- Cambiar `--color-accent` en `tokens.css` cambia el color en todo el sitio.
- Poner `#ff0000` en un componente hace fallar `npm run lint`.

---

## 0.5 Textos de interfaz, layout y pie de suscripción

**Contexto.** Secciones 4, 9 y 12. Los textos van en español.

**Objetivo.** El layout general con encabezado, navegación y pie de suscripción en todas las rutas, sin texto escrito dentro de los componentes.

**Pasos**
1. Crear `src/content/ui-text.ts`.
   - Exporta un objeto `as const` agrupado por zona: `nav`, `footer`, `subscribe`, `home`, `atlas`, `perspectives`, `article`, `about`, `join`, `notFound` y `meta`.
   - Incluye los títulos de cada página y el `title` y `description` por defecto del sitio.
2. Crear los componentes en `src/components/layout/`:
   - `Header.tsx`, con el logo como texto temporal y la navegación a Atlas, Perspectives, About y Join
   - `Footer.tsx`
   - `SubscribeBar.tsx`, un formulario de solo correo
   - Los tres van dentro de `layout.tsx`.
3. Crear `src/components/ui/Button.tsx` e `Input.tsx` con props tipadas, usando solo clases de tokens.
4. `SubscribeBar` es un componente cliente que hace POST a `/api/subscribe`.
   - Muestra los estados enviando, éxito y error con textos de `ui-text`.
   - Incluye el campo trampa oculto y el tiempo de inicio del formulario.
5. `src/app/api/subscribe/route.ts` es un stub.
   - Valida el correo con zod y revisa el campo trampa y el tiempo mínimo de 3 segundos.
   - Siempre responde de forma genérica.
   - Todavía no llama a ningún proveedor; deja un `TODO` que apunta a la Fase 3.
6. En `layout.tsx`, poner `lang="es"`, la `metadata` base con `metadataBase` desde `NEXT_PUBLIC_SITE_URL` y un enlace para saltar al contenido.

**Archivos.** `src/content/ui-text.ts`, `src/components/layout/*`, `src/components/ui/*`, `src/app/layout.tsx` y `src/app/api/subscribe/route.ts`.

**Criterio de aceptación**
- El pie aparece en todas las rutas.
- Enviar un correo válido muestra éxito; uno inválido muestra error.
- Llenar el campo trampa devuelve la misma respuesta genérica que un envío normal.
- Una búsqueda de texto en español dentro de `src/components` no encuentra textos de interfaz.

---

## 0.6 Rutas vacías

**Contexto.** Secciones 3 y 4.

**Objetivo.** Todas las rutas existen, con su título y un marcador de contenido.

**Pasos**
1. Crear las páginas:
   - `src/app/page.tsx`
   - `atlas/page.tsx`
   - `perspectives/page.tsx`
   - `perspectives/[slug]/page.tsx`
   - `about/page.tsx`
   - `join/page.tsx`
2. Cada página usa su título de `ui-text` y exporta `metadata` o `generateMetadata`.
3. Crear `src/app/not-found.tsx` con textos de `ui-text`.
4. Por ahora, `perspectives/[slug]` llama a `notFound()`. Se conecta a datos en la tarea 0.9.
5. Atlas y Perspectives reciben `searchParams`. Mientras no exista 0.10, los imprimen como texto de depuración; después se cambia por los parsers.

**Archivos.** Las páginas de `src/app/**/page.tsx` y `src/app/not-found.tsx`.

**Criterio de aceptación**
- Todas las rutas responden 200, excepto `/perspectives/cualquier-cosa`, que responde 404.
- La navegación del encabezado llega a todas las páginas.

---

## 0.7 Sanity, proyecto, modelo y Studio

**Contexto.** Sección 5, con los ajustes de `atlasCategories` y `place`.

**Objetivo.** El Studio desplegado con el modelo final y sus validaciones.

**Pasos**
1. Crear el proyecto en sanity.io con el dataset `production`.
   - El dataset es público (lectura sin token).
   - El token de lectura queda para borradores en el futuro.
2. Instalar `sanity`, `next-sanity` y `@sanity/vision`.
3. Crear en la raíz `sanity.config.ts`, con `structureTool` y `visionTool` y título "TWSU", y `sanity.cli.ts`. El Studio se despliega aparte con `npx sanity deploy`; no se monta dentro de Next.
4. Crear `sanity/schemas/place.ts`.
   - `name` es obligatorio.
   - `countryCode` cumple `/^[A-Z]{2}$/`.
   - `continent` usa `CONTINENTS` como lista cerrada.
   - `lat` va de -90 a 90 y `lng` de -180 a 180.
   - `kind` es `country` o `city`.
   - La vista previa muestra nombre y continente.
5. Crear `sanity/schemas/article.ts` con los campos de la sección 5, con estos cambios:
   - **`categories`**
     - Es un arreglo de strings con `options.list` de `CATEGORIES` y `layout: 'grid'`.
     - Lleva mínimo 1 y no se repiten.
   - **`atlasCategories`**
     - Usa las mismas opciones que `categories`.
     - Con una validación `custom`, cada valor debe estar en `categories`.
   - **Aviso de cupo**
     - Es una validación asíncrona de nivel `warning` sobre `atlasCategories`.
     - Usa `context.getClient` para contar los artículos publicados del mismo `year` con esa llave, sin contar el documento actual.
     - Si alguna llave pasa de `ATLAS_SLOTS_PER_CATEGORY`, el aviso dice cuál.
   - **`place`**
     - Es una referencia a `place` con búsqueda.
     - Una validación `custom` lo vuelve obligatorio si `atlasCategories` tiene elementos.
   - **Campos simples**
     - `excerpt` tiene máximo 200 caracteres.
     - `year` tiene como valor inicial el año actual.
     - `publishedAt` es obligatorio y su valor inicial es ahora.
     - `isSeed` está oculto.
   - **`body`** lleva bloques con estilos normal, h2 y h3, e imágenes con texto alternativo obligatorio.
   - **`cover`** pide `alt` obligatorio.
6. Crear `sanity/schemas/index.ts`, que exporta los dos esquemas.
7. Los editores no crean lugares. En `sanity.config.ts`, filtrar `newDocumentOptions` para quitar `place` de crear documento. Si falta un lugar, lo agrega el equipo con el seed.
8. En sanity.io/manage, en API y CORS origins, agregar `http://localhost:3000`, la URL de Hostinger y la URL del Studio.
9. Desplegar el Studio con `npx sanity deploy` y anotar la URL en `docs/hostinger.md`.

**Archivos.** `sanity.config.ts`, `sanity.cli.ts` y `sanity/schemas/*`.

**Criterio de aceptación**
- El Studio abre en su URL pública.
- Al crear un artículo:
  - Poner en `atlasCategories` una llave que no está en `categories` marca error.
  - Tener `atlasCategories` sin `place` marca error.
  - Un `excerpt` de 201 caracteres marca error.
- No hay botón para crear `place`.

---

## 0.8 Seed con datos de prueba

**Contexto.** Sección 11, con los ajustes del atlas.

**Objetivo.** Datos realistas que ejercitan todos los casos del atlas, los filtros y el destacado, y que se pueden cargar y borrar sin duplicar.

**Pasos**
1. Crear `scripts/data/places.json`.
   - Contiene todos los países: código ISO2, nombre en español, continente de `CONTINENTS` y coordenadas de su capital.
   - Los países transcontinentales (Rusia, Turquía, Egipto) van en el continente que el cliente espere; por defecto, Rusia en Europa, Turquía en Asia y Egipto en África.
   - Se agregan unas 10 ciudades clave con `kind: city`.
   - Antes de cargar, revisar a mano 5 o 6 coordenadas.
2. Crear `scripts/seed.ts`, que corre con `npx sanity exec scripts/seed.ts --with-user-token` para no necesitar un token de escritura en el `.env`.
   - Usa `createOrReplace` con ids fijos: lugares `place.<iso2>` o `place.city-<slug>`, y artículos `article.seed-01` en adelante.
   - Sube unas 5 imágenes de portada de prueba y las reutiliza.
   - Genera 3 o 4 bloques de texto de relleno en `body`.
   - Todos los artículos llevan `isSeed: true`. Los lugares no, porque son datos reales.
3. Distribución de artículos:
   - **Año actual:** exactamente 10 espacios por llave (50 en total). Unos 8 artículos ocupan 2 llaves, así que hay unos 42 puntos. Los puntos se reparten en los 5 continentes, con al menos 2 en el mismo país para probar puntos encimados.
   - **Año anterior:** unos 6 artículos en el atlas, para probar el filtro de año.
   - **Fuera del atlas:** unos 6 artículos sin `atlasCategories`, de los cuales 3 no tienen `place`.
   - **Destacados:** uno con `featured: true` y otro marcado pero con `publishedAt` más antiguo, para probar que gana el más reciente.
   - **Fechas:** `publishedAt` repartidos en varios meses.
4. Crear `scripts/seed-clean.ts`, que borra todos los documentos con `isSeed == true` y las imágenes que suba el seed.
5. Scripts en `package.json`:
   - `seed` corre `sanity exec scripts/seed.ts --with-user-token`
   - `seed:clean` corre la limpieza de la misma forma

**Archivos.** `scripts/seed.ts`, `scripts/seed-clean.ts`, `scripts/data/places.json` y `scripts/data/seed-images/*`.

**Criterio de aceptación**
- Correr `npm run seed` dos veces deja el mismo número de documentos.
- En Vision, `count(*[_type=="article" && "branding" in atlasCategories && year == <año actual>])` da 10, y lo mismo para cada llave.
- `npm run seed:clean` deja 0 artículos y conserva los lugares.

---

## 0.9 Capa de datos

**Contexto.** Secciones 6 y 10, con los nombres de tipos ajustados.

**Objetivo.** Las páginas obtienen todo por funciones tipadas con etiquetas de caché, sin tocar Sanity directo.

**Pasos**
1. En `src/lib/sanity/client.ts`, crear `createClient` de `next-sanity` con `projectId`, `dataset`, `apiVersion` fija (fecha de hoy), `useCdn: false` y `perspective: 'published'`. Exportar un helper `sanityFetch<T>(query, params, tags)`.
   - Llama a `client.fetch` con `next: { tags }`.
   - Por defecto no revalida por tiempo; solo por webhook.
   - Si la versión instalada de Next cambia la API de caché, se ajusta aquí y en ningún otro lugar.
2. En `src/lib/sanity/queries.ts`, poner todas las consultas GROQ con `defineQuery`.
   - Todas filtran `publishedAt <= now()`.
   - Los parámetros opcionales se pasan como `null` y se filtran con `($category == null || $category in categories)`.
3. Configurar Sanity TypeGen (`npx sanity schema extract` y luego `npx sanity typegen generate`), con salida en `src/lib/sanity/sanity.types.ts`, y agregar el script `typegen`.
4. En `src/lib/sanity/types.ts`, definir los tipos de dominio que usa la app y que no dependen de la forma de GROQ: `Article`, `ArticleSummary`, `AtlasPinData`, `ArticleFilterParams`, `AtlasFilterParams` y `Paginated<T>`.
   ```ts
   export interface AtlasPinData {
     id: string
     slug: string
     title: string
     excerpt: string
     placeName: string
     continent: Continent
     categories: Category[]
     atlasCategories: Category[]
     lat: number
     lng: number
     x: number
     y: number
   }

   export interface Paginated<T> {
     items: T[]
     page: number
     totalPages: number
     total: number
   }
   ```
5. Crear `src/lib/data/articles.ts` y `src/lib/data/atlas.ts`.
   - Los dos empiezan con `import 'server-only'`.
   - Implementan las 6 funciones de la sección 6 y además `getAtlasYears(): Promise<number[]>` para el filtro de año.
   - Mapean el resultado de TypeGen al tipo de dominio. Si falta algún dato obligatorio, el registro se descarta en lugar de romper la página.
   - Etiquetas: `article` en todas las consultas y `place` en las que expanden el lugar.
   - Comportamiento de cada función:
     - **`getFeaturedArticle`** devuelve el de `featured` con `publishedAt` más reciente, o `null`.
     - **`getRelatedArticles`** ordena por categorías en común y luego por fecha, y excluye el artículo actual.
     - **`getAtlasPins`** toma como año por defecto el más reciente de `getAtlasYears` y filtra la categoría contra `atlasCategories` y la región contra `place->continent`.
6. Crear `src/lib/atlas/project.ts` con la función `project` de la sección 10 y una `DEFAULT_MAP_CONFIG` equirectangular de mundo completo. La calibración con el PNG real queda para la Fase 1.
7. Crear `src/lib/atlas/project.test.ts` con estos casos para la configuración equirectangular:
   - (0,0) da 50/50
   - Las esquinas dan 0 y 100
   - Mercator es simétrico respecto al ecuador
8. En `next.config.ts`, agregar `images.remotePatterns` para `cdn.sanity.io` y el helper `urlFor` con `@sanity/image-url` en `src/lib/sanity/image.ts`.
9. Conectar las páginas mínimas solo para comprobar que los datos llegan; el diseño es de la Fase 1.
   - Home muestra el título del destacado y 3 recientes.
   - `/perspectives/[slug]` muestra el título o responde 404.

**Archivos.** `src/lib/sanity/*`, `src/lib/data/*`, `src/lib/atlas/project.ts`, `src/lib/atlas/project.test.ts`, `next.config.ts`, `sanity-typegen.json` o la configuración en `sanity.cli.ts`, y `src/app/page.tsx`.

**Criterio de aceptación**
- Nada fuera de `src/lib/data` importa `src/lib/sanity/client`. Se comprueba buscando el texto.
- Home muestra el destacado correcto, que es el más reciente de los dos marcados.
- `/perspectives/<slug-del-seed>` responde 200 y `/perspectives/no-existe` responde 404.
- `getAtlasPins({})` devuelve unos 42 puntos del año actual, y con `category: 'branding'` devuelve 10.
- Las pruebas de `project` pasan.

---

## 0.10 Filtros por URL

**Contexto.** Sección 7, con `page` solo en Perspectives.

**Objetivo.** Leer y escribir filtros desde la URL con lista blanca, para que se puedan compartir y funcionen con renderizado en servidor.

**Pasos**
1. En `src/lib/filters.ts`:
   - `parseAtlasFilters(searchParams)` devuelve `AtlasFilterParams` con `category?`, `region?` y `year?`.
   - `parsePerspectivesFilters(searchParams)` devuelve `ArticleFilterParams` con `category?` y `page`, que vale 1 por defecto.
   - `toSearchParams(filters)` hace lo inverso y omite los valores vacíos o por defecto.
2. Reglas de validación:
   - Un valor inválido se ignora, sin lanzar errores.
   - Si un parámetro viene repetido, se usa el primero.
   - `year` es un entero de 4 dígitos entre 2000 y el año actual más 1.
   - `page` es un entero mayor o igual a 1; si viene mal, vale 1.
   - `category` y `region` se validan con los guards de `constants.ts`.
3. Conectar Atlas y Perspectives para que usen los parsers en lugar de imprimir `searchParams`. Perspectives muestra una lista simple de títulos paginada y Atlas una lista simple de puntos; el mapa es de la Fase 1.
4. Si se pide una página mayor que `totalPages`, se muestra la última o una lista vacía con un texto de `ui-text`, sin error.

**Archivos.** `src/lib/filters.ts`, `src/lib/filters.test.ts`, `src/app/atlas/page.tsx` y `src/app/perspectives/page.tsx`.

**Criterio de aceptación**
- Las pruebas cubren valores válidos, inválidos, vacíos, repetidos y fuera de rango, y pasan.
- `/atlas?category=branding&region=europa` muestra solo esos puntos.
- `/atlas?category=xxx` se comporta igual que `/atlas`.
- `/perspectives?page=2` muestra la segunda página.

---

## 0.11 Webhook y revalidación

**Contexto.** Secciones 6 y 14.

**Objetivo.** Publicar en Sanity actualiza el sitio sin volver a desplegar.

**Pasos**
1. `src/app/api/revalidate/route.ts` verifica la firma del webhook con `parseBody` de `next-sanity/webhook` y `SANITY_REVALIDATE_SECRET`.
   - Si la firma no es válida, responde 401.
   - Si el cuerpo no trae `_type`, responde 400.
   - Si todo está bien, llama a `revalidateTag` con el `_type` (`article` o `place`) y responde con las etiquetas invalidadas.
   - Usa la firma de `revalidateTag` que pida la versión instalada de Next.
2. En sanity.io/manage, crear el webhook:
   - URL `https://<dominio>/api/revalidate`
   - Disparadores create, update y delete
   - Filtro `_type in ["article", "place"]`
   - Proyección `{_type, "slug": slug.current}`
   - Sin borradores
   - El mismo secreto que `SANITY_REVALIDATE_SECRET`
3. Cargar en Hostinger todas las variables de Sanity.

**Archivos.** `src/app/api/revalidate/route.ts`.

**Criterio de aceptación**
- Una llamada sin firma responde 401.
- En el panel del webhook, los intentos aparecen con 200.

---

## 0.12 Prueba de punta a punta

**Contexto.** Sección 14, "Prueba temprana", completa.

**Objetivo.** Confirmar en producción que la base aguanta antes de empezar la Fase 1.

**Checklist**
- [ ] El sitio en Hostinger muestra Home con el destacado y los recientes del seed
- [ ] Al cambiar el título de un artículo en Studio y publicar, el cambio aparece en el sitio en menos de un minuto sin desplegar
- [ ] Al quitar `featured` del destacado, Home pasa al siguiente
- [ ] `/api/health` marca presentes todas las variables obligatorias
- [ ] `/atlas?year=<año anterior>` muestra los puntos de ese año
- [ ] El build en Hostinger no tiene avisos de variables faltantes
- [ ] `docs/hostinger.md` tiene las URLs del sitio y el Studio, cómo se despliega y dónde están las variables

---

## Definición de terminado de la Fase 0

- Todas las tareas de 0.0 a 0.12 están en `main`, con un commit cada una.
- Pasan `lint`, `typecheck`, `build` y `test`.
- El checklist de 0.12 está completo en producción.
- No hay llamadas a Sanity fuera de `lib/data`, ni colores sueltos, ni texto dentro de los componentes.

## Preguntas para el cliente antes de la Fase 1

- [ ] Proyección del PNG del atlas y archivo sin puntos ni textos en alta resolución
- [ ] Gráfico de móvil por región, saber si son imágenes separadas o recortes del mismo PNG
- [ ] En el tooltip, si las llaves encendidas son las del atlas o todas las categorías del artículo
- [ ] Al abrir el atlas, si se ven los 50 espacios o solo una llave
- [ ] Qué significa `year` (edición del atlas o año del caso) y qué año se muestra por defecto
- [ ] Si "Blog" y "Perspectives" son la misma sección
- [ ] Si el cliente quiere editar About y sus personajes desde Sanity
- [ ] Qué países y ciudades necesita, y en qué continente van los transcontinentales
- [ ] Mailchimp o Brevo, y a qué correo llega el formulario de Join
- [ ] Aviso de privacidad, obligatorio en México por pedir correo y teléfono, y quién redacta el texto
- [ ] Si necesita banner de consentimiento de cookies por los pixels
- [ ] Wireframes o estructura de páginas antes de la Fase 1, para no rehacer el layout en la Fase 4
- [ ] Tipografías, colores, y códigos del tag de Google y los pixels
