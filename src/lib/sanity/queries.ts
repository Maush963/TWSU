import { defineQuery } from "next-sanity";

// Todas filtran publishedAt <= now(). Los parámetros opcionales llegan como null.
// `bodyText` solo trae el texto cuando el artículo no tiene descripción: sirve de descripción de respaldo.
// Las proyecciones se repiten a propósito: TypeGen necesita consultas sin interpolar.

// Sin categoría, el más reciente marcado como destacado en "perspectives". Con categoría, el más
// reciente marcado de esa categoría y, si ninguno lo está, el más reciente de ella.
export const FEATURED_ARTICLE_QUERY = defineQuery(`
*[_type == "article" && publishedAt <= now()
  && (($category == null && perspectivesFeatured == true) || ($category != null && $category in categories))]
  | order(coalesce(perspectivesFeatured, false) desc, publishedAt desc)[0]{
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories, perspectivesFeatured, inAtlas,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent,
    body
  }
`);

// Los dos grandes de la Home: el marcado en cada interruptor (el más reciente si hubiera varios).
export const HOME_LARGE_QUERY = defineQuery(`
{
  "first": *[_type == "article" && publishedAt <= now() && homeLarge1 == true] | order(publishedAt desc)[0]{
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent
  },
  "second": *[_type == "article" && publishedAt <= now() && homeLarge2 == true] | order(publishedAt desc)[0]{
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent
  }
}
`);

// Los pequeños de la Home: los marcados, del más reciente al más antiguo, sin los grandes.
export const HOME_SMALL_QUERY = defineQuery(`
*[_type == "article" && publishedAt <= now() && homeSmall == true && !(_id in $excludeIds)]
  | order(publishedAt desc)[0...$limit]{
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent
  }
`);

export const RECENT_ARTICLES_QUERY = defineQuery(`
*[_type == "article" && publishedAt <= now() && !(_id in $excludeIds)]
  | order(publishedAt desc)[0...$limit]{
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent
  }
`);

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
*[_type == "article" && slug.current == $slug && publishedAt <= now()][0]{
  _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories, perspectivesFeatured, inAtlas,
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
  _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
  "cover": cover{ alt, asset, crop, hotspot },
  "placeName": place->name,
  "continent": place->continent,
  "shared": count(categories[@ in $categories])
} | order(shared desc, publishedAt desc)[0...$limit]
`);

export const ARTICLES_PAGE_QUERY = defineQuery(`
{
  "items": *[_type == "article" && publishedAt <= now() && ($category == null || $category in categories) && ($excludeId == null || _id != $excludeId)]
    | order(publishedAt desc)[$from...$to]{
      _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), publishedAt, year, categories,
      "cover": cover{ alt, asset, crop, hotspot },
      "placeName": place->name,
      "continent": place->continent
    },
  "total": count(*[_type == "article" && publishedAt <= now() && ($category == null || $category in categories) && ($excludeId == null || _id != $excludeId)])
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
    _id, title, "slug": slug.current, excerpt,
    "bodyText": select(defined(excerpt) && excerpt != "" => null, pt::text(body)), categories,
    "cover": cover{ alt, asset, crop, hotspot },
    "placeName": place->name,
    "continent": place->continent,
    "lat": place->lat,
    "lng": place->lng
  }
`);
