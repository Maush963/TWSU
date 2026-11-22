// Todos los textos fijos de la interfaz, agrupados por zona.
// Los componentes los leen de aquí y no llevan texto escrito dentro.

export const uiText = {
  meta: {
    title: "TWSU",
    description: "TWSU, atlas de casos y perspectivas de marca por el mundo.",
    titleTemplate: "%s | TWSU",
    // Idioma de las fechas. Sigue el diseño del cliente (October 21, 2026).
    locale: "en",
  },
  common: {
    skipToContent: "Skip to content",
    placeholderContent: "Content coming soon",
  },
  // Los textos del diseño del cliente (cabecera, Atlas y pie) van en inglés, como en el mockup.
  nav: {
    label: "Main",
    logo: "Tourism Will Save Us",
    logoLine1: "Tourism",
    logoLine2: "Will save us",
    home: "Home",
    atlas: "Atlas",
    perspectives: "Perspectives",
    about: "About",
    exploreAtlas: "Explore the atlas",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  footer: {
    label: "Footer",
    tagline: "Independent Tourism Standard",
    contact: "Contact",
    privacy: "Privacy",
    brand: "Tourism Will Save Us",
    rights: "TWSU. All rights reserved.",
    social: "Social media",
  },
  subscribe: {
    title: "Subscribe",
    emailLabel: "Email address",
    emailPlaceholder: "you@email.com",
    submit: "Subscribe",
    sending: "Sending",
    success: "Thank you, check your inbox.",
    error:
      "We couldn't register your email. Check that it is valid and try again.",
  },
  home: {
    title: "Home",
    heroTitle: "We explore",
    heroDescription:
      "The creative forces behind the way we travel. We discover, analyze, and celebrate the ideas and people shaping how the world sees itself, and experiences places.",
    heroBelief:
      "Because we know tourism is a transformative force — one that inspires, connects, and expands what human creativity can make possible.",
    values: [
      {
        title: "Who",
        description:
          "We are an independent tourism standards organization celebrating the people, places and ideas moving tourism forward.",
      },
      {
        title: "What",
        description:
          "We discover, recognize and amplify the forces shaping a better way to travel.",
      },
      {
        title: "Why",
        description:
          "Because when tourism moves in the right direction, it has the power to save the world.",
      },
      {
        title: "How",
        description:
          "We research, evaluate and recognize tourism through independent standards designed to spotlight meaningful work and measurable impact.",
      },
    ],
    // Dos líneas fijas, como en el diseño (también en móvil).
    bannerTitle: ["Creativity", "Travels further"],
    learnMore: "Learn more",
    featured: "Featured",
    readArticle: "Read the article",
    empty: "There are no articles yet.",
  },
  atlas: {
    title: "Atlas",
    tagline: "People, places & ideas changing the way we travel.",
    empty: "No points match these filters.",
    clearFilters: "Clear filters",
    mapAlt: "World map with the atlas cases",
    exploreBy: "Explore by best",
    mobile: { explore: "Explore", byBest: "by best" },
    allCategories: "All",
    edition: "EDITION",
    readMore: "Read more",
    panelLabel: "Selected case",
    compass: "Compass",
    filters: {
      label: "Atlas filters",
      category: "Category",
      region: "Region",
      year: "Year",
      clear: "Clear filters",
    },
    keys: {
      label: "Keys",
      on: "on",
      off: "off",
    },
  },
  // Los textos de Perspectives y del artículo siguen el diseño del cliente, en inglés.
  perspectives: {
    title: "Perspectives",
    latest: "Latest saving",
    about: "About",
    readFull: "Read the full thing",
    readMore: "Read more",
    ideas: "Ideas making us travel",
    exploreBy: "Explore by topic",
    allTopics: "All",
    empty: "No articles match these filters.",
    clearFilters: "Clear filters",
    pagination: "Pagination",
    previous: "Previous",
    next: "Next",
    page: "Page",
  },
  article: {
    author: "TWSU Team",
    related: "Keep on reading",
    videoTitle: "Video",
    share: "Share",
    shareOn: { facebook: "Share on Facebook", x: "Share on X", linkedin: "Share on LinkedIn" },
    copyLink: "Copy link",
    linkCopied: "Link copied",
  },
  about: {
    title: "About",
    overviewLabel: "Who we are, what we do, why and how",
    councilTitle: "The Council of Five",
    councilSubtitle: "The icons that shape our creative criteria",
    councilBackgroundAlt: "",
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist or has moved.",
    back: "Back to home",
  },
} as const;
