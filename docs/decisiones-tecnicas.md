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
