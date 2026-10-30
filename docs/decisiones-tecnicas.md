# Decisiones técnicas

Decisiones que se apartan del plan o de los valores por defecto de Next, con su motivo y cómo revertirlas. Se agregan al final.

## Cache Components activado, sin `partialPrefetching`

**Estado.** `next.config.ts` tiene `cacheComponents: true` y **no** tiene `partialPrefetching`. El scaffold de `create-next-app` traía `partialPrefetching: true` y se quitó en la tarea 0.9.

**Por qué se quitó.** Con `partialPrefetching` activo, un slug que no estaba en `generateStaticParams` al compilar (un artículo nuevo, o uno inexistente) sirve primero un fallback y empieza a transmitir con código 200. `notFound()` ya llega tarde y `/perspectives/no-existe` respondía 200 con la página de "no encontrada" (un *soft 404*). Sin la opción, esas rutas se renderizan completas antes de responder y `notFound()` da un 404 real.

**Qué se pierde.** Una optimización de navegación: con la opción activa, los enlaces a rutas dinámicas pueden precargar su estructura estática antes del clic. Sin ella, el cambio de página sigue funcionando igual, solo con menos anticipación.

**Cómo volver a activarla (Fase 4 o cuando se necesite)**
1. Agregar `partialPrefetching: true` en `next.config.ts`.
2. Decidir cómo se sirven los slugs que no estaban al compilar. Con la opción activa, `await params` puede ir dentro de `<Suspense>` y se sirve un fallback mientras se renderiza la ruta. El costo es que el estado HTTP queda en 200.
3. Si se necesita 404 real con la opción activa, validar el slug antes de transmitir, por ejemplo en `proxy.ts`, con una comprobación rápida que no traiga el contenido completo. Ver *Status codes* en `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`.
4. Verificar con `curl -s -o /dev/null -w "%{http_code}" /perspectives/no-existe` que sigue dando 404, y que un artículo publicado después del build da 200.

Referencias: `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`, sección *generateStaticParams and dynamicParams*, y la guía *ISR with Cache Components*.

## Sin revalidación por tiempo

**Estado.** `sanityFetch` guarda los resultados con `cacheLife('max')` y solo se invalidan por etiqueta (`article`, `place`) desde el webhook de la tarea 0.11. Es lo que pide el plan.

**Consecuencia.** Un artículo con `publishedAt` en el futuro no aparece cuando llega esa fecha, sino hasta la siguiente invalidación. Se acepta: el contenido se publica a mano y el webhook actúa al publicar.

**Si se llega a necesitar.** Cambiar `cacheLife('max')` por un perfil con `revalidate` en `src/lib/sanity/client.ts`, que es el único lugar donde se define.

## `generateStaticParams` nunca devuelve una lista vacía

**Estado.** Con Cache Components, devolver `[]` rompe el build. Si no hay artículos publicados, `src/app/perspectives/[slug]/page.tsx` prerenderiza el slug `sin-articulos`, que no existe y responde 404.

**Comprobado.** Con el dataset vacío simulado el build pasa, y `/perspectives/sin-articulos` y cualquier otro slug dan 404. Home muestra el texto `home.empty` de `ui-text`. Si algún día un artículo real usa ese slug, funciona igual con normalidad.

## Identificadores de documentos de Sanity sin puntos

En Sanity, un `_id` con punto (`place.mx`, `article.seed-01`) se trata como documento privado y la API pública no lo devuelve. Por eso el seed usa `place-mx` y `article-seed-01`. Los documentos que crean los editores en el Studio llevan un UUID, así que no tienen el problema.

## `atlasCategories` se descartó, vuelve `inAtlas`

Un artículo con `inAtlas` activo ocupa un lugar del atlas en cada una de sus categorías, y es un solo punto. El aviso de cupo cuenta, por categoría, los artículos con `inAtlas` del mismo año.

## El mapa del atlas se versiona en el repo y se calibra con un ajuste empírico

**Dónde vive.** `public/atlas/mapa.png` (1672 por 941 px, fondo transparente, 2.3 MB). `next/image` entrega al navegador una versión optimizada (WebP o AVIF) y del tamaño de la pantalla, así que el peso del original no llega a los visitantes. No se usa un repo aparte: el mapa y su calibración (`src/lib/atlas/map-config.ts`) dependen del archivo exacto, y separarlos permitiría que dejen de coincidir. Si el diseño entrega otro PNG, se reemplaza el archivo, se ajusta el tamaño en `ATLAS_MAP_IMAGE` y se corre `npm run calibrate:atlas`. Los archivos originales del diseño quedan fuera del repo. Cada versión nueva de un binario grande se queda para siempre en el historial de git; conviene no reemplazarlo muchas veces.

**Por qué el ajuste es empírico.** El dibujo es estilizado y no sigue una proyección estándar. Se probaron equirectangular, Miller, Mercator, Gall estereográfica, equivalente cilíndrica, Natural Earth y Robinson, comparando la tierra de cada una con los contornos de Natural Earth 110m. La mejor coincidencia fue de 0.71 (Gall).

**Cómo se calibra (`npm run calibrate:atlas`).** Dos pasos:
1. Un modelo suave (`fitted`, con curvas por latitud y longitud) llega a 0.75 de coincidencia de tierra. Deja errores de hasta 40 px en Norteamérica, Sudamérica y el este de Asia.
2. Una malla de desplazamientos de 16 por 9 celdas corrige lo que el modelo no alcanza. Empuja cada costa real hacia la costa más cercana del PNG, de lo grueso a lo fino y con suavidad (registro por deformación de forma libre). Baja la distancia media a la costa de 10.5 a 3.4 px y el percentil 90 de 22.7 a 4.9 px.

El resultado se escribe en `src/lib/atlas/map-calibration.ts` (generado, no se edita a mano) y `project()` lo aplica.

**Precisión.** Las pruebas de `project.test.ts` miden puntos de costa contra el PNG con un margen del 1.5% del ancho y del alto. Las Islas Cook y otros lugares al oeste de -161° de longitud quedan fuera del dibujo y `project()` los pega al borde. Las islas pequeñas lejos de cualquier costa (Pacífico) quedan solo con la corrección suave de la zona, así que pueden caer algo corridas en el agua.

**Si cambia el PNG.** Reemplazar el archivo, ajustar el tamaño en `ATLAS_MAP_IMAGE` y correr `npm run calibrate:atlas`. Después revisar `/atlas` a ojo.

## Diseño del cliente: tipografías, textos en inglés y piezas pendientes

**Fuentes.** Albra Sans (títulos), Iowan Old Style (texto) y Myriad Pro (navegación, botones y etiquetas) se cargan con `next/font/local` desde `src/app/fonts.ts`; los archivos están en `src/app/fonts/` y alimentan `--font-display`, `--font-body` y `--font-ui`.
- **Albra Sans es una versión TRIAL.** Su licencia de prueba normalmente no permite usarla en producción; hay que comprar la licencia web o pedirle al cliente el archivo con licencia antes de publicar.
- **Iowan Old Style** llegó como `.ttc`, formato que los navegadores no leen. Se extrajeron Roman, Italic y Bold a `.ttf` con fontTools. Tiene licencia de Apple: confirmar que se pueda servir en la web.
- **Myriad Pro** (Adobe) tampoco tiene licencia web garantizada; confirmar con el cliente.
- Dónde va Myriad Pro no estaba en el mockup: la puse en nav, botón del header y etiqueta del selector. Es un cambio de una clase (`font-ui`).

**Idioma.** Los textos del mockup (cabecera, título del Atlas, "Explore by best", "Read more", pie) están en inglés en `ui-text`, como el diseño. El resto de la interfaz sigue en español. Falta confirmar con el cliente si todo el sitio va en inglés; cambiar es editar `ui-text.ts`.

**Piezas que son marcadores.** El logo con las llaves, la brújula, el adorno del pie y la forma de los puntos son SVG simples de `src/components/ui/icons.tsx`. Se reemplazan cuando el cliente entregue sus ilustraciones. Los iconos de redes del pie (Instagram, TikTok, LinkedIn, YouTube; la lista y las direcciones están en `src/content/social.ts`) apuntan a la página principal de cada red hasta que el cliente entregue sus perfiles y confirme cuáles usa. El buscador del mockup no se incluyó porque no hay búsqueda en el alcance.

**Atlas sin scroll.** En pantallas de 64rem o más la página del Atlas mide el alto de la ventana (`body:has(.atlas-page)` en `src/styles/atlas.css`): el panel con rejilla toma el espacio que dejan cabecera, título y pie, y el mapa se ajusta dentro con su proporción usando container queries, así los puntos siguen alineados. En pantallas más chicas el flujo es normal; se revisa en 1.11. La suscripción vive ahora en el pie.

**Tooltip del Atlas (TooltipCard).** La tarjeta flotante viene de Tooltip Card de Aceternity UI y vive en `src/components/ui/TooltipCard.tsx`; usa `motion` (animación de resorte en la altura). Diferencias con el original:
- Sin `clsx`/`tailwind-merge` ni helper `cn`: el proyecto no los usa y el componente solo concatena clases.
- Colores, ancho (`w-tooltip`) y sombra salen de los tokens del proyecto, no de `neutral-*` ni valores arbitrarios (`check:tokens` los prohíbe). El ancho real de la tarjeta se mide en vez de fijarlo en 240 px.
- Se abre también con el foco del teclado, Escape la cierra, y con `prefers-reduced-motion` no hay animación.
- En pantallas táctiles el primer toque abre la tarjeta y el segundo sigue el enlace; el original bloqueaba siempre el clic, lo que habría impedido entrar al artículo.
- Los eventos de ratón se ignoran si el dispositivo no tiene hover, para que el toque no abra y navegue a la vez.
- La tarjeta solo existe en el DOM mientras está abierta (así la miniatura no se descarga antes) y no funciona sin JavaScript; el punto sigue siendo un enlace al artículo, con su descripción para lectores de pantalla en un texto oculto.

**Atlas en móvil.** Abajo de 64rem (`lg`) el mapa se oculta con CSS (`max-lg:hidden`, sin JavaScript, así no hay parpadeo) y se muestra `AtlasMobileList`: chips de región (enlaces que cambian `?region=`) y una tarjeta por caso, con lugar, miniatura, título, descripción, llaves y categorías, igual que el tooltip de escritorio. Sin región en la URL se muestra la primera con casos. Sigue disponible el selector "Explore by best". Pendiente del cliente: el gráfico de cada región (imágenes aparte o recortes del PNG); mientras tanto no se muestra ninguno.

**Móvil según el diseño del cliente.** Cabecera con logo y botón de menú (`MobileMenu`, cliente) que despliega Home, Perspectives y About; título del Atlas con la línea dorada a la derecha y dos selectores apilados, "Explore" (región) y "by best" (categoría), en `AtlasMobileFilters`; lista de tarjetas sobre el panel con rejilla (miniatura, título, descripción, "Read more →") y, al pie, media esfera de la región activa (`AtlasGlobe`).
- **Globos.** Los PNG originales (globo completo, algunos con fondo negro) están en `scripts/data/globes-source/`. `python scripts/prepare-globes.py` (Pillow, numpy, scipy) quita el fondo, recorta el círculo, se queda con la mitad superior y escribe `public/atlas/globes/<region>.webp` (1100x594, unos 130 KB cada uno). Si cambian los originales, se vuelve a correr.
- **Giro.** Al cambiar de región, la textura saliente se desliza y se achica hacia un lado y la entrante llega del otro, dentro del recorte circular; el sentido depende del orden de las regiones. Con `prefers-reduced-motion` el cambio es instantáneo. Las otras cuatro imágenes se precargan para que el giro no espere.
- **Posición del globo.** `position: sticky` al pie de la lista, con un degradado que desvanece las tarjetas: se queda al fondo de la ventana mientras se hace scroll y, al llegar al final, se va con la lista y deja ver el pie.
- **Lo que el mockup no tiene y no puse:** buscador (ícono de lupa), llaves y lugar en las tarjetas. Las tarjetas móviles siguen el mockup al pie de la letra.

## Perspectives y artículo según el diseño del cliente (escritorio)

**Layout.** Igual que el Atlas, en pantallas de 64rem o más la página mide el alto de la ventana (`body:has(.panel-page)` en `src/styles/perspectives.css`) y cada panel se desplaza por su cuenta (`.panel-scroll`) con un desvanecido al pie (`--panel-fade`, hecho con `mask-image`). El relleno inferior deja que el final del contenido salga por encima del desvanecido. Las proporciones de columnas (`--perspectives-columns`, `--article-columns`), el banner (`--article-cover-ratio`) y el ancho de lectura (`--article-measure`) son tokens. Abajo de 64rem el flujo es normal; la versión móvil está pendiente del diseño.

**Destacado por categoría.** `getFeaturedArticle(category?)` usa una sola consulta (`FEATURED_ARTICLE_QUERY`). Sin categoría devuelve el `featured` más reciente (lo que usa Home). Con categoría ordena por `featured desc, publishedAt desc` dentro de ella: el marcado más reciente o, si ninguno lo está, el artículo más reciente de la categoría. El destacado se muestra en todas las páginas y se excluye del listado y del total (`listArticles(filters, excludeId)`), así la paginación cuenta bien. No hay cambio de esquema.

**Nueve artículos por página.** `PERSPECTIVES_PAGE_SIZE = 9`, para que la rejilla de 3 columnas no deje tarjetas huérfanas.

**Una sola enlace por tarjeta.** `ArticleCard` y `FeaturedArticle` estiran el enlace del título sobre toda la tarjeta (`after:absolute after:inset-0`); el "Read more" es decorativo (`aria-hidden`). Así un lector de pantalla oye cada artículo una vez.

**Cuerpo del artículo.** `ArticleBody` usa `@portabletext/react` (dependencia directa nueva). Soporta `normal`, `h2`, `h3`, listas, enlaces (los externos con `rel="noopener noreferrer"`) e imágenes con `alt`. Los tipos de bloque desconocidos se ignoran. El tamaño de las imágenes se lee de la referencia del asset (`parseImageRef`) para reservar espacio sin saltos.

**Idioma.** Los textos de estas páginas y las fechas (`meta.locale = "en"`) van en inglés, como el mockup. Falta confirmar con el cliente el idioma de todo el sitio.

**Piezas que el diseño trae y no están.** Subtítulo en cursiva sobre el banner (no hay campo en Sanity; sería un cambio de esquema, por ejemplo `coverCaption`), autor por artículo (hoy "TWSU Team" fijo en `ui-text`), y buscador y botón "Explore the Atlas" de la cabecera.

## Videos dentro de los artículos

**Qué hay.** El cuerpo del artículo admite videos de YouTube y Vimeo de dos formas, y las dos se dibujan con `VideoEmbed` (un `iframe` con proporción reservada):
- **Bloque "Video" en Studio** (`videoEmbed` en `sanity/schemas/article.ts`): enlace obligatorio, validado con `parseVideoUrl`, y pie opcional. Cambiar el esquema exige volver a desplegar el Studio (`npx sanity deploy`).
- **Párrafo que es solo un enlace** de video: se muestra incrustado sin tocar Studio, así que funciona con artículos ya publicados. Un enlace dentro de una frase se queda como texto (`getStandaloneVideo`).

**Seguridad.** `src/lib/articles/video.ts` solo acepta los dominios de YouTube y Vimeo, con id válido, y arma la dirección del reproductor él mismo; nunca incrusta la URL que escribió el editor. YouTube va por `youtube-nocookie.com`. Un bloque con enlace inválido se ignora en lugar de romper el artículo.

**Pendiente.** No se aceptan archivos de video subidos a Sanity (pesan y Sanity no los transmite bien; la alternativa de pago es Mux). Si el cliente necesita banner de consentimiento de cookies, conviene cargar el reproductor solo al hacer clic.

**Para que aparezca en producción** hacen falta las dos partes: el sitio desplegado con el render y el Studio desplegado con el esquema. Con solo el Studio actualizado, el bloque se guarda pero el sitio no lo muestra.

## Perspectives y artículo en móvil

**Cómo se divide.** Abajo de 64rem (`lg`) no hay paneles con scroll: el flujo es normal y los cambios son con clases responsivas, sin JavaScript. Los paneles solo existen desde `lg` (ver la sección de escritorio).

**Listado.** Fila con el título "Perspectives" (línea dorada a la izquierda) y el selector "Explore by topic" con la etiqueta encima (`stacked` en `CategorySelect`). El selector aparece dos veces en el DOM con `id` distinto, uno por tamaño, igual que en el Atlas; en escritorio el título es solo para lectores de pantalla (`lg:sr-only`). Después el destacado (sin la etiqueta "Latest saving"), una línea dorada y una rejilla de 2 columnas, con tarjetas de tipografía y relleno menores.

**Artículo.** Banner más alto en móvil (`--article-cover-ratio-mobile`, 2.4) y de 3.6 desde `lg`; la portada se pide a 2.4 y en escritorio se recorta con `object-cover`. Después del cuerpo, fila "Share" (Facebook, X, LinkedIn y copiar enlace) que solo se ve en móvil, porque el diseño de escritorio no la tiene; luego línea dorada y "Keep on reading" con 2 lecturas relacionadas en 2 columnas. En escritorio siguen siendo 3 en el panel derecho.

**Compartir.** Los enlaces se arman con `buildShareLinks` (con pruebas) y son enlaces normales, que funcionan sin JavaScript. Solo "copiar enlace" necesita JavaScript (`CopyLinkButton`, usa el portapapeles del navegador). La URL completa sale de `NEXT_PUBLIC_SITE_URL`.

**Pendiente.** El buscador de la cabecera móvil del diseño no se incluyó (no hay búsqueda en el alcance). Los iconos de Facebook y X son trazos simples, marcadores hasta tener los oficiales. Para probar en un navegador de escritorio hay que reducir la ventana: Chrome sin interfaz no baja de unos 500 px.

**Sin pie en móvil.** En Perspectives y en el artículo el pie (con la suscripción) se oculta abajo de 64rem con `body:has(.panel-page) > footer` en `src/styles/perspectives.css`, porque el diseño móvil no lo tiene. En escritorio y en el resto de las páginas sigue. Como la suscripción vive en el pie, estas dos páginas no ofrecen suscribirse en móvil; si el cliente lo quiere, hay que ponerla en otro lugar.
