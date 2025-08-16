import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";
import { SuggestImageModal } from "@/components/SuggestImageModal";

export default function EventHero({
  title,
  category,
  city,
  imageUrl,
  updatedAt,
  className,
  eventId,
}: {
  title: string;
  category?: string;
  city?: string | null;
  imageUrl?: string | null;
  updatedAt?: string | Date | null;
  className?: string;
  eventId?: string;
}) {
  const updated = updatedAt ? new Date(updatedAt) : null;
  return (
    <header className={cn("mb-6", className)}>
      <div className="flex items-center gap-2 mb-2">
        {category && <Badge>{category}</Badge>}
        {updated && (
          <span className="text-xs text-muted-foreground">verificat pe {updated.toLocaleDateString("ro-RO")}</span>
        )}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{title}</h1>
      {(imageUrl) && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt={`${title}${city ? ` în ${city}` : ""}`}
            loading="lazy"
            className="w-full max-h-72 object-cover rounded-md"
          />
          {eventId && (
            <div className="mt-2 flex justify-end">
              <SuggestImageModal eventId={eventId} eventTitle={title} />
            </div>
          )}
        </div>
      )}
      {city && (
        <div className="mt-2 text-sm text-muted-foreground">{city}</div>
      )}
    </header>
  );
}
