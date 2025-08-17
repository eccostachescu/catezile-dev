import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroSearchNew from "./HeroSearchNew";
import LiveNowSectionImproved from "./LiveNowSectionImproved";
import CardCountdown from "./CardCountdown";
import { RailWeekend } from "./RailWeekend";
import { TvNow } from "./TvNow";
import PopularShows from "@/components/tv/PopularShows";
import PopularSection from "@/components/home/PopularSection";
import TodayGrid from "@/components/home/TodayGrid";
import WeekAhead from "@/components/home/WeekAhead";
import TrendingRail from "@/components/home/TrendingRail";

interface PopularEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  image_url?: string;
  city?: string;
  category_name?: string;
  category_slug?: string;
  source?: string;
}

interface DatabaseEvent {
  id: string;
  title: string;
  slug?: string;
  starts_at: string;
  image_url?: string;
  city?: string;
  category_name?: string;
  category_slug?: string;
}

interface DatabaseMatch {
  id: string;
  home: string;
  away: string;
  kickoff_at: string;
  image_url?: string;
  slug?: string;
}

export default function NewHomepage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PopularEvent[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('popular');

  useEffect(() => {
    const fetchPopularEvents = async () => {
      try {
        console.log('🔍 Fetching popular events...');
        // Get popular countdowns (now with sample data that has images)
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { 
            limit: 12, 
            onlyWithImage: false, // We'll handle fallbacks in the component
            exclude_past: true // Exclude past events from popular section
          }
        });

        console.log('🔍 Popular countdowns response:', { data, error });

        if (error) {
          console.error('Error fetching popular events:', error);
          setEvents([]); // Set empty array on error to prevent crashes
          return;
        }

        console.log('🔍 Popular events data:', data);
        const eventData = data?.events || [];
        setEvents(eventData);
        console.log('🔍 Set events:', eventData.length);
      } catch (error) {
        console.error('Error in popular events fetch:', error);
        setEvents([]); // Set empty array on error to prevent crashes
      } finally {
        setLoading(false);
      }
    };

    const fetchWeekendEvents = async () => {
      try {
        const now = new Date();
        const nextSaturday = new Date(now);
        const daysUntilSaturday = (6 - now.getDay()) % 7;
        nextSaturday.setDate(now.getDate() + daysUntilSaturday);
        nextSaturday.setHours(0, 0, 0, 0);
        
        const nextSunday = new Date(nextSaturday);
        nextSunday.setDate(nextSaturday.getDate() + 1);
        nextSunday.setHours(23, 59, 59, 999);

        // Get weekend matches
        const { data: matches } = await supabase
          .from('match')
          .select('id, home, away, kickoff_at, image_url, slug')
          .gte('kickoff_at', nextSaturday.toISOString())
          .lte('kickoff_at', nextSunday.toISOString())
          .order('kickoff_at')
          .limit(8);

        // Get weekend events
        const { data: weekendEvs } = await supabase
          .from('event')
          .select('id, title, start_at, image_url, slug, city, category_id')
          .eq('status', 'PUBLISHED')
          .gte('start_at', nextSaturday.toISOString())
          .lte('start_at', nextSunday.toISOString())
          .order('start_at')
          .limit(8);

        // Transform and combine data
        const transformedMatches = (matches || []).map(match => ({
          id: match.id,
          title: `${match.home} vs ${match.away}`,
          slug: match.slug || `/sport/${match.id}`,
          startDate: match.kickoff_at,
          imageUrl: match.image_url,
          category: 'Sport',
          categorySlug: 'sport'
        }));

        const transformedEvents = (weekendEvs || []).map(event => ({
          id: event.id,
          title: event.title,
          slug: event.slug || `/evenimente/${event.id}`,
          startDate: event.start_at,
          imageUrl: event.image_url,
          location: event.city,
          category: 'Evenimente',
          categorySlug: 'evenimente'
        }));

        const allWeekendEvents = [...transformedMatches, ...transformedEvents]
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 12);

        setWeekendEvents(allWeekendEvents);
      } catch (error) {
        console.error('Error fetching weekend events:', error);
      }
    };

    fetchPopularEvents();
    fetchWeekendEvents();
  }, []);

  // Debug effect to log event data structure
  useEffect(() => {
    console.log('🔍 Events loaded:', events);
    console.log('🔍 First event structure:', events[0]);
    if (events.length > 0) {
      console.log('🔍 Event properties:', Object.keys(events[0]));
      console.log('🔍 Event slug:', events[0].slug);
      console.log('🔍 Event id:', events[0].id);
    }
  }, [events]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/cauta?q=${encodeURIComponent(query)}`;
    }
  };

  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    setLoading(true);

    try {
      let eventData: PopularEvent[] = [];

      switch (filter) {
        case 'popular':
          const { data: popularData } = await supabase.functions.invoke('popular_countdowns', {
            body: { 
              limit: 12, 
              onlyWithImage: false,
              exclude_past: true
            }
          });
          eventData = popularData?.events || [];
          break;

        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);

          const { data: todayEvents } = await supabase
            .from('event')
            .select('id, title, slug, start_at as starts_at, image_url, city, category_name, category_slug')
            .eq('status', 'PUBLISHED')
            .gte('start_at', today.toISOString())
            .lte('start_at', endOfToday.toISOString())
            .order('start_at')
            .limit(12);

          const { data: todayMatches } = await supabase
            .from('match')
            .select('id, home, away, kickoff_at, image_url, slug')
            .gte('kickoff_at', today.toISOString())
            .lte('kickoff_at', endOfToday.toISOString())
            .order('kickoff_at')
            .limit(12);

          const todayEventData: PopularEvent[] = (todayEvents || [] as DatabaseEvent[]).map(e => ({ 
            ...e, 
            source: 'event_api' as const 
          }));
          const todayMatchData: PopularEvent[] = (todayMatches || [] as DatabaseMatch[]).map(m => ({
            id: m.id,
            title: `${m.home} vs ${m.away}`,
            slug: m.slug || '',
            starts_at: m.kickoff_at,
            image_url: m.image_url,
            source: 'match_api' as const,
            category_slug: 'sport'
          }));
          
          eventData = [...todayEventData, ...todayMatchData]
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
            .slice(0, 12);
          break;

        case 'tomorrow':
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);

          const { data: tomorrowEvents } = await supabase
            .from('event')
            .select('id, title, slug, start_at as starts_at, image_url, city, category_name, category_slug')
            .eq('status', 'PUBLISHED')
            .gte('start_at', tomorrow.toISOString())
            .lte('start_at', endOfTomorrow.toISOString())
            .order('start_at')
            .limit(12);

          const { data: tomorrowMatches } = await supabase
            .from('match')
            .select('id, home, away, kickoff_at, image_url, slug')
            .gte('kickoff_at', tomorrow.toISOString())
            .lte('kickoff_at', endOfTomorrow.toISOString())
            .order('kickoff_at')
            .limit(12);

          const tomorrowEventData: PopularEvent[] = (tomorrowEvents || [] as DatabaseEvent[]).map(e => ({ 
            ...e, 
            source: 'event_api' as const 
          }));
          const tomorrowMatchData: PopularEvent[] = (tomorrowMatches || [] as DatabaseMatch[]).map(m => ({
            id: m.id,
            title: `${m.home} vs ${m.away}`,
            slug: m.slug || '',
            starts_at: m.kickoff_at,
            image_url: m.image_url,
            source: 'match_api' as const,
            category_slug: 'sport'
          }));
          
          eventData = [...tomorrowEventData, ...tomorrowMatchData]
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
            .slice(0, 12);
          break;

        case 'weekend':
          const now = new Date();
          const nextSaturday = new Date(now);
          const daysUntilSaturday = (6 - now.getDay()) % 7;
          nextSaturday.setDate(now.getDate() + daysUntilSaturday);
          nextSaturday.setHours(0, 0, 0, 0);
          
          const nextSunday = new Date(nextSaturday);
          nextSunday.setDate(nextSaturday.getDate() + 1);
          nextSunday.setHours(23, 59, 59, 999);

          const { data: weekendEvs } = await supabase
            .from('event')
            .select('id, title, slug, start_at as starts_at, image_url, city, category_name, category_slug')
            .eq('status', 'PUBLISHED')
            .gte('start_at', nextSaturday.toISOString())
            .lte('start_at', nextSunday.toISOString())
            .order('start_at')
            .limit(12);

          const { data: weekendMatches } = await supabase
            .from('match')
            .select('id, home, away, kickoff_at, image_url, slug')
            .gte('kickoff_at', nextSaturday.toISOString())
            .lte('kickoff_at', nextSunday.toISOString())
            .order('kickoff_at')
            .limit(12);

          const weekendEventData: PopularEvent[] = (weekendEvs || [] as DatabaseEvent[]).map(e => ({ 
            ...e, 
            source: 'event_api' as const 
          }));
          const weekendMatchData: PopularEvent[] = (weekendMatches || [] as DatabaseMatch[]).map(m => ({
            id: m.id,
            title: `${m.home} vs ${m.away}`,
            slug: m.slug || '',
            starts_at: m.kickoff_at,
            image_url: m.image_url,
            source: 'match_api' as const,
            category_slug: 'sport'
          }));
          
          eventData = [...weekendEventData, ...weekendMatchData]
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
            .slice(0, 12);
          break;

        case 'month':
          const monthNow = new Date();
          const startOfMonth = new Date(monthNow.getFullYear(), monthNow.getMonth(), 1);
          const endOfMonth = new Date(monthNow.getFullYear(), monthNow.getMonth() + 1, 0, 23, 59, 59, 999);

          const { data: monthEvents } = await supabase
            .from('event')
            .select('id, title, slug, start_at as starts_at, image_url, city, category_name, category_slug')
            .eq('status', 'PUBLISHED')
            .gte('start_at', startOfMonth.toISOString())
            .lte('start_at', endOfMonth.toISOString())
            .order('start_at')
            .limit(12);

          const { data: monthMatches } = await supabase
            .from('match')
            .select('id, home, away, kickoff_at, image_url, slug')
            .gte('kickoff_at', startOfMonth.toISOString())
            .lte('kickoff_at', endOfMonth.toISOString())
            .order('kickoff_at')
            .limit(12);

          const monthEventData: PopularEvent[] = (monthEvents || [] as DatabaseEvent[]).map(e => ({ 
            ...e, 
            source: 'event_api' as const 
          }));
          const monthMatchData: PopularEvent[] = (monthMatches || [] as DatabaseMatch[]).map(m => ({
            id: m.id,
            title: `${m.home} vs ${m.away}`,
            slug: m.slug || '',
            starts_at: m.kickoff_at,
            image_url: m.image_url,
            source: 'match_api' as const,
            category_slug: 'sport'
          }));
          
          eventData = [...monthEventData, ...monthMatchData]
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
            .slice(0, 12);
          break;

        default:
          // Fallback to popular
          const { data: defaultData } = await supabase.functions.invoke('popular_countdowns', {
            body: { 
              limit: 12, 
              onlyWithImage: false,
              exclude_past: true
            }
          });
          eventData = defaultData?.events || [];
      }

      setEvents(eventData);
    } catch (error) {
      console.error('Error filtering events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReminderClick = (eventId: string) => {
    console.log('Reminder clicked for event:', eventId);
    // Implement reminder functionality
  };

  const handleCardClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      // Debug logging to see what we have
      console.log('Clicking event:', event);
      console.log('Event source:', event.source);
      console.log('Event category:', event.category_slug);
      
      // Route based on event source/type
      let path;
      if (event.source === 'match_api' || event.category_slug === 'sport') {
        // Sports matches go to /sport/ route
        path = `/sport/${event.slug || eventId}`;
      } else if (event.source === 'movie_api' || event.category_slug === 'filme') {
        // Movies go to /filme/ route  
        path = `/filme/${event.slug || eventId}`;
      } else {
        // Regular events go to /evenimente/ route
        path = `/evenimente/${event.slug || eventId}`;
      }
      
      console.log('Navigating to:', path);
      navigate(path);
    } else {
      console.error('Event not found for ID:', eventId);
    }
  };

  return (
    <main>

      {/* Hero Section with Search */}
      <HeroSearchNew 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
      />
      
      {/* Live Now Section - updates every minute */}
      <LiveNowSectionImproved 
        onCardClick={handleCardClick}
        onReminderClick={handleReminderClick}
      />

      {/* Popular Section */}
      <PopularSection />

      {/* Today Grid */}
      <TodayGrid />

      {/* Week Ahead */}
      <WeekAhead trending={events} />

      {/* Trending Rail */}
      <TrendingRail />

    </main>
  );
}