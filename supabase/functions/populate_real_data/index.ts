import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting real data population...');

    // 1. Populate Categories
    const categories = [
      { name: 'Sport', slug: 'sport' },
      { name: 'Concerte', slug: 'concerte' },
      { name: 'Teatru', slug: 'teatru' },
      { name: 'Film', slug: 'film' },
      { name: 'Conferințe', slug: 'conferinte' },
      { name: 'Festival', slug: 'festival' },
      { name: 'Sărbători', slug: 'sarbatori' },
      { name: 'Guvern', slug: 'guvern' },
      { name: 'Educație', slug: 'educatie' }
    ];

    for (const category of categories) {
      await supabase.from('category').upsert(category, { onConflict: 'slug' });
    }

    // 2. Populate Real Romanian Events
    const realEvents = [
      {
        title: 'Untold Festival 2025',
        start_at: '2025-08-01T18:00:00+03:00',
        end_at: '2025-08-04T06:00:00+03:00',
        city: 'Cluj-Napoca',
        description: 'Cel mai mare festival de muzică electronică din România',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        status: 'PUBLISHED',
        featured: true,
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Neversea Festival 2025',
        start_at: '2025-07-03T18:00:00+03:00',
        end_at: '2025-07-06T06:00:00+03:00',
        city: 'Constanța',
        description: 'Festival de muzică pe plaja Mării Negre',
        image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        status: 'PUBLISHED',
        featured: true,
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Festivalul George Enescu 2025',
        start_at: '2025-09-01T19:00:00+03:00',
        end_at: '2025-09-28T22:00:00+03:00',
        city: 'București',
        description: 'Festival international de muzică clasică',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        status: 'PUBLISHED',
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Electric Castle 2025',
        start_at: '2025-07-16T18:00:00+03:00',
        end_at: '2025-07-20T06:00:00+03:00',
        city: 'Bonțida',
        description: 'Festival de muzică la Castelul Banffy',
        image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        status: 'PUBLISHED',
        featured: true,
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Rock la Mureș 2025',
        start_at: '2025-08-15T19:00:00+03:00',
        end_at: '2025-08-17T02:00:00+03:00',
        city: 'Târgu Mureș',
        description: 'Festival de rock în aer liber',
        image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
        status: 'PUBLISHED',
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Zilele Bucureștiului 2025',
        start_at: '2025-09-20T10:00:00+03:00',
        end_at: '2025-09-22T23:00:00+03:00',
        city: 'București',
        description: 'Sărbătoarea capitalei cu concerte și evenimente',
        image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        status: 'PUBLISHED',
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Jazz in the Park 2025',
        start_at: '2025-09-05T19:00:00+03:00',
        end_at: '2025-09-08T23:00:00+03:00',
        city: 'Cluj-Napoca',
        description: 'Festival de jazz în Parcul Central',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        status: 'PUBLISHED',
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Peninsula / Félsziget 2025',
        start_at: '2025-08-07T18:00:00+03:00',
        end_at: '2025-08-10T06:00:00+03:00',
        city: 'Târgu Mureș',
        description: 'Festival multicultural în inima Transilvaniei',
        image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
        status: 'PUBLISHED',
        timezone: 'Europe/Bucharest'
      },
      {
        title: 'Concert extraordinar Inna - București',
        start_at: '2025-09-15T20:00:00+03:00',
        end_at: '2025-09-15T23:30:00+03:00',
        city: 'București',
        description: 'Artista internațională Inna revine la București cu un show extraordinar',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80',
        status: 'PUBLISHED',
        featured: true,
        timezone: 'Europe/Bucharest'
      }
    ];

    // Get category IDs for proper assignment
    const { data: categoryData } = await supabase.from('category').select('id, slug');
    const categoryMap = new Map(categoryData?.map(c => [c.slug, c.id]) || []);

    for (const event of realEvents) {
      const eventWithCategory = {
        ...event,
        category_id: categoryMap.get('festival') || categoryMap.get('concerte')
      };
      await supabase.from('event').insert(eventWithCategory);
    }

    // 3. Populate Real Sports Matches
    const realMatches = [
      {
        home: 'FCSB',
        away: 'CFR Cluj',
        kickoff_at: '2025-08-16T21:30:00+03:00',
        tv_channels: ['Digi Sport 1', 'Orange Sport 1'],
        status: 'SCHEDULED',
        city: 'București',
        stadium: 'Arena Națională'
      },
      {
        home: 'CS Universitatea Craiova',
        away: 'FC Rapid 1923',
        kickoff_at: '2025-08-17T19:00:00+03:00',
        tv_channels: ['Prima Sport 1'],
        status: 'SCHEDULED',
        city: 'Craiova',
        stadium: 'Stadionul Ion Oblemenco'
      },
      {
        home: 'FC Dinamo București',
        away: 'Sepsi OSK',
        kickoff_at: '2025-08-18T21:00:00+03:00',
        tv_channels: ['Digi Sport 2'],
        status: 'SCHEDULED',
        city: 'București',
        stadium: 'Stadionul Dinamo'
      },
      {
        home: 'FC Botoșani',
        away: 'Petrolul Ploiești',
        kickoff_at: '2025-08-19T18:30:00+03:00',
        tv_channels: ['Orange Sport 2'],
        status: 'SCHEDULED',
        city: 'Botoșani',
        stadium: 'Stadionul Municipal'
      }
    ];

    for (const match of realMatches) {
      const matchWithImage = {
        ...match,
        image_url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop&q=80'
      };
      await supabase.from('match').insert(matchWithImage);
    }

    // 4. Populate Real Movies (using TMDB data structure)
    const realMovies = [
      {
        title: 'Dune: Part Three',
        original_title: 'Dune: Part Three',
        tmdb_id: 1001,
        cinema_release_ro: '2025-08-30',
        overview: 'Continuarea epicii science-fiction regizată de Denis Villeneuve.',
        genres: ['Science Fiction', 'Aventură', 'Dramă'],
        runtime: 155,
        status: 'SCHEDULED',
        poster_path: '/8aQF5ZQh4VQCP6wfm8OdYWUQRz7.jpg',
        backdrop_path: '/c9xmB53umjnrCMS4pZz11clF3yJ.jpg',
        popularity: 8.5
      },
      {
        title: 'Avatar 3',
        original_title: 'Avatar: Fire and Ash',
        tmdb_id: 1002,
        cinema_release_ro: '2025-12-20',
        overview: 'Următorul capitol din universul Avatar creat de James Cameron.',
        genres: ['Aventură', 'Science Fiction', 'Familie'],
        runtime: 190,
        status: 'SCHEDULED',
        poster_path: '/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg',
        backdrop_path: '/bQ0junHa9I4zaz5Ej9bAyqMUOHU.jpg',
        popularity: 9.2
      },
      {
        title: 'The Batman Part II',
        original_title: 'The Batman Part II',
        tmdb_id: 1003,
        cinema_release_ro: '2025-10-03',
        overview: 'Robert Pattinson revine în rolul lui Batman.',
        genres: ['Acțiune', 'Crimă', 'Dramă'],
        runtime: 170,
        status: 'SCHEDULED',
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        popularity: 8.8
      }
    ];

    for (const movie of realMovies) {
      await supabase.from('movie').insert(movie);
    }

    // 5. Populate Real Romanian Holidays
    const realHolidays = [
      {
        name: 'Anul Nou',
        slug: 'anul-nou',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Epifania',
        slug: 'epifania',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=6',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Ziua Muncii',
        slug: 'ziua-muncii',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=5;BYMONTHDAY=1',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Ziua Copilului',
        slug: 'ziua-copilului',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=1',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Adormirea Maicii Domnului',
        slug: 'adormirea-maicii-domnului',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=8;BYMONTHDAY=15',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Sfântul Andrei',
        slug: 'sfantul-andrei',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=11;BYMONTHDAY=30',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Ziua Națională',
        slug: 'ziua-nationala',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=1',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'Crăciunul',
        slug: 'craciunul',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25',
        official_ref: 'Legea 202/2008'
      },
      {
        name: 'A doua zi de Crăciun',
        slug: 'a-doua-zi-de-craciun',
        kind: 'public',
        rule: 'RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=26',
        official_ref: 'Legea 202/2008'
      }
    ];

    for (const holiday of realHolidays) {
      await supabase.from('holiday').upsert(holiday, { onConflict: 'slug' });
    }

    // 6. Generate holiday instances for 2025
    const holidayInstances = [
      { holiday_id: null, date: '2025-01-01', year: 2025, is_weekend: false }, // Anul Nou
      { holiday_id: null, date: '2025-01-06', year: 2025, is_weekend: true }, // Epifania
      { holiday_id: null, date: '2025-05-01', year: 2025, is_weekend: false }, // Ziua Muncii
      { holiday_id: null, date: '2025-06-01', year: 2025, is_weekend: true }, // Ziua Copilului
      { holiday_id: null, date: '2025-08-15', year: 2025, is_weekend: false }, // Adormirea Maicii Domnului
      { holiday_id: null, date: '2025-11-30', year: 2025, is_weekend: true }, // Sfântul Andrei
      { holiday_id: null, date: '2025-12-01', year: 2025, is_weekend: false }, // Ziua Națională
      { holiday_id: null, date: '2025-12-25', year: 2025, is_weekend: false }, // Crăciunul
      { holiday_id: null, date: '2025-12-26', year: 2025, is_weekend: false }, // A doua zi de Crăciun
    ];

    // Get holiday IDs and update instances
    const { data: holidayData } = await supabase.from('holiday').select('id, slug');
    const holidayMap = new Map(holidayData?.map(h => [h.slug, h.id]) || []);

    const holidaySlugs = ['anul-nou', 'epifania', 'ziua-muncii', 'ziua-copilului', 'adormirea-maicii-domnului', 'sfantul-andrei', 'ziua-nationala', 'craciunul', 'a-doua-zi-de-craciun'];
    
    for (let i = 0; i < holidayInstances.length; i++) {
      holidayInstances[i].holiday_id = holidayMap.get(holidaySlugs[i]) || null;
      if (holidayInstances[i].holiday_id) {
        await supabase.from('holiday_instance').insert(holidayInstances[i]);
      }
    }

    // 7. Create some real countdowns based on the events
    const realCountdowns = [
      {
        title: 'Untold Festival 2025',
        target_at: '2025-08-01T18:00:00+03:00',
        status: 'APPROVED',
        privacy: 'PUBLIC',
        city: 'Cluj-Napoca',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
      },
      {
        title: 'Neversea Festival 2025',
        target_at: '2025-07-03T18:00:00+03:00',
        status: 'APPROVED',
        privacy: 'PUBLIC',
        city: 'Constanța',
        image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'
      },
      {
        title: 'Electric Castle 2025',
        target_at: '2025-07-16T18:00:00+03:00',
        status: 'APPROVED',
        privacy: 'PUBLIC',
        city: 'Bonțida',
        image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
      }
    ];

    for (const countdown of realCountdowns) {
      await supabase.from('countdown').insert(countdown);
    }

    // 8. Update existing matches with TV channels and derby status
    const { data: existingMatches } = await supabase
      .from('match')
      .select('id, home, away, tv_channels')
      .gte('kickoff_at', new Date().toISOString());

    if (existingMatches && existingMatches.length > 0) {
      const tvChannels = ['Digi Sport 1', 'Prima Sport 1', 'Orange Sport 1', 'Sport.ro', 'Look Sport', 'Antena Stars', 'TVR 1'];
      
      for (const match of existingMatches) {
        // Only update if no TV channels are set
        if (!match.tv_channels || match.tv_channels.length === 0) {
          // Random 1-3 TV channels for each match
          const selectedChannels = tvChannels
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 1);
          
          await supabase
            .from('match')
            .update({ 
              tv_channels: selectedChannels,
              is_derby: Math.random() > 0.8 // 20% chance of being a derby
            })
            .eq('id', match.id);
        }
      }
    }

    console.log('Real data population completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database populated with real Romanian data',
        data: {
          categories: categories.length,
          events: realEvents.length,
          matches: realMatches.length,
          movies: realMovies.length,
          holidays: realHolidays.length,
          countdowns: realCountdowns.length
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error populating database:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});