// Todos los textos fijos de la interfaz, agrupados por zona.
// Los componentes los leen de aquí y no llevan texto escrito dentro.

export const uiText = {
  meta: {
    title: "TWSU",
    description: "TWSU, atlas de casos y perspectivas de marca por el mundo.",
    titleTemplate: "%s | TWSU",
  },
  common: {
    skipToContent: "Saltar al contenido",
    placeholderContent: "Contenido pendiente",
  },
  // Los textos del diseño del cliente (cabecera, Atlas y pie) van en inglés, como en el mockup.
  nav: {
    label: "Principal",
    logo: "Tourism Will Save Us",
    logoLine1: "Tourism",
    logoLine2: "Will save us",
    home: "Home",
    atlas: "Atlas",
    perspectives: "Perspectives",
    about: "About",
    join: "Join",
  },
  footer: {
    label: "Pie de página",
    tagline: "Independent Tourism Standard",
    contact: "Contact",
    privacy: "Privacy",
    brand: "Tourism Will Save Us",
    rights: "TWSU. Todos los derechos reservados.",
    social: "Redes sociales",
  },
  subscribe: {
    title: "Suscríbete",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    submit: "Suscribirme",
    sending: "Enviando",
    success: "Gracias, revisa tu correo.",
    error:
      "No pudimos registrar tu correo. Revisa que sea válido e inténtalo de nuevo.",
  },
  home: {
    title: "Inicio",
    featured: "Destacado",
    recent: "Recientes",
    empty: "Todavía no hay artículos.",
  },
  atlas: {
    title: "Atlas",
    tagline: "People, places & ideas changing the way we travel.",
    empty: "No hay puntos con estos filtros.",
    clearFilters: "Quitar filtros",
    mapAlt: "Mapamundi con los casos del atlas",
    exploreBy: "Explore by best",
    allCategories: "All",
    applyFilter: "Apply",
    edition: "EDITION",
    readMore: "Read more",
    compass: "Brújula",
    filters: {
      label: "Filtros del atlas",
      category: "Categoría",
      region: "Región",
      year: "Año",
      clear: "Quitar filtros",
    },
    keys: {
      label: "Llaves",
      on: "encendida",
      off: "apagada",
    },
  },
  perspectives: {
    title: "Perspectives",
    empty: "No hay artículos con estos filtros.",
    pagination: "Paginación",
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    of: "de",
  },
  article: {
    related: "Lecturas relacionadas",
  },
  about: {
    title: "About",
  },
  join: {
    title: "Join",
  },
  notFound: {
    title: "Página no encontrada",
    description: "La página que buscas no existe o cambió de lugar.",
    back: "Volver al inicio",
  },
} as const;
