# TWSU, base del desarrollo

Plan técnico para construir la plataforma de Tourism Will Save Us. Primero todo funcional y sin estética, después se aplica el diseño del cliente.

## Cómo usar este archivo

- Cada sección se entiende sola, se puede pegar completa como contexto
- Si algo no está aquí, no se inventa, se anota en la sección de Pendientes
- El orden de entrega con el cliente es Home y Atlas, luego Blog y Perspectives, luego About y Join

---

## 1. Contexto en 30 segundos

- Sitio de TWSU, creatividad en la industria turística
- Objetivo, legitimar la marca y crear una base de suscriptores
- Pieza principal, el Atlas con 50 menciones, 5 categorías de 10
- El contenido sale de artículos con etiquetas, y de ahí se alimentan Home, Atlas y Perspectives
- El cliente sube los artículos desde un administrador, nosotros no tocamos contenido
- Alcance de 6 semanas, un solo idioma, el selector de idioma queda fuera

## 2. Stack

| Capa | Herramienta |
| --- | --- |
| Sitio | Next.js con App Router, TypeScript estricto |
| Estilos | Tailwind CSS con tokens en variables CSS |
| Administrador | Sanity, Studio desplegado aparte |
| Hosting | Hostinger Web Apps Hosting con Node.js, repo en GitHub |
| Correo | Mailchimp o Brevo por API, por confirmar |
| Medición | Tag de Google y pixels de Meta y TikTok que entregue el cliente |

## 3. Estructura de carpetas

```
twsu/
  src/
    app/
      layout.tsx                  layout general con pie de suscripción
      page.tsx                    Home
      atlas/page.tsx
      perspectives/page.tsx
      perspectives/[slug]/page.tsx
      about/page.tsx
      join/page.tsx
      api/
        revalidate/route.ts       webhook de Sanity
        subscribe/route.ts        suscripción del pie
        contact/route.ts          formulario de Join
    components/
      layout/                     Header, Footer, SubscribeBar
      atlas/                      AtlasMap, AtlasPin, AtlasFilters, AtlasMobileList, CategoryKeys
      articles/                   ArticleCard, FeaturedArticle, ArticleBody, RelatedArticles, CategoryFilter
      ui/                         Button, Input, y piezas básicas
    lib/
      sanity/                     client.ts, queries.ts, types.ts
      data/                       articles.ts, atlas.ts
      atlas/                      project.ts, collisions.ts
      filters.ts
      env.ts
    content/
      ui-text.ts                  todos los textos de la interfaz
    styles/
      tokens.css                  variables de diseño
  sanity/
    schemas/                      article.ts, place.ts
  scripts/
    seed.ts                       datos de prueba
  public/
    atlas/                        PNG del mapa
```

## 4. Rutas

| Ruta | Qué muestra | Filtros por URL |
| --- | --- | --- |
| / | Destacado y 3 artículos recientes | ninguno |
| /atlas | Mapa con puntos, versión lista en móvil | category, region, year |
| /perspectives | Destacado fijo y listado de dos en dos | category, page |
| /perspectives/[slug] | Artículo con portada, texto y lecturas relacionadas | ninguno |
| /about | Resumen, quién qué por qué cómo, personajes | ninguno |
| /join | Formulario completo de contacto | ninguno |

Regla, el pie con la suscripción de solo correo vive en el layout y aparece en todas las rutas.

## 5. Modelo de contenido en Sanity

### Documento article

| Campo | Tipo | Regla |
| --- | --- | --- |
| title | string | obligatorio |
| slug | slug | generado del título, obligatorio |
| cover | image | obligatoria, con texto alternativo |
| excerpt | text | máximo 200 caracteres |
| body | portable text | bloques, imágenes, h2 y h3 |
| place | referencia a place | obligatoria, de aquí sale el continente |
| categories | lista de strings | mínimo 1, sin repetir, valores de CATEGORIES |
| year | number | por defecto el año actual |
| featured | boolean | marca el destacado de Home y Perspectives |
| inAtlas | boolean | marca si aparece en el atlas |
| publishedAt | datetime | obligatorio |
| isSeed | boolean | oculto, solo para datos de prueba |

### Documento place

| Campo | Tipo | Regla |
| --- | --- | --- |
| name | string | obligatorio |
| countryCode | string | código ISO de 2 letras |
| continent | string | lista cerrada, se muestra como dropdown |
| lat | number | entre -90 y 90 |
| lng | number | entre -180 y 180 |
| kind | string | country o city |

### Reglas del modelo

- El editor elige el lugar en un dropdown con búsqueda, nunca escribe coordenadas
- El continente se deriva del lugar, así no se contradicen
- Las coordenadas de un país son las de su capital o ciudad principal, no el centro geográfico
- Si hay varios destacados, gana el de publishedAt más reciente
- Aviso en Studio si una categoría pasa de 10 artículos en el atlas para el mismo año
- Los lugares se cargan una sola vez con el seed

### Constantes compartidas

```ts
export const CATEGORIES = [
  { value: 'storytelling', title: 'Storytelling' },
  { value: 'plataformas', title: 'Plataformas' },
  { value: 'campanas', title: 'Campañas' },
  { value: 'branding', title: 'Branding' },
  { value: 'social-media', title: 'Social media' },
] as const

export const CONTINENTS = [
  { value: 'america', title: 'América' },
  { value: 'europa', title: 'Europa' },
  { value: 'asia', title: 'Asia' },
  { value: 'africa', title: 'África' },
  { value: 'oceania', title: 'Oceanía' },
] as const

export type Category = (typeof CATEGORIES)[number]['value']
export type Continent = (typeof CONTINENTS)[number]['value']
```

## 6. Capa de datos

Regla principal, las páginas y componentes nunca llaman a Sanity directo, solo estas funciones. Así el diseño no toca la lógica.

```ts
getFeaturedArticle(): Promise<Article | null>
getRecentArticles(limit: number, excludeId?: string): Promise<ArticleCard[]>
getArticleBySlug(slug: string): Promise<Article | null>
getRelatedArticles(article: Article, limit: number): Promise<ArticleCard[]>
listArticles(filters: ArticleFilters): Promise<Paginated<ArticleCard>>
getAtlasPins(filters: AtlasFilters): Promise<AtlasPin[]>
```

- Cada consulta usa etiquetas de caché, por ejemplo article, para que el webhook las invalide
- Los tipos viven en lib/sanity/types.ts y se reutilizan en toda la app

## 7. Filtros por URL

| Parámetro | Valores | Dónde aplica |
| --- | --- | --- |
| category | una de CATEGORIES | Atlas y Perspectives |
| region | una de CONTINENTS | Atlas |
| year | número | Atlas |
| page | número desde 1 | Atlas y Perspectives |

- Se leen y validan en lib/filters.ts con lista blanca, un valor inválido se ignora
- Así los filtros se pueden compartir y funcionan con renderizado en servidor

## 8. Tokens de diseño

Todo valor visual sale de variables. Mientras llega el diseño se usan valores temporales neutros.

```css
:root {
  /* colores, temporales */
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-accent: #0a5cff;
  --color-muted: #6b6b6b;

  /* tipografía, temporal */
  --font-body: system-ui, sans-serif;
  --font-display: system-ui, sans-serif;

  /* espacio y forma */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --radius: 0.5rem;
}
```

- Tailwind se configura leyendo estas variables
- Prohibido usar colores hexadecimales o tamaños sueltos dentro de componentes
- Cuando llegue la estética se cambian los valores aquí y se ajustan los componentes que lo necesiten

## 9. Textos de la interfaz

- Todos los textos fijos viven en content/ui-text.ts, agrupados por zona (nav, atlas, footer, join)
- Los componentes los leen de ahí, no llevan texto escrito dentro
- Los idiomas están fuera del alcance, esto solo evita reescribir si se agregan después

## 10. Atlas

### Qué hace

- Mapamundi como imagen PNG de fondo y puntos encima
- Sin zoom, sin popup, el clic en un punto lleva al artículo
- Filtros por categoría, ubicación y año
- Cada lugar muestra las cinco llaves, encendidas las categorías que tiene
- En móvil el mapa es un gráfico y se navega con selector de región y lista de previews

### Datos

- Cada punto sale de un artículo con inAtlas activo y su place
- El tipo que consume el componente

```ts
export interface AtlasPin {
  id: string
  slug: string
  title: string
  placeName: string
  continent: Continent
  categories: Category[]
  lat: number
  lng: number
  x: number   // porcentaje horizontal sobre la imagen
  y: number   // porcentaje vertical sobre la imagen
}
```

### De coordenadas a posición en la imagen

- Se calcula en lib/atlas/project.ts con una configuración del mapa
- Se necesita saber la proyección del PNG y el área que ocupa el mapa dentro de la imagen

```ts
export type MapConfig = {
  projection: 'equirectangular' | 'mercator'
  bounds: { west: number; east: number; north: number; south: number }
}

const mercY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

export function project(lat: number, lng: number, cfg: MapConfig) {
  const { west, east, north, south } = cfg.bounds
  const x = (lng - west) / (east - west)
  const y =
    cfg.projection === 'mercator'
      ? (mercY(north) - mercY(lat)) / (mercY(north) - mercY(south))
      : (north - lat) / (north - south)
  return { x: x * 100, y: y * 100 }
}
```

- Si el PNG usa una proyección estilizada como Robinson o Winkel Tripel, se usa d3-geo con esa proyección ajustada al tamaño de la imagen
- Se calibra con 4 o 5 ciudades de referencia y se ajustan bounds hasta que caigan en su lugar
- Si no hay forma de calibrar bien, se guardan ajustes manuales por lugar en el documento place

### Puntos encimados

- Menciones del mismo lugar o muy cercanas se separan en un círculo pequeño alrededor del punto
- Orden determinista por slug, para que no se muevan entre cargas
- Vive en lib/atlas/collisions.ts

### Componente

- Contenedor con la misma proporción del PNG para que todo escale junto
- Cada punto es un enlace posicionado con left y top en porcentaje
- Texto accesible con título y lugar, foco visible con teclado
- Imagen con next/image, tamaño responsivo y prioridad de carga

### Móvil

- Selector de región que cambia el gráfico y la lista
- Lista con previews de los artículos de esa región
- No se intenta hacer interactivo el mapa

### Assets del mapa

- Pedir el PNG sin puntos ni textos y en alta resolución
- Guardarlo en public/atlas y comprimirlo
- Mantener el archivo original del diseño aparte, fuera del repo

## 11. Datos de prueba

scripts/seed.ts crea todo con identificadores fijos, así se puede correr varias veces sin duplicar.

- Lugares, los países con coordenadas de capital
- 50 artículos falsos, 10 por categoría, repartidos por continentes
- Algunos con varias categorías para probar las llaves
- Un destacado
- Años distintos para probar el filtro de año
- Texto de relleno e imágenes de portada de prueba
- Todo marcado con isSeed para borrarlo fácil al cargar contenido real

## 12. Suscripción y contacto

- /api/subscribe recibe el correo, lo valida y lo manda por API a Mailchimp o Brevo
- /api/contact recibe nombre, teléfono, empresa y correo
- Protección contra spam con campo trampa, tiempo mínimo de envío y límite por IP
- Respuestas genéricas, sin revelar si un correo ya existe
- Los correos no se guardan en el hosting, viven en la herramienta de correo

## 13. Medición

- Un componente en el layout carga el tag de Google y los pixels de Meta y TikTok
- Los identificadores vienen de variables de entorno
- Se cargan con next/script después de que la página es interactiva
- No se instala GA4 ni se programan eventos propios, solo lo que pase el cliente

## 14. Hosting y despliegue

- Plan de Hostinger con Node.js, no hosting compartido
- Repo de GitHub conectado a Hostinger, se despliega la rama principal
- Sanity Studio se despliega aparte con el comando de Sanity
- Webhook de Sanity que llama a /api/revalidate con un secreto, el endpoint verifica el secreto e invalida las etiquetas

Variables de entorno

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_READ_TOKEN
SANITY_REVALIDATE_SECRET
MAIL_API_KEY
MAIL_LIST_ID
NEXT_PUBLIC_GOOGLE_TAG_ID
NEXT_PUBLIC_META_PIXEL_ID
NEXT_PUBLIC_TIKTOK_PIXEL_ID
```

Prueba temprana, antes de construir encima

- [ ] Desplegar una página mínima en Hostinger
- [ ] Publicar un artículo en Sanity y ver que aparece sin volver a desplegar
- [ ] Confirmar que las variables de entorno se leen bien en producción

## 15. Orden de trabajo

### Fase 0, base

- [ ] Proyecto Next.js con TypeScript, Tailwind y lint
- [ ] Tokens, layout general y pie de suscripción
- [ ] Todas las rutas creadas con contenido vacío
- [ ] Modelo de Sanity y constantes compartidas
- [ ] Capa de datos con tipos
- [ ] Filtros por URL
- [ ] Seed con datos de prueba
- [ ] Despliegue de prueba en Hostinger con webhook

### Fase 1, Home y Atlas

- [ ] Función de proyección calibrada con el PNG
- [ ] Separación de puntos encimados
- [ ] Componente del mapa con puntos y filtros
- [ ] Llaves por categoría
- [ ] Versión móvil con selector y lista
- [ ] Home con destacado y recientes

### Fase 2, Blog y Perspectives

- [ ] Listado con destacado fijo y filtro por categoría
- [ ] Página de artículo con portada, texto y lecturas relacionadas
- [ ] Actualización automática comprobada con el webhook

### Fase 3, About y Join

- [ ] About con personajes
- [ ] Join con formulario completo
- [ ] Conexión real con la herramienta de correo
- [ ] Tag de Google y pixels de Meta y TikTok

### Fase 4, pruebas y entrega

- [ ] Estética aplicada con los tokens
- [ ] Revisión con el cliente y rondas de ajustes
- [ ] SEO técnico, velocidad y seguridad
- [ ] Publicación y capacitación del administrador

## 16. Reglas para Claude Code y Copilot

- Claude Code propone el plan de cada tarea, Copilot la implementa
- Una tarea por commit, pequeña y revisable
- TypeScript estricto, sin any
- Sin colores ni tamaños sueltos, todo por tokens
- Sin llamadas a Sanity fuera de lib/data
- Sin texto escrito dentro de componentes, todo en ui-text
- Componentes con props tipadas y accesibles
- Cada tarea termina con build y lint sin errores

Plantilla para pedir una tarea a Copilot

```
Contexto, sección del archivo base que aplica
Objetivo, qué debe quedar funcionando
Archivos, cuáles crear o modificar
Criterio de aceptación, cómo se comprueba que está listo
```

## 17. Pendientes

- [ ] Proyección del PNG del atlas, preguntar a Luis o revisar el archivo
- [ ] Al abrir el atlas, si se ven los 50 puntos o solo los de una categoría
- [ ] Si todos los artículos con lugar salen en el atlas o solo los marcados con inAtlas
- [ ] Herramienta de correo, Mailchimp o Brevo
- [ ] Si el cliente necesita banner de consentimiento de cookies
- [ ] Tipografías y colores finales
- [ ] Códigos del tag de Google y pixels de Meta y TikTok
- [ ] Límites vigentes del plan gratis de Sanity, revisar en su página oficial
