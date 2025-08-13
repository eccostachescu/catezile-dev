import { Link } from "react-router-dom";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { MapPin, Clock, Bell } from "lucide-react";
import ReminderButton from "@/components/ReminderButton";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { fmtShortDate, fmtTime } from "@/lib/i18n/formats";
import { simpleCountdown } from "@/lib/i18n/countdown";

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  starts_at: string;
  ends_at?: string;
  image_url?: string;
  city?: { name: string; slug: string };
  venue?: { name: string };
  category?: { name: string; slug: string };
  tickets_affiliate_link_id?: string;
}

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const { t } = useI18n();
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  
  const dayMonth = fmtShortDate(event.starts_at);
  const time = fmtTime(event.starts_at);
  const countdownLabel = simpleCountdown(event.starts_at, event.ends_at || undefined);

  const formatLocation = () => {
    const parts = [];
    if (event.venue?.name) parts.push(event.venue.name);
    if (event.city?.name) parts.push(event.city.name);
    return parts.join(', ');
  };

  return (
    <article className={cn(
      "group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200",
      className
    )}>
      <Link to={`/evenimente/${event.slug}`} className="block">
        {event.image_url ? (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-background/90 rounded-lg p-3 text-center min-w-[60px]">
              <div className="text-lg font-bold leading-none">{dayMonth}</div>
              {countdownLabel !== 'încheiat' && (
                <div className="text-xs text-primary mt-1 font-medium">{countdownLabel}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{dayMonth}</div>
              {countdownLabel !== 'încheiat' && (
                <div className="text-sm text-primary font-medium">{countdownLabel}</div>
              )}
            </div>
          </div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          {event.category && (
            <Badge variant="secondary" className="text-xs">
              {event.category.name}
            </Badge>
          )}
          
          <Link to={`/evenimente/${event.slug}`}>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </Link>
          
          {event.subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{time}</span>
            {endDate && (
              <>
                <span>–</span>
                <span>{endDate.toLocaleTimeString('ro-RO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </>
            )}
          </div>
          
          {formatLocation() && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatLocation()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <ReminderButton 
            when={startDate}
            kind="event"
            entityId={event.id}
          />
          
          <Link to={`/evenimente/${event.slug}`}>
            <Button variant="outline" size="sm">
              {t('events.details')}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}