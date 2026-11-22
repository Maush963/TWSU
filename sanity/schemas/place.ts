import { defineField, defineType } from "sanity";
import { CONTINENTS } from "../../src/lib/constants";

export const place = defineType({
  name: "place",
  title: "Lugar",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      description: "País o ciudad, como se mostrará en el atlas.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "countryCode",
      title: "Código de país (ISO de 2 letras)",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[A-Z]{2}$/, { name: "ISO2" })
          .error("Dos letras mayúsculas, por ejemplo MX"),
    }),
    defineField({
      name: "continent",
      title: "Continente",
      type: "string",
      options: { list: CONTINENTS.map(({ value, title }) => ({ value, title })), layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lat",
      title: "Latitud",
      description: "Grados decimales reales (como en Google Maps), de -90 a 90. Ejemplo: 19.4326",
      type: "number",
      validation: (rule) => rule.required().min(-90).max(90),
    }),
    defineField({
      name: "lng",
      title: "Longitud",
      description: "Grados decimales reales (como en Google Maps), de -180 a 180. Oeste es negativo. Ejemplo: -99.1332",
      type: "number",
      validation: (rule) => rule.required().min(-180).max(180),
    }),
    defineField({
      name: "kind",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { value: "country", title: "País" },
          { value: "city", title: "Ciudad" },
        ],
        layout: "radio",
      },
      initialValue: "country",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{ name: "byName", title: "Nombre", by: [{ field: "name", direction: "asc" }] }],
  preview: {
    select: { name: "name", continent: "continent", kind: "kind", countryCode: "countryCode" },
    prepare: ({ name, continent, kind, countryCode }) => {
      // En las ciudades el país va junto al nombre, para distinguir homónimos (Santiago, Córdoba).
      let country: string | undefined;
      try {
        country = countryCode ? new Intl.DisplayNames(["es"], { type: "region" }).of(countryCode) : undefined;
      } catch {
        country = countryCode;
      }
      return {
        title: kind === "city" && country ? `${name}, ${country}` : name,
        subtitle: [kind === "city" ? "Ciudad" : "País", CONTINENTS.find((item) => item.value === continent)?.title]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
