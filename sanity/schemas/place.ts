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
      type: "number",
      validation: (rule) => rule.required().min(-90).max(90),
    }),
    defineField({
      name: "lng",
      title: "Longitud",
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
  preview: {
    select: { title: "name", continent: "continent" },
    prepare: ({ title, continent }) => ({
      title,
      subtitle: CONTINENTS.find((item) => item.value === continent)?.title,
    }),
  },
});
