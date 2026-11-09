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

**Fuentes.** Albra Sans (títulos) e Iowan Old Style, versión Bitstream (texto, navegación, botones y etiquetas; el mockup del atlas usa Iowan en todo lo que no es título) se cargan con `next/font/local` desde `src/app/fonts.ts`; los archivos están en `src/app/fonts/` y alimentan `--font-display`, `--font-body` y `--font-ui`.
- **Albra Sans es una versión TRIAL.** Su licencia de prueba normalmente no permite usarla en producción; hay que comprar la licencia web o pedirle al cliente el archivo con licencia antes de publicar.
- **Iowan Old Style** es la versión Bitstream (`.ttf` Roman, Italic, Bold, Bold Italic, Black y Black Italic). Sustituyó a las extraídas del `.ttc` de Apple, que se veían con "cuernos" en los remates al reducir el zoom. Confirmar que la licencia permita servirla en la web.
- Myriad Pro se quitó: no aparece en el mockup. `--font-ui` ahora apunta a Iowan.

**Idioma.** Los textos del mockup (cabecera, título del Atlas, "Explore by best", "Read more", pie) están en inglés en `ui-text`, como el diseño. El resto de la interfaz sigue en español. Falta confirmar con el cliente si todo el sitio va en inglés; cambiar es editar `ui-text.ts`.

**Piezas que son marcadores.** El logo con las llaves, la brújula, el adorno del pie y la forma de los puntos son SVG simples de `src/components/ui/icons.tsx`. Se reemplazan cuando el cliente entregue sus ilustraciones. Los iconos de redes del pie (Instagram, TikTok y Email; la lista y las direcciones están en `src/content/social.ts`) apuntan a la página principal de cada red hasta que el cliente entregue sus perfiles y confirme cuáles usa. LinkedIn y YouTube se quitaron del pie por petición del cliente. El icono de Email lleva al formulario `/join` hasta que se entregue la dirección; entonces pasa a `mailto:`. El buscador del mockup no se incluyó porque no hay búsqueda en el alcance.

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

## Accesibilidad de Perspectives y el artículo (2.10)

- Foco visible global en `globals.css` (`:focus-visible` con el color de acento); las tarjetas siguen con su propio contorno por `focus-within`.
- `prefers-reduced-motion: reduce` apaga transiciones y animaciones CSS en todo el sitio; las animaciones de Atlas ya lo respetaban.
- Las dos páginas llevan `lang` según `uiText.meta.locale` (inglés), porque su texto de interfaz está en inglés y el resto del sitio sigue en español.
- El encabezado "Keep on reading" de las lecturas relacionadas queda solo para lectores de pantalla en escritorio (`lg:sr-only`), para que el `aside` tenga nombre y la jerarquía `h2` a `h3` no se rompa.
- Contrastes medidos con los tokens: texto 14.2, acento 12.4, texto atenuado 4.7 (AA). El dorado (1.65) solo se usa en bordes, nunca en texto.
- Sin JavaScript: el filtro es un formulario GET con botón dentro de `noscript`, y la paginación y las tarjetas son enlaces.

## Formularios y antispam (3.1 y 3.2)

- Los esquemas de `src/lib/forms/schemas.ts` devuelven **claves** de error (`required`, `invalid`, `tooLong`), no textos. Los textos saldrán de `ui-text` cuando exista el formulario de Join.
- El contacto pide nombre, teléfono, empresa y correo; el mensaje es opcional. Todos los largos máximos y el mínimo de dígitos del teléfono están en `constants.ts`.
- `/api/subscribe` usa el esquema compartido, el antispam y el límite por IP. Un envío descartado por campo trampa o por rapidez responde igual que uno normal; uno que pasa el límite responde 429, que no revela nada sobre el correo.
- Límite por IP: 5 intentos cada 10 minutos, en memoria de cada instancia. En Vercel las instancias no comparten el contador, así que frena abusos simples pero no un ataque repartido. El almacén se puede cambiar sin tocar `checkRateLimit`.
- La IP sale de `x-forwarded-for` (primer valor). Sin cabecera, todos los envíos comparten la clave `unknown`.

## Medición (3.4)

- `buildTrackingScripts` (`src/lib/tracking/scripts.ts`) recibe los tres identificadores y devuelve los scripts a cargar. Cada identificador se valida con un formato estricto (Google `G-`, `GT-`, `AW-` o `GTM-`; Meta solo dígitos; TikTok mayúsculas y números). Uno que no coincide se descarta, así que un valor mal pegado o con comillas nunca entra en el código de la página.
- Un identificador `GTM-` carga Tag Manager; los demás de Google cargan `gtag.js`. Meta y TikTok usan el fragmento oficial con `PageView` y `page`. No hay eventos propios (sección 13).
- `Tracking` (en el layout) los pinta con `next/script` y `afterInteractive`. Sin identificadores no pinta nada, así que hoy el sitio no carga ningún script de medición.
- Comprobado con identificadores de prueba: aparecen en el HTML los scripts de Google y de Meta, y sin variables no aparece ninguno.
- **Antes de cargar los códigos reales en producción hay que decidir el banner de consentimiento de cookies.** Hoy los scripts se cargan siempre que existan los identificadores.

## Página About (3.6)

- **Estructura.** `AboutIntro` (hero y los bloques Who, What, Why y How, con los mismos textos y estilos de la Home) y `CouncilOfFive` (cinco personajes sobre un fondo de cielo). En escritorio la página mide el alto de la ventana y el contenido se desplaza dentro, con el pie siempre a la vista, como en Perspectives. `panel-page-footer` hace que About conserve el pie en móvil, a diferencia de Perspectives y el artículo.
- **Imágenes.** Los originales (PNG de unos 2 MB cada uno) están en `scripts/data/about-source/`, fuera del repo (`.gitignore`). `npm run prepare:about` recorta cada personaje a busto (640 por 600, la proporción de la tarjeta) y los convierte a WebP en `public/about/` (de 24 a 109 KB cada uno). El encuadre de cada uno está en el script. `retrato-mediterraneo.png` (los cinco juntos) quedó sin usar.
- **Contenido fijo.** Nombre, categoría, texto e imagen de cada personaje viven en `src/content/characters.ts`; se pasan a Studio si se decide así en 3.5. El texto de Camille se copió tal cual del diseño ("Trends never stands still"), con el error de concordancia. Los `alt` están en inglés porque la página declara `lang="en"`.
- **Cabecera y Home.** El hero y los cuatro bloques de About son los mismos que construyó Sebastián para la Home; `AboutIntro` los repite en lugar de compartirlos para no tocar su archivo. Si la Home cambia de diseño, no hay que desarmar nada.
- **Móvil.** Abajo de 64rem sigue el diseño del cliente, solo con CSS (`about.css`) y sin JavaScript: banda con el título "About" (`h1`, línea dorada a la izquierda; el hero pasa a `h2`), imagen del hero a todo el ancho en su propia fila (`--about-hero-mobile-ratio`, 2.36, recortada con `object-fit: cover` y el mismo `--about-hero-focus-y`), "We explore" y su texto debajo de la imagen, y los bloques Who, What, Why y How con sangría (`.about-values`). Flujo normal con el pie visible. La banda y el desvanecido no existen desde `lg`.
- **Council of Five en móvil.** Abajo de 64rem el título y el subtítulo van centrados y los personajes en una columna (antes 2). Cada tarjeta (`.about-card`, en `about.css`) es una rejilla de dos columnas: imagen a la izquierda (`--about-card-mobile-image-width`, 47%, alto igual al del texto de la tarjeta, recortada con `object-fit: cover` anclada al 15% de arriba, para no acercar tanto los rostros) y a la derecha nombre con llave, línea dorada, categoría y texto (`.about-card-body`). Desde `lg` el cuerpo usa `display: contents` y la tarjeta vuelve a ser la columna de siempre, 5 por fila. El WebP sigue siendo el recorte de 640 por 600, así que en móvil se pierde algo de los lados. En móvil los títulos (Who, What, Why, How y los nombres) son `text-2xl` y `text-xl`, y la llave mide `w-12` (`w-16` desde `lg`) con el nombre en `min-w-0`, para que la llave nunca se corte. El pie en móvil (`Footer.tsx`, compartido con las demás páginas) se apila y centra: suscripción, enlaces y redes con `gap-6`; desde `lg` queda en una fila como antes.
- **Zoom del hero en móvil.** La imagen se acerca con `transform: scale(var(--about-hero-mobile-zoom))` (1.2) con origen arriba, dentro del contenedor con `overflow: hidden`, para que se recorte por abajo y por los lados y los personajes llenen más el cuadro.
- **Llaves alineadas al texto.** Cada WebP de llave trae un margen transparente distinto arriba (de 5 a 15 de 640 px), así que con el mismo margen superior unas quedaban más abajo que otras. `KEY_IMAGES` guarda `inkTop` (la primera fila con dibujo, medida con sharp) y `.about-key` lo compensa con `margin-top`, de modo que el borde superior del dibujo cae siempre a `--about-key-top-offset` (0.25rem) del borde del bloque del nombre. Si se regeneran las llaves hay que volver a medir `inkTop`.
- **Espacio entre bloques en móvil.** De "We explore" a "Who" hay 6rem (2rem bajo el texto del hero y 4rem sobre los valores); de "How" a "The Council of Five" es lo mismo: los valores traen 4rem abajo y el consejo solo 2rem arriba (`.about-council { padding-top: var(--space-8) }` abajo de `lg`).
- **Desvanecido en móvil.** `.about-mobile-fade` es el último hijo de `main`: `position: sticky; bottom: 0` con margen negativo del mismo alto (`--about-mobile-fade`, 7rem) y un degradado de transparente a `--color-bg`. Mientras se hace scroll queda pegado al borde inferior de la ventana y, al llegar al final de `main`, se suelta y deja ver el pie. Es decorativo (`aria-hidden`, `pointer-events: none`). Como el degradado termina en `--color-bg` y el bloque de valores usa `surface`, hay una diferencia mínima de tono (`#f5eee6` contra `#f6f1eb`). La banda del título también usa `surface`, casi igual al fondo, así que no tiene el contraste marcado del mockup; si el cliente lo quiere, hay que oscurecer ese color.
- **Diferencia con el diseño.** El mockup muestra el contenido desvaneciéndose también bajo la cabecera al desplazar; aquí solo hay desvanecido al pie, como en las otras páginas con paneles.
- **Fondo del consejo.** La imagen va ampliada (`scale-125`, anclada abajo) y de borde a borde, y entra con una máscara de seis pasos (`.about-council-bg` en `about.css`) en lugar de un solo degradado, para que no haya corte con el bloque de arriba. La sección tiene el color `surface` del bloque anterior. El desplazamiento termina donde termina el fondo: `about-scroll` quita el relleno inferior del panel, y el relleno propio de la sección (6rem) queda por encima del desvanecido del pie.
- **Hero de About en escritorio.** La imagen de los personajes cubre todo el ancho del hero (`object-fit: cover`) y se recorta por abajo, como en el diseño: se ven de la cabeza a la cintura. El alto sigue al ancho (`--about-hero-ratio`, 4.06, el de la referencia) con la Home como mínimo (`--home-hero-height`), y el encuadre vertical sale de `--about-hero-focus-y` (22%). Solo aplica desde `lg`; en móvil sigue la imagen contenida de la Home. La Home no cambia.
- **Imagen del hero.** Vive en `public/about/hero-personajes.webp` (103 KB, antes un PNG de 1.6 MB en `public/home/`), con las demás imágenes de About. La usan About y la Home (se cambió su ruta en `src/app/page.tsx`, sin tocar nada más). El PNG original quedó en `scripts/data/about-source/` y `npm run prepare:about` genera el WebP.

## Atlas con panel de detalle y cabecera simplificada

- **Panel en lugar de tooltip.** En escritorio el caso ya no sale en una tarjeta flotante: vive en un panel fijo a la derecha del mapa (`AtlasPanel`), con lugar y coordenadas (`formatCoordinates`), título, portada, extracto, "Read more" y las llaves de categoría, como en el diseño. Se eliminaron `TooltipCard` y `AtlasTooltip` y los tokens `--atlas-tooltip-width` y `--atlas-thumb-size`; se agregó `--atlas-panel-width` (26rem). La dependencia `motion` sigue porque la usa `AtlasGlobe`.
- **Punto seleccionado.** `AtlasMap` pasó a ser componente de cliente y guarda el id seleccionado; arranca con el primer punto, y si un filtro lo quita vuelve al primero. Cada punto es ahora un `button` (antes un enlace al artículo) con `aria-pressed`: seleccionar y leer son dos acciones, y el enlace al artículo queda en "Read more". El seleccionado crece, lleva el borde en color de acento y un anillo que pulsa (`animate-ping`; `prefers-reduced-motion` ya apaga las animaciones). El panel es una región `aria-live="polite"` para anunciar el cambio.
- **Móvil sin cambios.** El mapa sigue oculto abajo de 64rem; la lista de casos y el globo no se tocaron.
- **Sin subtítulo.** El diseño muestra una frase bajo el título ("Mexican luxury at its best"). Sanity no tiene ese campo, así que no se muestra; haría falta un cambio de esquema (por ejemplo `tagline`). La línea superior usa `placeName` más las coordenadas de `lat` y `lng`.
- **Cabecera.** Se quitaron el buscador y el botón "Explore the Atlas", en escritorio y en el menú móvil, y las claves `nav.search` y `nav.exploreAtlas` de `ui-text`. Quedan logo y los tres enlaces, alineados a la izquierda tras el logo (más grande y con llaves más altas desde `lg`), como en el diseño. Esto cierra la pendiente "buscador y botón Explore the Atlas" de la cabecera.

## Imágenes de marca, pin y rosa de los vientos

- **Organización.** Los PNG del cliente (logo, 5 llaves, divisor con borla y rosa de los vientos) están en `scripts/data/brand-source/` con nombre propio, y `npm run prepare:brand` los convierte a WebP con transparencia: `public/brand/` (logo, `llave-<categoría>`, `divisor-borla`) y `public/atlas/rosa-vientos.webp`. Los originales sí van en el repo porque pesan poco (unos 700 KB). `borla.png` (la borla sola) no se usa porque el divisor ya la incluye. Rutas y tamaños en `src/content/brand.ts`.
- **Llaves por categoría.** Se asignaron según las tarjetas de About: Storytelling 1, Campañas 2, Branding 3, Plataformas 4, Social media 5. La misma llave se usa en el panel del Atlas, en abanico y tenue cuando el caso no tiene esa categoría. Si el cliente quiere otra asignación, se cambia en `KEY_IMAGES`.
- **Reemplazos.** Logo, llaves, borla del pie y rosa de los vientos ahora son imágenes; se eliminaron los iconos SVG provisionales `KeyIcon`, `CompassIcon` y `OrnamentIcon`. El divisor del pie es una sola imagen con la línea y la borla, así que se estira al ancho del pie.
- **Punto seleccionado.** Ya no crece ni pulsa: el punto elegido lleva encima un pin de ubicación (gota con punta) cuya punta cae sobre el punto.

## Insignias del mapa, color de resalte y panel sin scroll

- **Insignia.** Los puntos del mapa son una insignia de borde ondulado (8 lóbulos, en `AtlasPin`) con anillo y centro dorados, como en la referencia del cliente.
- **Resalte.** El punto seleccionado invierte los colores de la paleta: insignia dorada con borde y centro en el verde de acento (los demás son oscuros con centro dorado). Al elegirlo hace un parpadeo de tamaño: casi desaparece (10 %) y vuelve una sola vez, en 0.4 s, ya con el color de seleccionado; a 0.9 s se sentía lento, como si el sitio se hubiera trabado (`.atlas-pin-blink` en `atlas.css`; `prefers-reduced-motion` lo apaga). Una versión anterior encogía, crecía por encima de su tamaño y volvía, y se sentía como un rebote; una de solo opacidad se descartó. Se probó un pin de ubicación y un rojo terracota y se descartaron: el pin no gustó y el rojo no es de la paleta; no hay colores nuevos. Los puntos miden 1.5rem (`--atlas-pin-size`).
- **Panel sin scroll.** El panel derecho del Atlas ya no se desplaza: el título se corta a 2 líneas y el extracto a 4, con puntos suspensivos (`line-clamp`). El corte es por número de líneas, no por el alto disponible, así que en ventanas muy bajas el panel recorta lo que no cabe por abajo.
- **Explore the Atlas.** El botón vuelve a estar en la cabecera (escritorio y menú móvil) y se oculta solo en la página del Atlas (`body:has(.atlas-page) .explore-atlas-link`, en `atlas.css`). El buscador sigue fuera.
- **Cabecera del Atlas.** La distribución de la cabecera es la misma en todas las páginas; lo único que cambia es el botón. La navegación (Home, Perspectives, About) va centrada respecto a toda la cabecera en escritorio (`absolute left-1/2 -translate-x-1/2` en `Header.tsx`), así que no se mueve con o sin el botón, que queda a la derecha. En el Atlas el botón se oculta con `visibility: hidden` y en el menú móvil con `display: none` (`atlas.css`).

## Home: banner con foto nueva y bloque Featured (fase 1, 1.13)

- **Banner.** La Home ya no comparte el hero con About. Usa `.home-banner*` (en `home.css`): título "Creativity travels further" (`home.bannerTitle`), el texto de `home.heroDescription`, el enlace "Learn more" (a `/about`). Las clases `home-hero*` y `home-overview` siguen igual porque About las usa.
- **Foto.** `public/home/hero-home.webp` (1916 por 821, unos 170 KB). El original sin pérdida (1.7 MB) está en `scripts/data/home-source/`, fuera del repo, y `npm run prepare:home` genera el WebP. En escritorio ocupa el 62% derecho del banner (`--home-banner-art-width`) con `object-fit: cover` y se funde con el color de la página por el borde izquierdo (`mask-image`, `--home-banner-fade`). En móvil va debajo del texto, a todo el ancho (`--home-banner-ratio`), fundida por arriba.
- **Featured.** `HomeFeatured` muestra tres artículos: el destacado primero y los recientes después, sin repetirlo (`getFeaturedArticle` y `getRecentArticles(HOME_RECENT_LIMIT, featured?.id)`). En escritorio van en tres columnas con línea dorada entre ellas y la portada cuadrada a la derecha del texto; en móvil, apilados con la portada arriba. Un solo enlace por artículo (el del título, estirado). Sin artículos muestra `home.empty`.
- **Estructura de cada artículo.** Título, extracto y "Read the article" a la izquierda y la portada cuadrada a la derecha; la portada va después del texto en el DOM. Desde `lg` es una rejilla (`.home-featured-item`, en `home.css`) con la portada en el 50% derecho (`--home-featured-image-width`): su alto (que es su ancho) fija el de la fila y el texto se estira de la parte de arriba del título hasta "Read the article" (`height: 0; min-height: 100%` en `.home-featured-text`, para que el texto no agrande la fila). El extracto se corta a 3 líneas y el título baja a `text-lg`. En móvil la portada es el 40% y la fila sigue la altura del texto.
- **Cabecera en la Home.** Sin cambios: el botón "Explore the atlas" sigue en la cabecera (en una versión anterior se ocultó en la Home; se revirtió). El banner ya no lleva ese botón, solo "Learn more".
- **Se quitó de la Home** el bloque Who, What, Why y How. Sigue en About. Si el cliente lo quiere también en la Home, se puede volver a poner debajo de Featured.
- **Sin cambios:** cabecera y pie. No se probó en navegador porque este checkout no tiene `.env.local` (`NEXT_PUBLIC_SANITY_*`); revisar `/` con datos reales.

## Pie sobre Featured y botón de la cabecera desplazado (páginas ocultas por Activity)

- **Causa del pie encima de los artículos.** Next conserva las páginas anteriores en el DOM, ocultas con `display: none` (React Activity, ver `preserving-ui-state.md`). Las reglas `body:has(.atlas-page)` y `body:has(.panel-page)` (que fijan el alto del cuerpo a `100dvh` desde `lg`) seguían encontrando la página oculta, así que al pasar de About, Perspectives o Atlas a la Home el cuerpo quedaba con el alto de la ventana y el pie se montaba sobre el contenido. Las mismas reglas también ocultaban el pie y el botón "Explore the atlas" por error.
- **Arreglo.** `PageMarker` (`src/components/layout/PageMarker.tsx`, cliente) va dentro del `main` de Atlas, Perspectives, el artículo y About, y con `useLayoutEffect` pone `data-hidden` en ese `main` mientras la página está oculta. Las reglas de `atlas.css` y `perspectives.css` usan `.atlas-page:not([data-hidden])` y `.panel-page:not([data-hidden])`. Sin JavaScript todo sigue igual, porque el atributo solo aparece al ocultarse. Una página nueva con alto de ventana debe llevar su `PageMarker`.
- **Botón de la cabecera.** `html { scrollbar-gutter: stable }` en `globals.css`. La Home se desplaza por el cuerpo y las demás por paneles internos, así que en Windows la barra de desplazamiento le quitaba unos 15 px de ancho a la cabecera solo en la Home y el botón quedaba corrido. Ahora todas reservan el hueco.
- **Sin comprobar en navegador** (falta `.env.local` en este checkout): verificar navegando entre About, Atlas, Perspectives y Home en escritorio.

## Home con desvanecido al pie y pie fijo

La Home usa el mismo esquema que Perspectives y About: el `main` lleva `panel-page panel-page-footer` y su contenido va dentro de `.panel-scroll`. Desde `lg` la página mide el alto de la ventana, el contenido se desplaza dentro con el desvanecido al pie (`--panel-fade`, `mask-image`) y el pie queda fijo. Abajo de `lg` sigue el flujo normal con el pie visible, y el desvanecido de móvil no se agregó a la Home (solo About lo tiene). Lleva su `PageMarker`, como las demás páginas con alto de ventana.

## Home en móvil

- **Botones del banner.** "Explore the atlas" (`lg:hidden`: en escritorio el acceso está en la cabecera) va a la izquierda de "Learn more", en una fila. Abajo de `sm` los dos usan `text-xs` para caber juntos en 360 px; si no caben, se envuelven.
- **Título.** Menos relleno arriba del banner (`calc(var(--space-8) * 0.75)`), más cerca de la cabecera.
- **Featured.** El mismo esquema que en escritorio: la portada cuadrada (45% del ancho, `--home-featured-image-width-mobile`) fija el alto de la fila y el texto se estira de arriba del título a "Read the article" (`.home-featured-text`, `height: 0; min-height: 100%`). Título `text-lg` y extracto de 3 líneas; el extracto se acorta antes que perder el enlace. Desde `lg` la portada es el 50%.
- Sin probar en navegador (falta `.env.local`); revisar en 360 y 390 px.
