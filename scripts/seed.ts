import { createReadStream } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import type { IdentifiedSanityDocumentStub } from "@sanity/client";
import { CATEGORIES, CONTINENTS, type Category, type Continent } from "../src/lib/constants";
import places from "./data/places.json";

type Place = (typeof places)[number];

const client = getCliClient({ apiVersion: "2025-01-01" });

const DAY_MS = 24 * 60 * 60 * 1000;
const currentYear = new Date().getFullYear();
const categories = CATEGORIES.map(({ value }) => value);
const continents = CONTINENTS.map(({ value }) => value);
const countries = places.filter((place) => place.kind === "country");

// Países de prueba, por continente y en este orden. Son grandes y repartidos, para que el atlas
// de prueba se parezca a uno real. Sin esto, los países salían por orden alfabético y todos los
// puntos eran islas pequeñas. Se evitan los que quedan fuera del dibujo del atlas (oeste de -161°).
const SEED_COUNTRY_ORDER = [
  // américa
  "US", "MX", "BR", "AR", "CO", "PE", "CL", "CA", "CU", "CR", "EC", "UY",
  // europa
  "ES", "FR", "IT", "DE", "GB", "PT", "GR", "SE", "PL", "NO", "IS", "HR",
  // asia
  "JP", "CN", "IN", "TH", "ID", "VN", "KR", "AE", "TR", "PH", "MY", "NP",
  // áfrica
  "EG", "ZA", "MA", "KE", "NG", "ET", "TZ", "SN", "GH", "NA", "TN", "MG",
  // oceanía
  "AU", "NZ", "PG", "FJ", "VU",
];

function seedRank(place: Place): number {
  const rank = SEED_COUNTRY_ORDER.indexOf(place.countryCode);
  return rank === -1 ? SEED_COUNTRY_ORDER.length : rank;
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function pickPlace(continent: Continent, index: number): Place {
  const pool = countries.filter((place) => place.continent === continent).sort((a, b) => seedRank(a) - seedRank(b));
  const place = pool[index % pool.length];
  if (!place) throw new Error(`No hay lugares de prueba para ${continent}.`);
  return place;
}

function portableText(title: string, number: number) {
  return [1, 2, 3, 4].map((part) => ({
    _key: `seed-${number}-${part}`,
    _type: "block",
    style: part === 2 ? "h2" : "normal",
    markDefs: [],
    children: [
      {
        _key: `seed-${number}-${part}-span`,
        _type: "span",
        marks: [],
        text: `${title}, bloque ${part}. Texto de relleno sobre ideas, lugares y personas para probar la lectura.`,
      },
    ],
  }));
}

interface ArticleOptions {
  number: number;
  year: number;
  inAtlas: boolean;
  categoryValues: Category[];
  place: Place | undefined;
  featured?: boolean;
  publishedAt: string;
  assetId: string;
}

function makeArticle(options: ArticleOptions) {
  const { number, year, inAtlas, categoryValues, place, featured = false, publishedAt, assetId } = options;
  const label = String(number).padStart(2, "0");
  const title = `Artículo de prueba ${label}`;
  return {
    _id: `article-seed-${label}`,
    _type: "article",
    title,
    slug: { _type: "slug", current: `articulo-de-prueba-${label}` },
    cover: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      alt: `Portada de ${title}`,
    },
    excerpt: `Descripción de prueba para ${title}.`,
    body: portableText(title, number),
    ...(place ? { place: { _type: "reference", _ref: place.id } } : {}),
    categories: categoryValues,
    inAtlas,
    year,
    featured,
    publishedAt,
    isSeed: true,
  };
}

// Pares de llaves de los 8 artículos que ocupan dos lugares. Con los 34 de una sola llave
// que siguen, cada llave suma exactamente 10 lugares en el año actual.
const DOUBLE_PAIRS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 2],
  [1, 3],
  [2, 4],
] as const;

function singleKeys(): number[] {
  const used = new Array<number>(categories.length).fill(0);
  for (const [first, second] of DOUBLE_PAIRS) {
    used[first] = (used[first] ?? 0) + 1;
    used[second] = (used[second] ?? 0) + 1;
  }
  return categories.flatMap((_, key) => new Array<number>(10 - (used[key] ?? 0)).fill(key));
}

function buildArticles(assetIds: string[]): ReturnType<typeof makeArticle>[] {
  const articles: ReturnType<typeof makeArticle>[] = [];
  let number = 1;
  const cover = () => assetIds[number % assetIds.length] as string;
  const category = (key: number) => categories[key] as Category;

  // Año actual en el atlas: 34 artículos de una llave y 8 de dos = 50 lugares, 42 puntos.
  // Los puntos 5 y 10 repiten el país del punto 0 para probar puntos encimados.
  const keys = singleKeys();
  const total = keys.length + DOUBLE_PAIRS.length;
  for (let index = 0; index < total; index += 1) {
    const continent = continents[index % continents.length] as Continent;
    const placeIndex = index === 5 || index === 10 ? 0 : Math.floor(index / continents.length);
    const isDouble = index >= keys.length;
    const pair = DOUBLE_PAIRS[index - keys.length];
    const categoryValues = isDouble && pair ? [category(pair[0]), category(pair[1])] : [category(keys[index] as number)];
    // Destacados: el 01 (reciente) y el primer doble (más antiguo); gana el más reciente.
    const featured = number === 1 || (isDouble && index === keys.length);
    const age = number === 1 ? 9 : featured ? 200 : 15 + index * 5;
    articles.push(
      makeArticle({
        number,
        year: currentYear,
        inAtlas: true,
        categoryValues,
        place: pickPlace(continent, placeIndex),
        featured,
        publishedAt: daysAgo(age),
        assetId: cover(),
      }),
    );
    number += 1;
  }

  // Año anterior en el atlas, para probar el filtro de año.
  for (let index = 0; index < 6; index += 1) {
    articles.push(
      makeArticle({
        number,
        year: currentYear - 1,
        inAtlas: true,
        categoryValues: [category(index % categories.length)],
        place: pickPlace(continents[(index + 1) % continents.length] as Continent, index + 3),
        publishedAt: daysAgo(400 + index * 20),
        assetId: cover(),
      }),
    );
    number += 1;
  }

  // Fuera del atlas: 3 con lugar y 3 sin lugar.
  for (let index = 0; index < 6; index += 1) {
    articles.push(
      makeArticle({
        number,
        year: currentYear,
        inAtlas: false,
        categoryValues: [category(index % categories.length)],
        place: index < 3 ? pickPlace(continents[index % continents.length] as Continent, index + 8) : undefined,
        publishedAt: daysAgo(30 + index * 25),
        assetId: cover(),
      }),
    );
    number += 1;
  }

  return articles;
}

// Subir dos veces la misma imagen devuelve el mismo asset, así el seed no duplica archivos.
async function uploadCovers(): Promise<string[]> {
  const directory = join(process.cwd(), "scripts", "data", "seed-images");
  const ids: string[] = [];
  for (let index = 1; index <= 5; index += 1) {
    const filename = `seed-${index}.png`;
    const asset = await client.assets.upload("image", createReadStream(join(directory, filename)), {
      filename,
      title: `Portada de prueba ${index}`,
    });
    ids.push(asset._id);
  }
  return ids;
}

async function main() {
  const assetIds = await uploadCovers();
  const placeDocuments = places.map(({ id, ...place }) => ({ ...place, _id: id, _type: "place" }));
  const articles = buildArticles(assetIds);
  const documents: IdentifiedSanityDocumentStub[] = [...placeDocuments, ...articles];

  const CHUNK = 100;
  for (let start = 0; start < documents.length; start += CHUNK) {
    const transaction = client.transaction();
    for (const document of documents.slice(start, start + CHUNK)) transaction.createOrReplace(document);
    await transaction.commit();
  }

  console.log(`Seed listo: ${placeDocuments.length} lugares y ${articles.length} artículos.`);
}

main().catch((error: unknown) => {
  console.error("No se pudo cargar el seed.", error);
  process.exitCode = 1;
});
