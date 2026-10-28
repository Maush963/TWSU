import { defineQuery } from "next-sanity";

// Todas filtran publishedAt <= now(). Los parámetros opcionales llegan como null.
// Las proyecciones se repiten a propósito: TypeGen necesita consultas sin interpolar.

export const FEATURED_ARTICLE_QUERY = defineQuery(`
*[_type == "article" && featured == true && publishedAt <= now()]
  | order(publishedAt desc)[0]{
    _id, title, "slug": slug.current, excerpt, publishedAt, year, categories, featured, inAtlas,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent,
    body
  }
`);

export const RECENT_ARTICLES_QUERY = defineQuery(`
*[_type == "article" && publishedAt <= now() && ($excludeId == null || _id != $excludeId)]
  | order(publishedAt desc)[0...$limit]{
    _id, title, "slug": slug.current, excerpt, publishedAt, year, categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent
  }
`);

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
*[_type == "article" && slug.current == $slug && publishedAt <= now()][0]{
  _id, title, "slug": slug.current, excerpt, publishedAt, year, categories, featured, inAtlas,
  "cover": cover{ alt, asset, crop, hotspot },
  "placeName": place->name,
  "continent": place->continent,
  body
}
`);

export const ARTICLE_SLUGS_QUERY = defineQuery(`
*[_type == "article" && defined(slug.current) && publishedAt <= now()].slug.current
`);

// Más categorías en común primero y, a igualdad, los más recientes. Nunca incluye el artículo actual.
export const RELATED_ARTICLES_QUERY = defineQuery(`
*[_type == "article" && _id != $id && publishedAt <= now()]{
  _id, title, "slug": slug.current, excerpt, publishedAt, year, categories,
  "cover": cover{ alt, asset, crop, hotspot },
  "placeName": place->name,
  "continent": place->continent,
  "shared": count(categories[@ in $categories])
} | order(shared desc, publishedAt desc)[0...$limit]
`);

export const ARTICLES_PAGE_QUERY = defineQuery(`
{
  "items": *[_type == "article" && publishedAt <= now() && ($category == null || $category in categories)]
    | order(publishedAt desc)[$from...$to]{
      _id, title, "slug": slug.current, excerpt, publishedAt, year, categories,
      "cover": cover{ alt, asset, crop, hotspot },
      "placeName": place->name,
      "continent": place->continent
    },
  "total": count(*[_type == "article" && publishedAt <= now() && ($category == null || $category in categories)])
}
`);

export const ATLAS_YEARS_QUERY = defineQuery(`
array::unique(*[_type == "article" && inAtlas == true && defined(place) && publishedAt <= now()].year)
`);

export const ATLAS_PINS_QUERY = defineQuery(`
*[_type == "article" && inAtlas == true && defined(place) && year == $year && publishedAt <= now()
  && ($category == null || $category in categories)
  && ($region == null || place->continent == $region)]
  | order(publishedAt desc){
    _id, title, "slug": slug.current, excerpt, categories,
    "placeName": place->name,
    "continent": place->continent,
    "lat": place->lat,
    "lng": place->lng
  }
`);
