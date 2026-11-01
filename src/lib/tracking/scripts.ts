/** Identificadores que entrega el cliente. Cada uno puede faltar. */
export interface TrackingIds {
  google?: string | undefined;
  meta?: string | undefined;
  tiktok?: string | undefined;
}

/** Un script listo para `next/script`: o carga un archivo (`src`) o trae su código (`code`). */
export interface TrackingScript {
  id: string;
  src?: string;
  code?: string;
}

// Formatos de cada servicio. Un valor que no coincide se descarta: nunca llega al código de la página.
const GOOGLE_GTAG_ID = /^(G|GT|AW)-[A-Z0-9]{4,20}$/;
const GOOGLE_GTM_ID = /^GTM-[A-Z0-9]{4,10}$/;
const META_PIXEL_ID = /^\d{8,20}$/;
const TIKTOK_PIXEL_ID = /^[A-Z0-9]{10,30}$/;

// Los identificadores ya pasaron la validación; `JSON.stringify` los escribe como texto entre comillas.
const text = (value: string) => JSON.stringify(value);

function googleScripts(id: string): TrackingScript[] {
  if (GOOGLE_GTM_ID.test(id)) {
    return [
      {
        id: "google-tag-manager",
        code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer",${text(id)});`,
      },
    ];
  }
  if (GOOGLE_GTAG_ID.test(id)) {
    return [
      { id: "google-tag-library", src: `https://www.googletagmanager.com/gtag/js?id=${id}` },
      {
        id: "google-tag",
        code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config",${text(id)});`,
      },
    ];
  }
  return [];
}

function metaScripts(id: string): TrackingScript[] {
  if (!META_PIXEL_ID.test(id)) return [];
  return [
    {
      id: "meta-pixel",
      code: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init",${text(id)});fbq("track","PageView");`,
    },
  ];
}

function tiktokScripts(id: string): TrackingScript[] {
  if (!TIKTOK_PIXEL_ID.test(id)) return [];
  return [
    {
      id: "tiktok-pixel",
      code: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(${text(id)});ttq.page()}(window,document,"ttq");`,
    },
  ];
}

/** Scripts de medición a cargar según los identificadores válidos. Sin ninguno, la lista queda vacía. */
export function buildTrackingScripts({ google, meta, tiktok }: TrackingIds): TrackingScript[] {
  return [
    ...(google ? googleScripts(google.trim()) : []),
    ...(meta ? metaScripts(meta.trim()) : []),
    ...(tiktok ? tiktokScripts(tiktok.trim()) : []),
  ];
}
