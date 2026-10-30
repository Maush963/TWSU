import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { VideoEmbed } from "@/components/articles/VideoEmbed";
import { parseImageRef } from "@/lib/articles/body-image";
import { getStandaloneVideo, parseVideoUrl } from "@/lib/articles/video";
import { urlFor } from "@/lib/sanity/image";

interface BodyImage {
  asset?: { _ref?: string };
  alt?: string;
}

// Tamaño de reserva si la referencia de la imagen no trae el suyo.
const FALLBACK_SIZE = { width: 1200, height: 800 };

const components: PortableTextComponents = {
  block: {
    // Un párrafo que es solo un enlace de YouTube o Vimeo se muestra como video.
    normal: ({ children, value }) => {
      const video = getStandaloneVideo(value);
      return video ? <VideoEmbed video={video} /> : <p className="font-body leading-relaxed">{children}</p>;
    },
    h2: ({ children }) => <h2 className="font-display text-xl text-accent">{children}</h2>,
    h3: ({ children }) => <h3 className="font-display text-lg text-accent">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6 font-body">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-6 font-body">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-accent underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: BodyImage }) => {
      const ref = value.asset?._ref;
      if (!ref) return null;
      const { width, height } = parseImageRef(ref) ?? FALLBACK_SIZE;
      return (
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt ?? ""}
          width={width}
          height={height}
          sizes="(min-width: 64rem) 46rem, 100vw"
          className="h-auto w-full"
        />
      );
    },
    // Bloque "Video" del Studio. Si el enlace no es válido se ignora en lugar de romper el artículo.
    videoEmbed: ({ value }: { value: { url?: string; caption?: string } }) => {
      const video = value.url ? parseVideoUrl(value.url) : null;
      return video ? <VideoEmbed video={video} {...(value.caption ? { caption: value.caption } : {})} /> : null;
    },
  },
  // Un tipo de bloque que el render no conoce se ignora en lugar de romper el artículo.
  unknownType: () => null,
  unknownBlockStyle: ({ children }) => <p className="font-body leading-relaxed">{children}</p>,
};

export function ArticleBody({ body }: { body: PortableTextBlock[] }) {
  return (
    <div className="article-body flex flex-col gap-6 border-l border-gold pl-4 lg:pl-16">
      <PortableText value={body} components={components} />
    </div>
  );
}
