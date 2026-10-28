# Hostinger

Notas de la prueba de humo (tarea 0.2). Se llenan al hacer el despliegue.

- Versión de Node: _pendiente_
- Dónde se configuran las variables: _pendiente_
- Duración de un despliegue: _pendiente_
- ¿Un push a `main` despliega solo?: _pendiente_

## URLs

- Sitio: _pendiente_
- Studio: https://twsu.sanity.studio
- Proyecto Sanity: 9a1cr0st (dataset production)

## Webhook de Sanity (tarea 0.11)

La ruta `/api/revalidate` ya está lista. El webhook se crea en sanity.io/manage → proyecto TWSU → API → Webhooks, cuando exista la URL pública (Vercel de prueba o Hostinger).

- Nombre: `Revalidar sitio`
- URL: `https://<dominio>/api/revalidate`
- Dataset: `production`
- Disparadores: create, update y delete
- Filtro: `_type in ["article", "place"]`
- Proyección: `{_type, "slug": slug.current}`
- Método HTTP: POST
- Borradores: desactivado (que no se dispare con borradores)
- Secret: el mismo valor de `SANITY_REVALIDATE_SECRET` en el entorno del sitio

Comportamiento: sin firma o con firma incorrecta responde 401; con firma válida pero sin `_type` de `article` o `place` responde 400; con todo correcto invalida la etiqueta y responde 200. Usa `revalidateTag(tipo, { expire: 0 })`, así la primera visita después de publicar ya ve el cambio.

Para comprobarlo: en el panel del webhook, la pestaña de intentos debe mostrar 200 al publicar un artículo.
