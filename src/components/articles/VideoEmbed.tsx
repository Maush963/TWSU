import { uiText } from "@/content/ui-text";
import type { VideoEmbedData } from "@/lib/articles/video";

interface VideoEmbedProps {
  video: VideoEmbedData;
  caption?: string;
}

// Reproductor incrustado con la proporción de video reservada, para que no haya saltos de diseño.
export function VideoEmbed({ video, caption }: VideoEmbedProps) {
  return (
    <figure className="flex flex-col gap-2">
      <iframe
        src={video.embedUrl}
        title={caption || uiText.article.videoTitle}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="aspect-video w-full border-0"
      />
      {caption && <figcaption className="font-body text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
