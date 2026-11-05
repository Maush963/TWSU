// Los cinco personajes de "The Council of Five", como en el diseño del cliente.
// Son contenido fijo hasta decidir si se editan en Studio (ver docs/fase-3.md, 3.5).
export const CHARACTERS = [
  {
    id: "panda-lu",
    key: "storytelling",
    nameLines: ["Panda", "Lu"],
    category: "Storytelling",
    text: "The secret is to make them care enough to keep watching. A panda has always known how to hold an audience.",
    image: "/about/pandalu.webp",
    alt: "Panda Lu, a panda in a rust-colored robe and necklaces, seated under stone arches.",
  },
  {
    id: "gere-giraffe",
    key: "campanas",
    nameLines: ["Gere", "Giraffe"],
    category: "Campaigns",
    text: "Strategies that reach far and around. It takes a long neck to see the whole picture from above.",
    image: "/about/gere.webp",
    alt: "Gere Giraffe, a giraffe in a green scarf and a safari jacket.",
  },
  {
    id: "stan-the-stag",
    key: "branding",
    nameLines: ["Stan", "the Stag"],
    category: "Branding",
    text: "A good brand is as unmistakable as the antlers of a stag in the animal kingdom.",
    image: "/about/stan.webp",
    alt: "Stan the Stag, a stag in a brown coat and a cream turtleneck.",
  },
  {
    id: "kaia-kangaroo",
    key: "plataformas",
    nameLines: ["Kaia", "Kangaroo"],
    category: "Platforms",
    text: "Tourism platforms carry destinations further. Kaia was practically born for the job.",
    image: "/about/kaia.webp",
    alt: "Kaia Kangaroo, a kangaroo in a green dress and a light shawl.",
  },
  {
    id: "cheetah-camille",
    key: "social-media",
    nameLines: ["Cheetah", "Camille"],
    category: "Social media",
    text: "Trends never stands still. It takes speed, focus and perfect timing to stay ahead.",
    image: "/about/camille.webp",
    alt: "Cheetah Camille, a cheetah in a white shirt and a gold collar.",
  },
] as const;
