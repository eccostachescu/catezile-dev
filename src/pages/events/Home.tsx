import { useState, useEffect } from "react";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

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

interface EventsSection {
  title: string;
  events: Event[];
}

export default function EventsHome() {
  const [sections, setSections] = useState<EventsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    month: '',
    timeframe: 'all'
  });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfWeekend = new Date(now);
      startOfWeekend.setDate(now.getDate() + (6 - now.getDay())); // Next Saturday
      
      const endOfWeekend = new Date(startOfWeekend);
      endOfWeekend.setDate(startOfWeekend.getDate() + 1); // Sunday
      endOfWeekend.setHours(23, 59, 59);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Weekend events
      const { data: weekendEvents } = await supabase
        .from('event')
        .select(`
          id, slug, title, subtitle, starts_at, ends_at, image_url,
          city:city_id(name, slug),
          venue:venue_id(name),
          category:category_id(name, slug)
        `)
        .eq('status', 'PUBLISHED')
        .gte('starts_at', startOfWeekend.toISOString())
        .lte('starts_at', endOfWeekend.toISOString())
        .order('starts_at')
        .limit(6);

      // This month events
      const { data: monthEvents } = await supabase
        .from('event')
        .select(`
          id, slug, title, subtitle, starts_at, ends_at, image_url,
          city:city_id(name, slug),
          venue:venue_id(name),
          category:category_id(name, slug)
        `)
        .eq('status', 'PUBLISHED')
        .gte('starts_at', startOfMonth.toISOString())
        .lte('starts_at', endOfMonth.toISOString())
        .order('starts_at')
        .limit(8);

      // Festivals
      const { data: festivalCategory } = await supabase
        .from('event_category')
        .select('id')
        .eq('slug', 'festival')
        .maybeSingle();

      const { data: festivals } = festivalCategory ? await supabase
        .from('event')
        .select(`
          id, slug, title, subtitle, starts_at, ends_at, image_url,
          city:city_id(name, slug),
          venue:venue_id(name),
          category:category_id(name, slug)
        `)
        .eq('status', 'PUBLISHED')
        .eq('category_id', festivalCategory.id)
        .gte('starts_at', now.toISOString())
        .order('starts_at')
        .limit(6) : { data: [] };

      // Curated events
      const { data: curatedEvents } = await supabase
        .from('event')
        .select(`
          id, slug, title, subtitle, starts_at, ends_at, image_url,
          city:city_id(name, slug),
          venue:venue_id(name),
          category:category_id(name, slug)
        `)
        .eq('status', 'PUBLISHED')
        .eq('curated', true)
        .gte('starts_at', now.toISOString())
        .order('starts_at')
        .limit(6);

      const newSections: EventsSection[] = [
        { title: "În weekend", events: weekendEvents || [] },
        { title: "Luna aceasta", events: monthEvents || [] },
        { title: "Festivaluri majore", events: festivals || [] },
        { title: "Recomandate", events: curatedEvents || [] }
      ].filter(section => section.events.length > 0);

      setSections(newSections);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Evenimente în România — Festivaluri, Concerte, Parade"
        description="Calendar actualizat: ce se întâmplă în orașul tău. Setează remindere și adaugă în calendar."
      />
      
      <Container className="py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Evenimente în România</h1>
          <p className="text-muted-foreground text-lg">
            Descoperă festivaluri, concerte, expoziții și alte evenimente din țara ta.
          </p>
        </header>

        <EventFilters filters={filters} onFiltersChange={setFilters} />

        <div className="space-y-12">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-64 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.title} className="space-y-6">
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {!loading && sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nu am găsit evenimente pentru criteriile selectate.</p>
          </div>
        )}
      </Container>
    </>
  );
}