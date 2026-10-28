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
  nav: {
    label: "Principal",
    logo: "TWSU",
    home: "Inicio",
    atlas: "Atlas",
    perspectives: "Perspectives",
    about: "About",
    join: "Join",
  },
  footer: {
    rights: "TWSU. Todos los derechos reservados.",
  },
  subscribe: {
    title: "Suscríbete",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    submit: "Suscribirme",
    sending: "Enviando",
    success: "Gracias, revisa tu correo.",
    error: "No pudimos registrar tu correo. Revisa que sea válido e inténtalo de nuevo.",
  },
  home: {
    title: "Inicio",
    featured: "Destacado",
    recent: "Recientes",
    empty: "Todavía no hay artículos.",
  },
  atlas: {
    title: "Atlas",
    empty: "No hay puntos con estos filtros.",
    mapAlt: "Mapamundi con los casos del atlas",
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
