import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import ReminderButton from "@/components/ReminderButton";
import ActionsBar from "@/components/event/ActionsBar";
import TicketCTA from "@/components/event/TicketCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, ExternalLink, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  image_url?: string;
  official_url?: string;
  tickets_affiliate_link_id?: string;
  city?: { name: string; slug: string };
  venue?: { name: string; address?: string };
  category?: { name: string; slug: string };
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    if (slug) {
      loadEvent(slug);
    }
  }, [slug]);

  const loadEvent = async (eventSlug: string) => {
    console.log('🔍 Event component mounted with slug:', eventSlug);
    
    if (!eventSlug) {
      console.error('❌ No slug provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching for event with slug/id:', eventSlug);
      
      // First try to find by slug
      let { data: eventData, error } = await supabase
        .from('event')
        .select(`
          id, slug, title, subtitle, description, starts_at, ends_at, 
          image_url, official_url, tickets_affiliate_link_id,
          city:city_id(name, slug),
          venue:venue_id(name, address),
          category:category_id(name, slug)
        `)
        .eq('slug', eventSlug)
        .eq('status', 'PUBLISHED')
        .maybeSingle();

      console.log('🔍 Slug search result:', { data: eventData, error });

      // If not found by slug, try by ID (for events without slugs)
      if (!eventData && !error) {
        console.log('🔍 Trying by ID...');
        const { data: eventById, error: errorById } = await supabase
          .from('event')
          .select(`
            id, slug, title, subtitle, description, starts_at, ends_at, 
            image_url, official_url, tickets_affiliate_link_id,
            city:city_id(name, slug),
            venue:venue_id(name, address),
            category:category_id(name, slug)
          `)
          .eq('id', eventSlug)
          .eq('status', 'PUBLISHED')
          .maybeSingle();
        
        console.log('🔍 ID search result:', { data: eventById, error: errorById });
        eventData = eventById;
        error = errorById;
      }

      if (error || !eventData) {
        console.error('❌ Event not found:', error);
        return;
      } else {
        console.log('✅ Event found:', eventData);
      }

      setEvent(eventData);

      // Load related events (same city, within 7 days)
      if (eventData.city?.slug) {
        const eventDate = new Date(eventData.starts_at);
        const weekBefore = new Date(eventDate);
        weekBefore.setDate(eventDate.getDate() - 7);
        const weekAfter = new Date(eventDate);
        weekAfter.setDate(eventDate.getDate() + 7);

        const { data: related } = await supabase
          .from('event')
          .select(`
            id, slug, title, starts_at, image_url,
            city:city_id(name, slug),
            category:category_id(name, slug)
          `)
          .eq('status', 'PUBLISHED')
          .neq('id', eventData.id)
          .gte('starts_at', weekBefore.toISOString())
          .lte('starts_at', weekAfter.toISOString())
          .order('starts_at')
          .limit(3);

        setRelatedEvents(related || []);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Eveniment negăsit</h1>
          <p className="text-muted-foreground mb-6">
            Evenimentul căutat nu există sau nu este încă publicat.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm text-left mb-4">
            <div><strong>Debug Info:</strong></div>
            <div>Slug/ID searched: {slug}</div>
            <div>Loading state: {loading ? 'true' : 'false'}</div>
          </div>
          <Link to="/">
            <Button>Înapoi la pagina principală</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const now = new Date();
  const timeUntil = startDate.getTime() - now.getTime();
  const isUpcoming = timeUntil > 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const offers = event.tickets_affiliate_link_id ? [
    { id: event.tickets_affiliate_link_id, partner: 'Bilete', url: '#' }
  ] : undefined;

  return (
    <>
      <SEO 
        title={event.title}
        description={event.subtitle || `Eveniment în ${event.city?.name}: ${formatDate(startDate)} la ${formatTime(startDate)}`}
      />
      
      <Container className="py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <Badge variant="secondary">
                  {event.category.name}
                </Badge>
              )}
              {event.city && (
                <Badge variant="outline">
                  {event.city.name}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {event.title}
            </h1>

            {event.subtitle && (
              <p className="text-xl text-muted-foreground">
                {event.subtitle}
              </p>
            )}
          </header>

          {/* Hero Image */}
          {event.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Event Meta */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Când și unde?</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{formatDate(startDate)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(startDate)}
                    {endDate && ` – ${formatTime(endDate)}`}
                  </div>
                </div>
              </div>

              {(event.venue?.name || event.city?.name) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    {event.venue?.name && (
                      <div className="font-medium">{event.venue.name}</div>
                    )}
                    {event.venue?.address && (
                      <div className="text-sm text-muted-foreground">{event.venue.address}</div>
                    )}
                    {event.city?.name && (
                      <div className="text-sm text-muted-foreground">{event.city.name}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isUpcoming && (
              <div className="pt-4 border-t">
                <ActionsBar 
                  id={event.id}
                  kind="event"
                  title={event.title}
                  start={startDate}
                  end={endDate}
                />
              </div>
            )}
          </div>

          {/* Tickets */}
          {offers && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Bilete</h2>
              <TicketCTA offers={offers} />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="prose prose-gray max-w-none">
              <h2>Despre eveniment</h2>
              <div className="whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}

          {/* Official Links */}
          {event.official_url && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Surse oficiale</h2>
              <a
                href={event.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Site oficial
              </a>
            </div>
          )}

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Evenimente similare</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedEvents.map((relatedEvent) => (
                  <Link
                    key={relatedEvent.id}
                    to={`/evenimente/${relatedEvent.slug}`}
                    className="block bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium line-clamp-2 mb-2">
                      {relatedEvent.title}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(relatedEvent.starts_at).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}