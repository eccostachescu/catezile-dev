import { formatEventDate } from "@/lib/safe-date";
import { useState, useEffect } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import CountdownTimer from "@/components/CountdownTimer";
import FollowButton from "@/components/FollowButton";
import ReminderButton from "@/components/ReminderButton";
import AffiliateButton from "@/components/AffiliateButton";
import { getEventImageSmart } from "@/lib/images";

export interface EventCardProps {
  id?: string;
  title: string;
  datetime: Date | string | number;
  category?: string;
  affiliateUrl?: string;
  kind?: 'event' | 'match' | 'movie' | 'countdown';
  imageUrl?: string;
}

export default function EventCard({ id, title, datetime, category, affiliateUrl, kind = 'event', imageUrl }: EventCardProps) {
  const date = new Date(datetime);
  const [eventImage, setEventImage] = useState<string | null>(imageUrl || null);
  
  useEffect(() => {
    if (!imageUrl) {
      getEventImageSmart({ title, category }).then(setEventImage);
    }
  }, [title, category, imageUrl]);

  return (
    <Card className="hover-scale overflow-hidden">
      {eventImage && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={eventImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {category && (
              <Badge variant="secondary" className="mb-2 bg-background/90 text-foreground">
                {category}
              </Badge>
            )}
            <CardTitle className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">
              {title}
            </CardTitle>
          </div>
        </div>
      )}
      
      <CardHeader className={eventImage ? "pb-2" : ""}>
        {!eventImage && (
          <>
            <div className="flex items-center gap-2">
              {category && <Badge>{category}</Badge>}
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
          </>
        )}
        <CardDescription>
          {formatEventDate(datetime)} • Timp rămas mai jos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CountdownTimer target={date} />
        <div className="flex flex-wrap gap-2">
          <FollowButton />
          <ReminderButton when={date} kind={kind} entityId={id} />
          {affiliateUrl && <AffiliateButton href={affiliateUrl}>Cumpără bilete</AffiliateButton>}
        </div>
      </CardContent>
    </Card>
  );
}
