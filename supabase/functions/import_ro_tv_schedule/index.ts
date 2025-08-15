import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TVMazeShow {
  id: number;
  name: string;
  summary?: string;
  image?: {
    medium?: string;
    original?: string;
  };
  network?: {
    name: string;
    country?: {
      name: string;
      code: string;
    };
  };
  genres?: string[];
}

interface TVMazeEpisode {
  id: number;
  name?: string;
  season?: number;
  number?: number;
  airdate?: string;
  airstamp?: string;
  runtime?: number;
  summary?: string;
  image?: {
    medium?: string;
    original?: string;
  };
  show: TVMazeShow;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Romanian TV schedule import...');

    // Get today and next 7 days
    const dates = [];
    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    let totalImported = 0;

    for (const date of dates) {
      console.log(`Fetching schedule for ${date}...`);
      
      try {
        // Fetch Romanian TV schedule from TVMaze
        const response = await fetch(`https://api.tvmaze.com/schedule?country=RO&date=${date}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch schedule for ${date}: ${response.status}`);
          continue;
        }

        const episodes: TVMazeEpisode[] = await response.json();
        console.log(`Found ${episodes.length} episodes for ${date}`);

        for (const episode of episodes) {
          if (!episode.airstamp || !episode.show) continue;

          // Convert airstamp to Europe/Bucharest timezone
          const startsAt = new Date(episode.airstamp);
          
          // Create a unique title for the episode
          const episodeTitle = episode.name 
            ? `${episode.show.name} - ${episode.name}${episode.season && episode.number ? ` (S${episode.season}E${episode.number})` : ''}`
            : episode.show.name;

          const subtitle = episode.summary 
            ? episode.summary.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
            : `${episode.show.genres?.join(', ') || ''} • ${episode.show.network?.name || ''}`;

// Upsert show data
          const { error: showError } = await supabase
            .from('tvmaze_show')
            .upsert({
              tvmaze_id: episode.show.id,
              name: episode.show.name,
              status: episode.show.status || 'Running',
              language: episode.show.language || 'Romanian',
              genres: episode.show.genres || [],
              network: episode.show.network || {},
              official_site: episode.show.officialSite,
              premiered: episode.show.premiered ? new Date(episode.show.premiered) : null
            }, { 
              onConflict: 'tvmaze_id',
              ignoreDuplicates: false 
            });

          if (showError) {
            console.error(`Error inserting show ${episode.show.id}:`, showError);
            continue;
          }

          // Upsert episode data
          const { error: episodeError } = await supabase
            .from('tvmaze_episode')
            .upsert({
              tvmaze_episode_id: episode.id,
              tvmaze_show_id: episode.show.id,
              season: episode.season,
              number: episode.number,
              name: episode.name,
              airdate: episode.airdate ? new Date(episode.airdate) : null,
              airtime: episode.airtime,
              airstamp: startsAt.toISOString(),
              runtime: episode.runtime,
              summary: episode.summary?.replace(/<[^>]*>/g, ''),
              image: episode.image || {},
              network_name: episode.show.network?.name || 'Necunoscut'
            }, { 
              onConflict: 'tvmaze_episode_id',
              ignoreDuplicates: false 
            });

          if (episodeError) {
            console.error(`Error inserting episode ${episode.id}:`, episodeError);
            continue;
          }

          // Check if event already exists for this episode
          const { data: existingEvent } = await supabase
            .from('event')
            .select('id')
            .eq('tvmaze_episode_id', episode.id)
            .single();

          if (!existingEvent) {
            // Create event for countdown
            const { error: eventError } = await supabase
              .from('event')
              .insert({
                title: episodeTitle,
                description: episode.summary?.replace(/<[^>]*>/g, '') || episode.show.summary?.replace(/<[^>]*>/g, ''),
                start_at: startsAt.toISOString(),
                status: 'PUBLISHED',
                tvmaze_episode_id: episode.id,
                network: episode.show.network?.name,
                season: episode.season,
                episode: episode.number,
                series_name: episode.show.name,
                image_url: episode.image?.original || episode.show.image?.original,
                city: 'România',
                country: 'RO'
              });

            if (eventError) {
              console.error(`Error creating event for episode ${episode.id}:`, eventError);
            }
          }

          // Insert or update TV program
          const { error } = await supabase
            .from('tv_program')
            .upsert({
              external_id: `tvmaze_${episode.id}`,
              title: episodeTitle,
              subtitle: subtitle,
              starts_at: startsAt.toISOString(),
              duration_minutes: episode.runtime || 30,
              channel_name: episode.show.network?.name || 'Necunoscut',
              show_name: episode.show.name,
              season: episode.season,
              episode_number: episode.number,
              description: episode.summary?.replace(/<[^>]*>/g, '') || episode.show.summary?.replace(/<[^>]*>/g, ''),
              image_url: episode.image?.original || episode.show.image?.original,
              genres: episode.show.genres || [],
              source: 'tvmaze'
            }, { 
              onConflict: 'external_id',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error(`Error inserting episode ${episode.id}:`, error);
          } else {
            totalImported++;
          }
        }

        // Rate limiting - TVMaze allows ≥20 calls/10s
        if (dates.indexOf(date) < dates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s delay between days
        }

      } catch (error) {
        console.error(`Error processing date ${date}:`, error);
      }
    }

    console.log(`Import completed. Total episodes imported/updated: ${totalImported}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${totalImported} episodes from Romanian TV schedule`,
        dates_processed: dates.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in import_ro_tv_schedule:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to import TV schedule', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});