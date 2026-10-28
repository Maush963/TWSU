# TWSU, Fase 1, Atlas y Home

Instrucciones para construir el Atlas y el Home sobre la base de la Fase 0. Complementa a TWSU-base-del-desarrollo.md y a fase-0.md; donde este archivo dice algo distinto, manda este archivo.

## Objetivo de la fase

Al terminar la Fase 1 el Atlas funciona de punta a punta con datos reales del Studio (mapa con puntos, filtros, llaves, tooltip y versión móvil) y el Home muestra el destacado y los 3 recientes. Se trabaja en tres partes, en este orden:

1. **Parte A, lógica del Atlas.** Funciones puras y probadas, sin diseño. Se puede hacer sin esperar nada del cliente, salvo el PNG para calibrar.
2. **Parte B, diseño del Atlas.** Componentes y estilos sobre esa lógica. Depende de los archivos y decisiones del cliente.
3. **Parte C, Home.** Reutiliza las piezas de las dos partes anteriores.

## Punto de partida (ya existe de la Fase 0)

- `getAtlasPins`, `getAtlasYears`, `getFeaturedArticle`, `getRecentArticles` en `src/lib/data`.
- `project()` en `src/lib/atlas/project.ts`, calibrado con el PNG real (tarea 1.1, hecha). La configuración está en `src/lib/atlas/map-config.ts` y la decisión en `docs/decisiones-tecnicas.md`.
- `parseAtlasFilters` y `toSearchParams` en `src/lib/filters.ts`.
- `AtlasPinData` ya trae `x`, `y`, `categories`, `inAtlas`, `placeName`, `continent` y `excerpt`.
- Seed con 10 espacios por llave en el año actual (unos 42 puntos), un año anterior y puntos encimados.
- Tokens, `ui-text`, `Button` e `Input`.

## Ajustes al documento base

Estos cambios aplican desde ya.

- **Tooltip.** El documento base decía "sin popup". Se sustituye por lo decidido en la Fase 0: en hover y en foco de teclado cada punto muestra un tooltip con título, descripción y la miniatura de las 5 llaves. El clic sigue llevando al artículo.
- **Sin zoom.** Se mantiene: el mapa no tiene zoom ni arrastre.
- **Lógica separada del diseño.** Todo lo que se pueda calcular (posiciones, colisiones, llaves, enlaces de filtros, agrupación por región) vive en `src/lib/atlas/` como funciones puras con pruebas. Los componentes solo pintan lo que esas funciones devuelven.
- **Filtros como enlaces.** Cada filtro es un enlace a una URL construida con `toSearchParams`, no estado de React. Así funcionan con renderizado en servidor, sin JavaScript y se pueden compartir.
- **Valores por defecto mientras el cliente no diga otra cosa.**
  - El Atlas abre con el año más reciente y las 5 categorías visibles (todos los puntos).
  - Las llaves encendidas del tooltip son las `categories` del artículo.
  - Un artículo solo sale en el Atlas si tiene `inAtlas`.
  - Home: destacado y 3 recientes, sin repetir el destacado entre los recientes.

## Reglas para todas las tareas

- **Un commit por tarea,** con mensaje `fase-1: <número> <descripción corta>`.
- **Comprobaciones al cerrar cada tarea:** `npm run lint`, `npm run typecheck`, `npm run build` y, si hay pruebas, `npm run test`, todos sin errores.
- **Reglas de código** de la sección 16 del documento base: sin `any`, sin colores ni tamaños sueltos, sin llamadas a Sanity fuera de `lib/data` y sin texto dentro de los componentes.
- **Pruebas primero en la Parte A.** Cada función pura nueva trae su archivo `.test.ts` con casos válidos, límites y vacíos.
- **Determinismo.** Nada del Atlas usa `Math.random()` ni depende del orden en que llegan los datos: mismo dato, mismo dibujo.

---

# Parte A, lógica del Atlas

## 1.1 Calibración de la proyección

**Contexto.** Sección 10, "De coordenadas a posición en la imagen".

**Objetivo.** Que un punto con latitud y longitud caiga en su lugar sobre el PNG real.

**Pasos**
1. Con el PNG del cliente (sin puntos ni textos, alta resolución), averiguar la proyección y el área que ocupa el mapa dentro de la imagen.
2. Crear `scripts/calibrate-atlas.ts`, que imprime la posición `x`/`y` de 5 ciudades de referencia (por ejemplo Ciudad de México, Lisboa, Tokio, Ciudad del Cabo y Sídney) con la configuración actual, para compararlas a ojo con el PNG.
3. Ajustar `bounds` en `DEFAULT_MAP_CONFIG` hasta que las 5 caigan donde deben. Renombrar a `ATLAS_MAP_CONFIG`.
4. Si el PNG usa una proyección estilizada (Robinson, Winkel Tripel), instalar `d3-geo` y agregar un tercer valor de `projection` en `MapConfig` que lo use. La función `project` mantiene la misma firma.
5. Si el error no baja de un margen aceptable (por ejemplo 1% del ancho) en alguna zona, se documenta en `docs/decisiones-tecnicas.md`. Solo entonces se evalúa agregar un ajuste manual opcional por lugar en `place` (cambio de esquema que se decide aparte).
6. Agregar pruebas con las 5 ciudades de referencia y los valores `x`/`y` calibrados, con tolerancia.

**Archivos.** `src/lib/atlas/project.ts`, `src/lib/atlas/project.test.ts`, `scripts/calibrate-atlas.ts`, `public/atlas/` y `docs/decisiones-tecnicas.md`.

**Criterio de aceptación**
- Las 5 ciudades de referencia caen dentro de la tolerancia sobre el PNG real.
- Las pruebas de `project` pasan con la configuración calibrada.
- El PNG está comprimido en `public/atlas/` y el original queda fuera del repo.

**Estado: hecha con un ajuste empírico.** El PNG (`public/atlas/mapa.png`) no sigue una proyección estándar, así que se ajustó un modelo flexible contra los contornos de Natural Earth (`npm run calibrate:atlas`, configuración `fitted` en `map-config.ts`). Error típico de 5 a 25 px y peor caso de 2.7% del ancho (sur de Tasmania). No hace falta `d3-geo`. Si el cliente confirma la proyección real del archivo, se puede reemplazar por una exacta.

---

## 1.2 Separación de puntos encimados

**Contexto.** Sección 10, "Puntos encimados".

**Objetivo.** Que menciones del mismo lugar o muy cercanas se vean y se puedan elegir por separado, siempre en el mismo sitio.

**Pasos**
1. Crear `src/lib/atlas/collisions.ts` con `spreadPins(pins, options): PositionedPin[]`.
   - Un `PositionedPin` es un `AtlasPinData` con `displayX` y `displayY` (porcentajes), sin tocar `x` ni `y` originales.
   - `options`: `threshold` (distancia en porcentaje bajo la cual dos puntos se agrupan) y `radius` (radio del círculo de separación). Los valores salen de constantes con nombre, no sueltos.
2. Algoritmo:
   - Agrupa los puntos cuya distancia sea menor que `threshold` (agrupación por cercanía, no solo por lugar idéntico).
   - Un grupo de 1 no se mueve.
   - Un grupo de N se ordena por `slug` y se reparte en un círculo alrededor del centroide del grupo, con ángulos equidistantes y empezando siempre en el mismo ángulo.
3. Los resultados se mantienen dentro de 0 a 100; si un círculo se sale del borde, se desplaza hacia adentro.
4. Pruebas:
   - Un punto aislado no se mueve.
   - Dos puntos en el mismo lugar quedan separados por la misma distancia.
   - El resultado no cambia si se invierte el orden de entrada.
   - Un grupo de 5 queda con 5 posiciones distintas.
   - Un punto en la esquina no se sale del 0 a 100.

**Archivos.** `src/lib/atlas/collisions.ts` y `src/lib/atlas/collisions.test.ts`.

**Criterio de aceptación**
- Las pruebas pasan, incluida la de orden de entrada invertido.
- Con el seed, los puntos del mismo país tienen posiciones distintas y ninguna se sale del mapa.

---

## 1.3 Llaves y conteos por categoría

**Contexto.** Sección 10, "Cada lugar muestra las cinco llaves".

**Objetivo.** Saber, para cada punto, qué llaves están encendidas, y cuántos espacios hay ocupados por categoría.

**Pasos**
1. Crear `src/lib/atlas/keys.ts`:
   - `getKeyStates(categories: Category[]): KeyState[]` devuelve siempre 5 elementos, en el orden de `CATEGORIES`, cada uno con `category`, `title` y `active`.
   - `countByCategory(pins: AtlasPinData[]): Record<Category, number>` cuenta cuántos puntos ocupan cada llave.
2. Los `title` salen de `CATEGORIES`; los textos accesibles (por ejemplo "Branding, encendida") salen de `ui-text`, no de esta función.
3. Pruebas:
   - Sin categorías, las 5 apagadas.
   - Con 2 categorías, exactamente 2 encendidas y el orden no cambia.
   - `countByCategory` suma 2 por un artículo con 2 llaves.
   - Con el seed, `countByCategory` da 10 en cada llave en el año actual.

**Archivos.** `src/lib/atlas/keys.ts` y `src/lib/atlas/keys.test.ts`.

**Criterio de aceptación**
- Las pruebas pasan y el orden de las llaves es el mismo que `CATEGORIES`.

---

## 1.4 Enlaces de filtros

**Contexto.** Sección 7 y Ajustes de esta fase ("Filtros como enlaces").

**Objetivo.** Calcular, sin diseño, qué filtros existen, cuál está activo y a qué URL lleva cada opción.

**Pasos**
1. Crear `src/lib/atlas/filter-links.ts` con `buildAtlasFilterLinks(current: AtlasFilterParams, years: number[]): AtlasFilterLinks`.
   - Para cada opción de `category`, `region` y `year` devuelve `{ value, title, href, active }`.
   - Elegir una opción conserva los otros filtros y quita el valor por defecto.
   - Elegir de nuevo la opción activa la quita (alterna).
   - Incluye `clearHref`, que lleva a `/atlas`, y `hasActiveFilters`.
   - Las URLs se construyen con `toSearchParams`, nunca a mano.
2. Los años salen de `getAtlasYears()`. Si el año de la URL no tiene datos, se trata como "sin filtro de año" y cae al más reciente, igual que en `getAtlasPins`.
3. Pruebas:
   - Elegir una categoría conserva `region` y `year`.
   - Elegir la activa genera un enlace que la quita.
   - El año por defecto no aparece en la URL.
   - Un año inexistente no rompe nada.

**Archivos.** `src/lib/atlas/filter-links.ts` y `src/lib/atlas/filter-links.test.ts`.

**Criterio de aceptación**
- Las pruebas pasan.
- Ningún `href` se arma con texto concatenado fuera de `toSearchParams`.

---

## 1.5 Modelo de vista del Atlas

**Contexto.** Secciones 6 y 10.

**Objetivo.** Una sola función que junta todo lo anterior y que consumen escritorio y móvil, para que ambos muestren lo mismo.

**Pasos**
1. Crear `src/lib/atlas/view-model.ts` con `buildAtlasView(pins, filters, years): AtlasView`.
   - `positioned`: los puntos con `displayX` y `displayY` (de `spreadPins`).
   - `counts`: de `countByCategory`.
   - `byRegion`: los puntos agrupados por `continent`, en el orden de `CONTINENTS`, cada grupo ordenado por título. Es lo que usa el móvil.
   - `links`: de `buildAtlasFilterLinks`.
   - `isEmpty`: si no hay puntos tras filtrar.
2. La página `src/app/atlas/page.tsx` pasa de la lista simple de la Fase 0 a llamar a `getAtlasPins`, `getAtlasYears` y `buildAtlasView`. Mientras no haya diseño, sigue imprimiendo una lista de puntos con sus llaves y enlaces de filtro, solo para comprobar la lógica.
3. Pruebas con datos fijos:
   - `byRegion` respeta el orden de `CONTINENTS` y omite los continentes vacíos.
   - `isEmpty` es `true` con `region` sin puntos.
   - El resultado es el mismo con los puntos en otro orden.

**Archivos.** `src/lib/atlas/view-model.ts`, `src/lib/atlas/view-model.test.ts` y `src/app/atlas/page.tsx`.

**Criterio de aceptación**
- `/atlas` muestra unos 42 puntos con el seed y `/atlas?category=branding` muestra 10.
- Las pruebas pasan.
- Al terminar la Parte A, toda la lógica del Atlas está probada sin haber escrito un solo componente visual.

---

# Parte B, diseño del Atlas

Antes de empezar la Parte B deben estar listos los pendientes de diseño del cliente (ver "Bloqueos"). Mientras tanto se construye con los tokens temporales; cambiar el diseño después solo debe tocar `tokens.css` y los estilos de cada componente.

## 1.6 Assets y tokens del Atlas

**Contexto.** Secciones 8 y 10, "Assets del mapa".

**Objetivo.** Que el mapa y sus piezas tengan todo lo visual definido en variables.

**Pasos**
1. En `src/styles/tokens.css`, agregar los tokens del Atlas:
   - Tamaño, color y borde del punto, en reposo, hover y foco.
   - Color de llave encendida y apagada.
   - Fondo, borde y sombra del tooltip, y su ancho máximo.
   - Alto del selector móvil y espacio de la lista.
2. Mapearlos en `@theme inline` para poder usarlos como clases.
3. Colocar el PNG optimizado en `public/atlas/` y exportar su ancho y alto (proporción) desde una constante en `src/lib/atlas/` para que el contenedor use `aspect-ratio`.
4. Si el cliente entrega gráficos de móvil por región, colocarlos en `public/atlas/regions/` con un nombre por valor de `CONTINENTS`.

**Archivos.** `src/styles/tokens.css`, `src/app/globals.css`, `src/lib/atlas/` y `public/atlas/`.

**Criterio de aceptación**
- Cambiar un token del Atlas cambia el aspecto en todo el sitio.
- `npm run lint` (incluye `check:tokens`) pasa.

---

## 1.7 Mapa con puntos

**Contexto.** Sección 10, "Componente".

**Objetivo.** El mapamundi con los puntos en su sitio, que escala completo.

**Pasos**
1. Crear `src/components/atlas/AtlasMap.tsx` (componente de servidor).
   - Contenedor con la proporción del PNG y `position: relative`.
   - Imagen con `next/image`, `priority`, `sizes` responsivo y texto alternativo de `ui-text`.
   - Un `AtlasPin` por cada punto de `positioned`, colocado con `left` y `top` en porcentaje usando `displayX` y `displayY`.
2. Crear `src/components/atlas/AtlasPin.tsx`.
   - Es un `<Link>` a `/perspectives/<slug>`.
   - Texto accesible con título y lugar, visible solo para lectores de pantalla.
   - Foco visible con teclado, con el token de foco.
   - El orden de tabulación sigue el de `byRegion` para que sea lógico, no el de la posición en pantalla.
3. En `src/app/atlas/page.tsx`, reemplazar la lista de depuración por `AtlasMap`.

**Archivos.** `src/components/atlas/AtlasMap.tsx`, `src/components/atlas/AtlasPin.tsx` y `src/app/atlas/page.tsx`.

**Criterio de aceptación**
- Los puntos caen sobre las ciudades correctas y siguen en su sitio al cambiar el ancho de la ventana.
- Se llega a cada punto con Tab y el foco se ve.
- Sin JavaScript el mapa y los enlaces funcionan.

---

## 1.8 Tooltip del punto

**Contexto.** Ajustes de esta fase, "Tooltip".

**Objetivo.** Al pasar el cursor o enfocar un punto, aparece título, descripción y las 5 llaves, sin que el punto deje de ser un enlace.

**Pasos**
1. Crear `src/components/atlas/CategoryKeys.tsx`.
   - Recibe `KeyState[]` y pinta las 5 llaves, encendidas o apagadas, con tokens.
   - Cada llave tiene texto accesible ("Branding, encendida") de `ui-text`. El estado no se comunica solo con color: la llave encendida también cambia de forma o trazo.
2. Crear `src/components/atlas/AtlasTooltip.tsx`.
   - Muestra título, `excerpt` y `CategoryKeys`.
   - Aparece con hover y con foco del enlace; desaparece con salida, desenfoque o la tecla Escape.
   - Se coloca arriba o abajo y a izquierda o derecha según el borde del mapa para no recortarse.
3. Implementación recomendada: solo CSS (`:hover` y `:focus-visible` sobre el padre, con el tooltip como hermano del enlace), así no hace falta JavaScript para lo básico. Si se necesita lógica de borde o Escape, un componente cliente pequeño y aislado.
4. En pantallas táctiles no hay hover. El tooltip no es el único camino al contenido: el clic lleva al artículo y la versión móvil (1.11) muestra la misma información en lista.
5. Respetar `prefers-reduced-motion`: sin animaciones de entrada si el usuario lo pide.

**Archivos.** `src/components/atlas/CategoryKeys.tsx`, `src/components/atlas/AtlasTooltip.tsx` y ajustes en `AtlasPin.tsx`.

**Criterio de aceptación**
- El tooltip aparece con ratón y con teclado, y se cierra con Escape.
- Muestra las llaves correctas para un artículo con 2 categorías.
- No se sale del mapa en los puntos de los bordes.
- Un lector de pantalla anuncia título, descripción y llaves.

---

## 1.9 Filtros del Atlas

**Contexto.** Sección 7 y 1.4.

**Objetivo.** Elegir categoría, región y año desde la interfaz, con la URL como fuente de verdad.

**Pasos**
1. Crear `src/components/atlas/AtlasFilters.tsx`, que recibe `links` de `buildAtlasFilterLinks` y no calcula nada.
   - Tres grupos de enlaces: categoría, región y año.
   - La opción activa lleva `aria-current="true"`.
   - Enlace de "Quitar filtros" visible solo si `hasActiveFilters`.
2. Cada grupo es una lista de enlaces; no hay estado de React. Si el diseño pide un desplegable, se hace con `<details>` o con un componente cliente que solo navega a `href`.
3. Mostrar el conteo por llave (`counts`) junto a las categorías, por ejemplo "Branding 10/10".
4. Los textos van en `ui-text`.

**Archivos.** `src/components/atlas/AtlasFilters.tsx`, `src/content/ui-text.ts` y `src/app/atlas/page.tsx`.

**Criterio de aceptación**
- Cada clic cambia la URL y el mapa, y la URL compartida reproduce el mismo estado.
- Funciona sin JavaScript.
- `/atlas?category=xxx` se ve igual que `/atlas`.

---

## 1.10 Estado vacío y carga

**Contexto.** Sección 6 y regla de no romper la página.

**Objetivo.** Que ninguna combinación de filtros deje la página rota o en blanco.

**Pasos**
1. Cuando `isEmpty`, mostrar un texto de `ui-text` y el enlace para quitar filtros, en lugar del mapa vacío.
2. Si `getAtlasPins` devuelve 0 con el año por defecto (dataset sin artículos), mostrar el estado vacío general, no un error.
3. Agregar `loading.tsx` en `src/app/atlas/` con un marcador que conserve la proporción del mapa para evitar saltos de diseño.

**Archivos.** `src/app/atlas/loading.tsx`, `src/app/atlas/page.tsx` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- `/atlas?region=oceania&category=branding` (si no hay resultados) muestra el estado vacío con salida.
- Con el dataset vacío, `/atlas` responde 200 con el texto de estado vacío.

---

## 1.11 Versión móvil

**Contexto.** Sección 10, "Móvil".

**Objetivo.** En pantallas chicas, el mapa se sustituye por un selector de región y una lista de previews.

**Pasos**
1. Crear `src/components/atlas/AtlasMobileList.tsx`, que consume `byRegion` y `links`.
   - Selector de región con los enlaces de `region`.
   - El gráfico de la región activa (de `public/atlas/regions/` o un recorte del PNG, según lo que defina el cliente).
   - Lista de previews: título, lugar, `excerpt` y `CategoryKeys`, cada una como enlace al artículo.
2. El cambio entre mapa y lista se hace con CSS (breakpoint del token), no con JavaScript, para evitar un parpadeo al cargar.
3. Sin región elegida en móvil, mostrar la primera región con puntos.
4. No se intenta hacer interactivo el mapa en móvil.

**Archivos.** `src/components/atlas/AtlasMobileList.tsx` y `src/app/atlas/page.tsx`.

**Criterio de aceptación**
- En un ancho de móvil no se ve el mapa interactivo y sí el selector y la lista.
- Cambiar de región cambia la lista y la URL.
- La lista muestra las mismas llaves que el tooltip del escritorio.

---

## 1.12 Accesibilidad y revisión del Atlas

**Contexto.** Sección 16, componentes accesibles.

**Objetivo.** Cerrar el Atlas con una revisión que no se pueda olvidar.

**Checklist**
- [ ] Todo se puede usar solo con teclado y el foco siempre se ve
- [ ] El contraste de puntos, llaves y tooltip cumple AA con los tokens
- [ ] El estado de una llave no depende solo del color
- [ ] El mapa tiene alternativa en texto y los enlaces tienen nombre claro
- [ ] `prefers-reduced-motion` desactiva las animaciones
- [ ] Sin JavaScript, el mapa, los filtros y los enlaces siguen funcionando
- [ ] No hay textos de interfaz dentro de los componentes
- [ ] Probado en un ancho de móvil, tablet y escritorio

---

# Parte C, Home

## 1.13 Home

**Contexto.** Sección 4 (ruta `/`) y valores por defecto de la Fase 0.

**Objetivo.** Home con el destacado y los 3 artículos recientes.

**Pasos**
1. Crear en `src/components/articles/`:
   - `ArticleCard.tsx`, recibe un `ArticleSummary` y pinta portada (`next/image` con `urlFor`), título, `excerpt` y llaves con `CategoryKeys`.
   - `FeaturedArticle.tsx`, versión grande del anterior.
   El nombre `ArticleCard` ya no choca con el tipo, que se llama `ArticleSummary`.
2. En `src/app/page.tsx`:
   - `getFeaturedArticle()` y `getRecentArticles(HOME_RECENT_LIMIT, featured?.id)`, para que el destacado no se repita en los recientes.
   - Si no hay destacado, se oculta el bloque y los recientes siguen.
   - Si no hay artículos, se muestra un texto de `ui-text`.
3. Los títulos de cada bloque y los textos de enlace van en `ui-text.home`.
4. Portadas: `sizes` responsivo, `priority` solo en la del destacado y `alt` tomado del campo de Sanity.
5. `metadata` de Home con `title` y `description` de `ui-text`.
6. Enlace de cada tarjeta a `/perspectives/<slug>`.
7. Agregar un acceso al Atlas si el diseño lo pide, usando un texto de `ui-text`.

**Archivos.** `src/components/articles/ArticleCard.tsx`, `src/components/articles/FeaturedArticle.tsx`, `src/app/page.tsx` y `src/content/ui-text.ts`.

**Criterio de aceptación**
- Home muestra el destacado correcto (el más reciente de los marcados) y 3 recientes sin repetirlo.
- Quitar `featured` en Studio y publicar hace que Home pase al siguiente en menos de un minuto, sin desplegar.
- Con el dataset vacío, Home responde 200 con el estado vacío.
- Ninguna imagen sin `alt`.

---

## 1.14 Prueba de punta a punta de la fase

**Contexto.** Sección 14, "Prueba temprana".

**Objetivo.** Confirmar en producción que Atlas y Home aguantan antes de empezar la Fase 2.

**Checklist**
- [ ] `/atlas` muestra unos 42 puntos y cada punto abre su artículo
- [ ] `/atlas?category=branding` muestra 10 y `/atlas?year=<año anterior>` muestra los de ese año
- [ ] El tooltip funciona con ratón y con teclado
- [ ] En un teléfono real, `/atlas` muestra selector y lista
- [ ] Al publicar un artículo con `inAtlas` y `place` en Studio, el punto aparece en menos de un minuto sin desplegar
- [ ] Al cambiar `featured` en Studio, Home cambia sin desplegar
- [ ] Lighthouse de Home y Atlas sin problemas graves de accesibilidad y con un LCP razonable
- [ ] El build no tiene avisos y la lógica nueva de `lib/atlas` tiene pruebas

---

## Definición de terminado de la Fase 1

- Todas las tareas de 1.1 a 1.14 están en `main`, con un commit cada una.
- Pasan `lint`, `typecheck`, `build` y `test`.
- La lógica del Atlas (proyección, colisiones, llaves, enlaces de filtros y modelo de vista) está probada y no depende de componentes.
- El checklist de 1.12 y el de 1.14 están completos.
- No hay llamadas a Sanity fuera de `lib/data`, ni colores sueltos, ni texto dentro de los componentes.

## Bloqueos y preguntas para el cliente

Cada una indica qué tarea frena. La Parte A avanza sin ellas, salvo la primera para la tarea 1.1.

- [ ] **PNG del atlas sin puntos ni textos, en alta resolución, y su proyección.** Bloquea 1.1 y 1.7.
- [ ] **Gráfico móvil por región:** si son imágenes separadas o recortes del mismo PNG. Bloquea 1.11.
- [ ] **Llaves del tooltip:** si se encienden las del atlas o todas las categorías del artículo. Valor por defecto: las `categories` del artículo. Afecta 1.3 y 1.8.
- [ ] **Estado inicial del Atlas:** si se ven los 50 espacios o solo una llave. Valor por defecto: todos los puntos. Afecta 1.4 y 1.5.
- [ ] **Significado de `year`** (edición del atlas o año del caso) y qué año se muestra por defecto. Afecta 1.4.
- [ ] **Tipografías, colores y forma de los puntos y las llaves.** Bloquea el acabado de 1.6, 1.8 y 1.13.
- [ ] **Wireframes del Home y del Atlas,** para no rehacer el layout en la Fase 4. Bloquea 1.7 y 1.13.
- [ ] **Si el Home lleva un acceso al Atlas** y con qué texto. Afecta 1.13.

## Riesgos a vigilar

- **Calibración.** Si el PNG usa una proyección estilizada, 1.1 puede pedir `d3-geo` o ajustes por lugar. Es la tarea con más incertidumbre; conviene hacerla primero.
- **Encimados densos.** Con muchos puntos en un mismo país, el círculo de 1.2 puede quedar apretado. Se revisa con el seed (el peor caso ya incluye 2 en el mismo país) y se ajustan `threshold` y `radius` por constantes.
- **Tooltip en bordes y táctil.** Es la pieza con más casos especiales; por eso la versión móvil muestra la misma información como lista.
- **Cambiar el diseño tarde.** Se mitiga con tokens y con la separación entre `lib/atlas` y los componentes: un rediseño no debería tocar la lógica.
