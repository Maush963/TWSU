# TWSU, Fase 2, Perspectives y artículo

Instrucciones para construir el listado de Perspectives y la página de artículo sobre la base de las Fases 0 y 1. Complementa a TWSU-base-del-desarrollo.md, fase-0.md y fase-1.md; donde este archivo dice algo distinto, manda este archivo.

## Estado

- **Parte A (2.1 a 2.6): hecha.** Con pruebas.
- **Parte B (2.7 a 2.10): hecha**, en escritorio y móvil según el diseño del cliente, con la revisión de accesibilidad (ver `docs/decisiones-tecnicas.md`). No se hizo `loading.tsx`: la página ya usa `Suspense` y prerenderiza en parte.
- **Parte C (2.11): hecha.** Comprobada en producción en Vercel (https://twsu-two.vercel.app) por el cliente: publicar, editar y despublicar en Studio se refleja sin desplegar.
- **Fase 2 cerrada.** Siguen abiertas las preguntas de abajo (subtítulo de portada, autor, cabecera) y la Home, que sigue provisional.

## Objetivo de la fase

Al terminar la Fase 2, `/perspectives` muestra el destacado fijo y el listado paginado con filtro por categoría, `/perspectives/[slug]` muestra el artículo completo con lecturas relacionadas, y publicar o editar en Studio actualiza ambas sin desplegar. Se trabaja en tres partes, en este orden, igual que en la Fase 1:

1. **Parte A, lógica de Perspectives.** Funciones puras y probadas, sin diseño. No espera nada del cliente.
2. **Parte B, diseño de Perspectives y del artículo.** Componentes y estilos sobre esa lógica. Depende de los archivos y decisiones del cliente.
3. **Parte C, prueba de punta a punta.** Comprobación en producción antes de empezar la Fase 3.

## Punto de partida (ya existe)

- `listArticles`, `getFeaturedArticle`, `getArticleBySlug`, `getRelatedArticles` y `getArticleSlugs` en `src/lib/data/articles.ts`, con etiquetas `article` y `place`.
- `parsePerspectivesFilters` y `toSearchParams` en `src/lib/filters.ts` (`category` y `page`; la página 1 no se escribe en la URL).
- Constantes `PERSPECTIVES_PAGE_SIZE = 10` y `RELATED_ARTICLES_LIMIT = 3`.
- Webhook `/api/revalidate` comprobado en la tarea 0.12.
- `CategoryKeys`, `getKeyStates` y los tokens del Atlas, reutilizables para las llaves de cada tarjeta.
- `generateStaticParams` con el slug de respaldo `sin-articulos` y la decisión de no activar `partialPrefetching` (ver `docs/decisiones-tecnicas.md`; `/perspectives/no-existe` debe seguir dando 404 real).
- `uiText.perspectives` y `uiText.article` con los textos de la Fase 0.

## Lo que falta de la Fase 1 y afecta a esta fase

- **`ArticleCard` y `FeaturedArticle` (tarea 1.13) no existen todavía.** `src/components/articles/` no está creado y el Home sigue siendo la página temporal. Perspectives usa las mismas dos piezas, así que se crean una sola vez. Si 1.13 no se ha hecho al llegar a la tarea 2.7, se crean ahí y el Home las reutiliza (queda anotado en el commit).
- **Tarjetas del Home y del listado deben verse igual.** Una variante se resuelve con una prop, no con un componente copiado.

## Ajustes al documento base

Estos cambios aplican desde ya.

- **Destacado sin repetirse.** El destacado va arriba y no aparece también dentro del listado. Se excluye por id en la consulta, así la paginación cuenta bien.
- **Un destacado por categoría (decidido con el cliente).** Sin categoría, el destacado es el marcado `featured` más reciente. Con una categoría elegida, es el marcado `featured` más reciente de esa categoría y, si ninguno lo está, el artículo más reciente de ella, para que el panel nunca quede vacío. Sigue siendo un solo campo `featured`, sin cambio de esquema. Se queda visible en todas las páginas, como panel fijo a la izquierda.
- **Blog y Perspectives son la misma sección.** La ruta es `/perspectives` y no existe `/blog`. Si el cliente pide lo contrario se decide aparte.
- **Filtros como enlaces.** Igual que en el Atlas: cada categoría y cada página son enlaces construidos con `toSearchParams`, sin estado de React. Cambiar de categoría vuelve a la página 1.
- **Diseño de escritorio recibido.** Listado: panel izquierdo con el destacado y panel derecho con el selector "Explore by topic" y una rejilla de 3 columnas; cada panel se desplaza por separado con desvanecido al pie, igual que el Atlas. Artículo: columna de lectura con banner y panel derecho con 3 relacionadas. La versión móvil queda pendiente.
- **Rejilla de 3 columnas.** `PERSPECTIVES_PAGE_SIZE` pasa de 10 a 9 para que no queden huérfanas.
- **Idioma.** Los textos de Perspectives y del artículo van en inglés como el diseño, y las fechas con `meta.locale = "en"`.
- **Contenido del artículo.** El cuerpo trae bloques `normal`, `h2` y `h3`, imágenes con `alt`, y lo que Sanity incluye por defecto en un bloque (negrita, cursiva, enlaces, listas). El render soporta todo eso y nada más.
- **Valores por defecto mientras el cliente no diga otra cosa.**
  - 9 artículos por página (`PERSPECTIVES_PAGE_SIZE`).
  - Relacionadas: 3, primero las de más categorías en común y luego las más recientes, sin el artículo actual. Si no hay coincidencias de categoría igual se completan con las más recientes.
  - Fecha del artículo con el formato del idioma de la interfaz, sin hora.
  - Sin tiempo de lectura, sin autor y sin comentarios: no están en el alcance ni en el modelo de Sanity.

## Reglas para todas las tareas

- **Un commit por tarea,** con mensaje `fase-2: <número> <descripción corta>`.
- **Comprobaciones al cerrar cada tarea:** `npm run lint`, `npm run typecheck`, `npm run build` y `npm run test`, todos sin errores.
- **Reglas de código** de la sección 16 del documento base: sin `any`, sin colores ni tamaños sueltos, sin llamadas a Sanity fuera de `lib/data` y sin texto dentro de los componentes.
- **Pruebas primero en la Parte A.** Cada función pura nueva trae su archivo `.test.ts` con casos válidos, límites y vacíos.
- **Determinismo.** Mismo dato y mismos filtros, misma página. Ningún orden depende del orden de llegada.

---

# Parte A, lógica de Perspectives

Carpeta nueva: `src/lib/perspectives/`. Los componentes solo pintan lo que estas funciones devuelven.

## 2.1 Enlaces del filtro de categoría

**Contexto.** Sección 7 del documento base y "Filtros como enlaces" de esta fase.

**Objetivo.** Calcular, sin diseño, qué categorías existen, cuál está activa y a qué URL lleva cada una.

**Pasos**
1. Crear `src/lib/perspectives/filter-links.ts` con `buildPerspectivesFilterLinks(current: ArticleFilterParams): PerspectivesFilterLinks`.
   - Devuelve `categories` con `{ value, title, href, active }` para cada valor de `CATEGORIES`, y `allHref`, que lleva a `/perspectives`.
   - Elegir una categoría lleva a la página 1: el `href` nunca trae `page`.
   - Elegir de nuevo la categoría activa la quita (alterna).
   - Incluye `hasActiveFilters`.
   - Las URLs se construyen con `toSearchParams`, nunca a mano.
2. Exportar `PERSPECTIVES_PATH = "/perspectives"`, para no repetir la ruta.
3. Pruebas:
   - Sin filtros, ninguna categoría activa y `hasActiveFilters` falso.
   - Estando en la página 3, elegir una categoría genera un enlace sin `page`.
   - Elegir la activa genera un enlace que la quita.
   - Las 5 categorías salen siempre, en el orden de `CATEGORIES`.

**Archivos.** `src/lib/perspectives/filter-links.ts` y `src/lib/perspectives/filter-links.test.ts`.

**Criterio de aceptación**
- Las pruebas pasan.
- Ningún `href` se arma con texto concatenado fuera de `toSearchParams`.

---

## 2.2 Paginación

**Contexto.** Secciones 4 y 7, `page` solo en Perspectives.

**Objetivo.** Calcular los enlaces de anterior, siguiente y números de página, conservando la categoría.

**Pasos**
1. Crear `src/lib/perspectives/pagination.ts` con `buildPagination(category, page, totalPages): PaginationLinks`.
   - `previousHref` y `nextHref`, o `null` en los extremos.
   - `items`: lista de `{ type: "page", page, href, current }` y `{ type: "gap" }` para los saltos.
   - Muestra siempre la primera y la última página, la actual y una vecina a cada lado; el resto se colapsa en `gap`. Los vecinos se definen con una constante con nombre.
   - `page` fuera de rango se acota a `1..totalPages`.
   - Con una sola página, `items` queda vacío (no se pinta paginación).
2. La página 1 apunta a `/perspectives` sin `page`, como hace `toSearchParams`.
3. Pruebas:
   - Una página, `items` vacío y sin anterior ni siguiente.
   - Primera página sin anterior; última sin siguiente.
   - 20 páginas estando en la 10 colapsa con dos `gap`.
   - Conserva `category` en todos los enlaces.
   - `page` mayor al total se acota.

**Archivos.** `src/lib/perspectives/pagination.ts` y `src/lib/perspectives/pagination.test.ts`.

**Criterio de aceptación**
- Las pruebas pasan.
- Ningún enlace repite la página actual como destino de "anterior" o "siguiente".

---

## 2.3 Destacado por categoría en el listado

**Contexto.** Ajustes de esta fase ("Destacado sin repetirse" y "Un destacado por categoría").

**Objetivo.** Que el destacado salga arriba, una sola vez, y que la paginación cuente solo lo que hay en el listado.

**Pasos**
1. En `src/lib/sanity/queries.ts`, agregar a `ARTICLES_PAGE_QUERY` el parámetro `$excludeId` (`($excludeId == null || _id != $excludeId)`), tanto en `items` como en `total`.
2. En `src/lib/data/articles.ts`, `listArticles(filters, excludeId?)` pasa el id a la consulta (`null` si no hay). El resto del comportamiento (acotar la página a la última) no cambia.
3. Regenerar los tipos con `npm run typegen`.
4. `FEATURED_ARTICLE_QUERY` recibe `$category`: sin categoría, el `featured` más reciente; con categoría, ordena por `featured desc, publishedAt desc` dentro de ella. `getFeaturedArticle(category?)` lo expone y Home la sigue llamando sin argumentos.

**Archivos.** `src/lib/sanity/queries.ts`, `src/lib/sanity/sanity.types.ts`, `src/lib/data/articles.ts`.

**Criterio de aceptación**
- Con el seed, el destacado no aparece dentro del listado y cada categoría tiene el suyo.
- El total de páginas no cuenta al destacado.
- Las pruebas pasan y `getRecentArticles` sigue intacta.

---

## 2.4 Modelo de vista de Perspectives

**Contexto.** Secciones 6 y 7.

**Objetivo.** Una sola función que junta lo anterior para que la página solo pinte.

**Pasos**
1. Crear `src/lib/perspectives/view-model.ts` con `buildPerspectivesView(featured, result, filters): PerspectivesView`.
   - `featured`: el que recibe, ya resuelto por categoría.
   - `items`: las tarjetas del listado, en el orden que llegan (ya vienen ordenadas por fecha).
   - `links`: de `buildPerspectivesFilterLinks`.
   - `pagination`: de `buildPagination`, con la página ya acotada que devolvió `listArticles`.
   - `isEmpty`: `true` solo si no hay destacado visible ni tarjetas.
2. La página `src/app/perspectives/page.tsx` pasa de la lista simple de la Fase 0 a llamar a `getFeaturedArticle`, `listArticles` y `buildPerspectivesView`. Mientras no haya diseño sigue imprimiendo títulos, para comprobar la lógica.
3. Pruebas con datos fijos:
   - `isEmpty` con listado vacío y sin destacado; no vacío si solo hay destacado.
   - El destacado se mantiene en la página 2.
   - La paginación usa la página que devolvió el listado, no la pedida.

**Archivos.** `src/lib/perspectives/view-model.ts`, `src/lib/perspectives/view-model.test.ts` y `src/app/perspectives/page.tsx`.

**Criterio de aceptación**
- `/perspectives` muestra el destacado y 10 artículos distintos a él; `/perspectives?category=branding` filtra y `/perspectives?page=99` muestra la última página sin error.
- Las pruebas pasan.

---

## 2.5 Datos de presentación del artículo

**Contexto.** Sección 4 (`/perspectives/[slug]`).

**Objetivo.** Preparar lo que la página de artículo necesita sin meter lógica en el componente.

**Pasos**
1. Crear `src/lib/articles/format.ts`:
   - `formatArticleDate(isoDate: string, locale: string): string`, con `Intl.DateTimeFormat`, formato largo, sin hora y con zona UTC para que no cambie de día según el servidor.
   - Una fecha inválida devuelve cadena vacía, no rompe la página.
2. Crear `src/lib/articles/categories.ts` con `getCategoryTitles(categories): string[]`, en el orden de `CATEGORIES` y sin repetir, para el pie del artículo y las tarjetas. Los títulos salen de `CATEGORIES`.
3. Agregar `locale` a `uiText.meta` (el idioma de las fechas).
4. Pruebas: fechas en el límite de medianoche UTC, fecha inválida, categorías desordenadas y repetidas.

**Archivos.** `src/lib/articles/format.ts`, `src/lib/articles/format.test.ts`, `src/lib/articles/categories.ts`, `src/lib/articles/categories.test.ts` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- Las pruebas pasan.
- Una misma fecha se ve igual en local y en producción.

---

## 2.6 Metadatos del artículo

**Contexto.** `generateMetadata` de `/perspectives/[slug]`, que hoy solo trae título y descripción.

**Objetivo.** Que compartir un artículo muestre su portada y su resumen.

**Pasos**
1. Crear `src/lib/articles/metadata.ts` con `buildArticleMetadata(article, imageUrl): Metadata`: título, descripción, `openGraph` (tipo `article`, `publishedTime`, imagen) y `alternates.canonical`.
   - `imageUrl` se recibe ya resuelto con `urlFor`, así la función sigue pura.
   - Si el `excerpt` está vacío, no se pone descripción propia y vale la del sitio.
2. Usarla en `generateMetadata`. Si el artículo no existe devuelve `{}` y la página responde 404, como hoy.
3. Pruebas: con y sin `excerpt`, la URL canónica usa el slug.

**Archivos.** `src/lib/articles/metadata.ts`, `src/lib/articles/metadata.test.ts` y `src/app/perspectives/[slug]/page.tsx`.

**Criterio de aceptación**
- Las pruebas pasan.
- `/perspectives/no-existe` sigue dando 404 real.

---

# Parte B, diseño de Perspectives y del artículo

Antes de empezar la Parte B deben estar listos los pendientes de diseño del cliente (ver "Bloqueos"). Mientras tanto se construye con los tokens actuales; cambiar el diseño después solo debe tocar `tokens.css` y los estilos de cada componente.

## 2.7 Tarjetas de artículo

**Contexto.** Tarea 1.13 de la Fase 1 (si ya existen, solo se ajustan).

**Objetivo.** Las dos piezas que comparten Home y Perspectives.

**Pasos**
1. Crear `src/components/articles/ArticleCard.tsx`: portada con `next/image` y `urlFor`, título, `excerpt`, llaves con `CategoryKeys` y enlace a `/perspectives/<slug>`.
2. Crear `src/components/articles/FeaturedArticle.tsx`: versión grande, con `priority` en la portada.
3. `alt` de la portada tomado del campo de Sanity y `sizes` según el ancho que ocupa en cada rejilla.
4. Los textos van en `uiText`.

**Archivos.** `src/components/articles/ArticleCard.tsx`, `src/components/articles/FeaturedArticle.tsx` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- Ninguna imagen sin `alt`.
- Se usan igual en Home y en Perspectives.

---

## 2.8 Listado, filtro y paginación

**Contexto.** Sección 4 y 2.1 a 2.4.

**Objetivo.** Cambiar la lista temporal por el diseño final de `/perspectives`.

**Pasos**
1. Crear `src/components/articles/CategoryFilter.tsx`, que recibe `links` de `buildPerspectivesFilterLinks` y no calcula nada.
   - Lista de enlaces, "Todas" más una por categoría.
   - La opción activa lleva `aria-current="true"`.
2. Crear `src/components/articles/Pagination.tsx`, que recibe el resultado de `buildPagination`.
   - `<nav>` con `aria-label` de `ui-text`, la página actual con `aria-current="page"` y los saltos como texto, no como enlace.
3. En `src/app/perspectives/page.tsx`: destacado arriba, rejilla de 2 columnas y paginación al pie.
4. Estado vacío con texto de `ui-text` y enlace para quitar el filtro, en lugar de una lista en blanco.
5. `loading.tsx` en `src/app/perspectives/` que conserve el alto aproximado del listado, para evitar saltos de diseño.
6. Tokens nuevos en `tokens.css` solo si hacen falta (espacio de la rejilla, estilo del filtro activo).

**Archivos.** `src/components/articles/CategoryFilter.tsx`, `src/components/articles/Pagination.tsx`, `src/app/perspectives/page.tsx`, `src/app/perspectives/loading.tsx` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- Cada clic cambia la URL y el listado, y la URL compartida reproduce el mismo estado.
- Funciona sin JavaScript.
- `/perspectives?category=xxx` se ve igual que `/perspectives`.
- Con el dataset vacío, `/perspectives` responde 200 con el texto de estado vacío.

---

## 2.9 Página de artículo

**Contexto.** Sección 4 y 2.5.

**Objetivo.** El artículo completo con portada, texto y lecturas relacionadas.

**Pasos**
1. Instalar `@portabletext/react` (hoy solo está como dependencia indirecta de Sanity; se agrega a `package.json`).
2. Crear `src/components/articles/ArticleBody.tsx`, que traduce el `body` a HTML con tokens.
   - Soporta `normal`, `h2`, `h3`, negrita, cursiva, enlaces, listas e imágenes con `alt` obligatorio.
   - Los enlaces externos llevan `rel="noopener noreferrer"`.
   - Un tipo de bloque desconocido se ignora, no rompe la página.
   - Las imágenes del cuerpo usan `next/image` con `urlFor`, ancho responsivo y sin `priority`.
3. Crear `src/components/articles/ArticleHeader.tsx`: portada con `priority`, título, lugar, fecha (`formatArticleDate`) y categorías (`getCategoryTitles` y `CategoryKeys`).
4. Crear `src/components/articles/RelatedArticles.tsx`, con `ArticleCard` y el título de `uiText.article.related`. Si no hay relacionadas, la sección no se pinta.
5. Montar todo en `src/app/perspectives/[slug]/page.tsx` y usar `buildArticleMetadata`.
6. Ancho de lectura limitado por un token, no por un valor suelto.
7. Enlace de regreso al listado, con texto de `ui-text`.

**Archivos.** `package.json`, `src/components/articles/ArticleBody.tsx`, `src/components/articles/ArticleHeader.tsx`, `src/components/articles/RelatedArticles.tsx`, `src/app/perspectives/[slug]/page.tsx` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- Un artículo del seed muestra portada, cuerpo y 3 relacionadas, y ninguna es el mismo artículo.
- `/perspectives/no-existe` da 404 real y `/perspectives/<slug-del-seed>` da 200.
- El encabezado del artículo es el único `h1`; el cuerpo arranca en `h2`.
- Sin JavaScript todo el contenido se ve.

---

## 2.10 Accesibilidad y revisión de Perspectives

**Contexto.** Sección 16, componentes accesibles.

**Checklist**
- [x] Todo se puede usar solo con teclado y el foco siempre se ve
- [x] El contraste del texto, los enlaces del cuerpo y el filtro activo cumple AA con los tokens
- [x] La categoría activa y la página actual no dependen solo del color
- [x] Todas las imágenes tienen `alt`, también las del cuerpo
- [x] Jerarquía de títulos correcta: un `h1`, luego `h2` y `h3` sin saltos
- [x] Enlaces con nombre claro (la tarjeta se lee por el título, no por "leer más" repetido)
- [x] `prefers-reduced-motion` desactiva las animaciones
- [x] Sin JavaScript, el listado, el filtro, la paginación y el artículo siguen funcionando
- [x] No hay textos de interfaz dentro de los componentes
- [x] Probado en un ancho de móvil y escritorio (tablet usa el diseño de móvil por debajo de 64rem)

---

# Parte C, prueba de punta a punta

## 2.11 Actualización automática y cierre de fase

**Contexto.** Sección 14, "Prueba temprana", y la tarea 0.11.

**Objetivo.** Confirmar en producción que Perspectives y el artículo aguantan antes de empezar la Fase 3.

**Checklist**
- [x] `/perspectives` muestra el destacado y 10 artículos; la página 2 no repite el destacado
- [x] `/perspectives?category=branding` filtra, y cambiar de categoría vuelve a la página 1
- [x] `/perspectives?page=99` y `?category=xxx` no rompen la página
- [x] Cada tarjeta abre su artículo, que muestra portada, texto y 3 relacionadas
- [x] Publicar un artículo nuevo en Studio hace que aparezca en el listado en menos de un minuto, sin desplegar
- [x] Ese artículo nuevo, publicado después del último build, abre con 200 en `/perspectives/<slug>`
- [x] Editar el título o el texto de un artículo publicado se refleja en el listado y en su página, sin desplegar
- [x] Quitar `featured` cambia el destacado de Perspectives y de Home
- [x] Despublicar un artículo hace que desaparezca del listado, y su URL da 404
- [x] Un artículo con `publishedAt` futuro no aparece (y se confirma la limitación de `docs/decisiones-tecnicas.md`: aparece hasta la siguiente invalidación)
- [x] `/perspectives/no-existe` da 404 real (`curl -s -o /dev/null -w "%{http_code}"`)
- [x] Compartir un artículo muestra su portada y resumen
- [x] Lighthouse de `/perspectives` y de un artículo sin problemas graves de accesibilidad y con un LCP razonable
- [x] El build no tiene avisos y la lógica nueva de `lib/perspectives` y `lib/articles` tiene pruebas

---

## Definición de terminado de la Fase 2

- Todas las tareas de 2.1 a 2.11 están en `main`, con un commit cada una.
- Pasan `lint`, `typecheck`, `build` y `test`.
- La lógica (enlaces de filtro, paginación, destacado, modelo de vista, formato y metadatos) está probada y no depende de componentes.
- Los checklists de 2.10 y 2.11 están completos.
- No hay llamadas a Sanity fuera de `lib/data`, ni colores sueltos, ni texto dentro de los componentes.

## Bloqueos y preguntas para el cliente

Cada una indica qué tarea frena. La Parte A avanza sin ellas.

- [ ] **Wireframes o diseño de Perspectives y del artículo.** Bloquea 2.7, 2.8 y 2.9. El mockup entregado cubre Atlas y Home.
- [ ] **Si "Blog" y "Perspectives" son la misma sección.** Valor por defecto: sí, una sola en `/perspectives`. Afecta la navegación y las rutas.
- [ ] **Subtítulo del banner del artículo** (el texto en cursiva sobre la portada en el diseño). No hay campo en Sanity; agregarlo, por ejemplo `coverCaption`, es un cambio de esquema. Hoy no se muestra.
- [ ] **Autor del artículo.** El diseño dice "TWSU Team"; hoy es un texto fijo en `ui-text`. Si varía por artículo, hace falta un campo.
- [ ] **Cabecera del diseño:** buscador y botón "Explore the Atlas". El Header actual no los lleva; el buscador no está en el alcance.
- [ ] **Cuáles son las lecturas relacionadas** (misma categoría, mismo lugar o las más recientes). Valor por defecto: las de más categorías en común. Afecta 2.9.
- [ ] **Si el artículo lleva autor, tiempo de lectura o botón de compartir.** No están en el modelo ni en el alcance; agregarlos cambia el esquema de Sanity. Afecta 2.9.
- [ ] **Qué estilos de texto usará el editor** (citas, listas, tablas, videos incrustados). Hoy el cuerpo solo admite `normal`, `h2`, `h3` e imágenes. Afecta 2.9.
- [ ] **Idioma del texto de la interfaz de Perspectives.** El mockup está en inglés; el resto de `ui-text` sigue en español. Afecta 2.5, 2.7 y 2.8.
- [ ] **Tipografías de lectura y licencias** (ver la nota sobre Albra Sans, Iowan Old Style y Myriad Pro en `docs/decisiones-tecnicas.md`). Afecta 2.9.

## Riesgos a vigilar

- **Slugs publicados después del build.** Con Cache Components y sin `partialPrefetching`, un artículo nuevo debe dar 200 y uno inexistente 404. Es lo primero que se prueba en 2.11, no al final.
- **Paginación con exclusión del destacado.** Si el total no descuenta al destacado, la última página puede salir vacía o repetida. Lo cubre 2.3 y se revisa con el seed (el peor caso es un total múltiplo exacto de 10).
- **Cuerpo con contenido que el render no conoce.** Un editor puede pegar algo que el esquema no esperaba. 2.9 debe ignorar lo desconocido en lugar de romper el artículo.
- **Imágenes del cuerpo.** Sin dimensiones ni `alt` pueden dar saltos de diseño o romper accesibilidad; el esquema ya exige `alt`, el componente debe exigirlo también.
- **Cambiar el diseño tarde.** Se mitiga con tokens y con la separación entre `lib/perspectives`, `lib/articles` y los componentes.
