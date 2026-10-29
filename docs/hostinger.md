# Hostinger

Notas de la prueba de humo (tarea 0.2). Se llenan al hacer el despliegue.

La prueba de humo se hizo en Vercel. Falta repetirla en Hostinger si el cliente va a alojar ahí.

- Versión de Node: v24.21.0 en Vercel (según `/api/health`)
- Dónde se configuran las variables: Vercel, proyecto → Settings → Environment Variables
- Duración de un despliegue: _pendiente_
- ¿Un push a `main` despliega solo?: sí en Vercel (el push de la Fase 1 lanzó un despliegue)

## URLs

- Sitio (Vercel, producción): https://twsu-two.vercel.app
- Studio: https://twsu.sanity.studio
- Proyecto Sanity: 9a1cr0st (dataset production)

## Webhook de Sanity (tarea 0.11)

El webhook ya está creado y probado contra https://twsu-two.vercel.app. Si el sitio cambia de dominio (por ejemplo a Hostinger), hay que actualizar la URL del webhook y el origen de CORS en sanity.io/manage → proyecto TWSU → API.

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
