import { cn } from "@/lib/utils";

export default function TrailerEmbed({ youtubeKey, className }: { youtubeKey?: string | null; className?: string }) {
  if (!youtubeKey) return null;
  const src = `https://www.youtube.com/embed/${youtubeKey}`;
  return (
    <div className={cn("aspect-video w-full rounded-md overflow-hidden bg-muted", className)}>
      <iframe
        src={src}
        title="Trailer YouTube"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
