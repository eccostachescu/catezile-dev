import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const sampleEvents = [
  {
    title: "Festival de Film Transilvania",
    subtitle: "Ediția 2025",
    description: "Cel mai mare festival de film din România cu proiecții și premierii internaționale",
    category: "entertainment",
    city: "Cluj-Napoca",
    venue: "Cinema Florin Piersic",
    daysFromNow: 45,
    duration: 7,
    imageUrl: "https://images.unsplash.com/photo-1489599904782-b3e7e6b6e7f0?w=800&h=600&fit=crop"
  },
  {
    title: "Concertul Phoenix",
    subtitle: "Turneu Aniversar",
    description: "Concert aniversar al legendarei trupe Phoenix",
    category: "music",
    city: "București",
    venue: "Sala Palatului",
    daysFromNow: 30,
    duration: 1,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
  },
  {
    title: "Conferința TechHub România",
    subtitle: "Viitorul Tehnologiei",
    description: "Eveniment dedicat inovațiilor tehnologice și startup-urilor",
    category: "tech",
    city: "Timișoara",
    venue: "Hotel Continental",
    daysFromNow: 60,
    duration: 2,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop"
  },
  {
    title: "Maratonul Bucureștiului",
    subtitle: "Ediția 2025",
    description: "Competiție internațională de alergare prin centrul capitalei",
    category: "sport",
    city: "București",
    venue: "Piața Constituției",
    daysFromNow: 90,
    duration: 1,
    imageUrl: "https://images.unsplash.com/photo-1544619187-4d5ba4d9328b?w=800&h=600&fit=crop"
  },
  {
    title: "Târgul de Carte Bookfest",
    subtitle: "Ediția de primăvară",
    description: "Cel mai mare târg de carte din România cu lansări și întâlniri cu autori",
    category: "culture",
    city: "București",
    venue: "Romexpo",
    daysFromNow: 75,
    duration: 5,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting sample events population...");
    
    let successCount = 0;
    const results = [];

    for (const eventData of sampleEvents) {
      try {
        // Get category
        const { data: category } = await supabaseClient
          .from('event_category')
          .select('id')
          .eq('slug', eventData.category)
          .single();

        if (!category) {
          console.log(`Category not found: ${eventData.category}, skipping event`);
          continue;
        }

        // Get or create city
        let cityId = null;
        if (eventData.city) {
          const citySlug = slugify(eventData.city);
          let { data: city } = await supabaseClient
            .from('city')
            .select('id')
            .eq('slug', citySlug)
            .single();

          if (!city) {
            const { data: newCity } = await supabaseClient
              .from('city')
              .insert({
                slug: citySlug,
                name: eventData.city
              })
              .select()
              .single();
            city = newCity;
          }
          cityId = city?.id;
        }

        // Get or create venue
        let venueId = null;
        if (eventData.venue && cityId) {
          const venueSlug = slugify(eventData.venue);
          let { data: venue } = await supabaseClient
            .from('venue')
            .select('id')
            .eq('slug', venueSlug)
            .eq('city_id', cityId)
            .single();

          if (!venue) {
            const { data: newVenue } = await supabaseClient
              .from('venue')
              .insert({
                slug: venueSlug,
                name: eventData.venue,
                city_id: cityId
              })
              .select()
              .single();
            venue = newVenue;
          }
          venueId = venue?.id;
        }

        // Calculate dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + eventData.daysFromNow);
        startDate.setHours(19, 0, 0, 0); // Default to 7 PM

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + eventData.duration - 1);
        endDate.setHours(22, 0, 0, 0); // Default to 10 PM

        // Create event slug
        const eventSlug = slugify(`${eventData.title}-${startDate.getFullYear()}`);

        // Check if event already exists
        const { data: existing } = await supabaseClient
          .from('event')
          .select('id')
          .eq('slug', eventSlug)
          .single();

        if (existing) {
          console.log(`Event already exists: ${eventData.title}`);
          continue;
        }

        // Create event
        const { data: event, error: eventError } = await supabaseClient
          .from('event')
          .insert({
            slug: eventSlug,
            title: eventData.title,
            subtitle: eventData.subtitle,
            description: eventData.description,
            category_id: category.id,
            starts_at: startDate.toISOString(),
            ends_at: endDate.toISOString(),
            venue_id: venueId,
            city_id: cityId,
            image_url: eventData.imageUrl,
            status: 'PUBLISHED',
            city: eventData.city
          })
          .select()
          .single();

        if (eventError) {
          console.error(`Error creating event ${eventData.title}:`, eventError);
          results.push({ title: eventData.title, success: false, error: eventError.message });
        } else {
          console.log(`Created event: ${eventData.title}`);
          successCount++;
          results.push({ title: eventData.title, success: true, id: event.id });
        }

      } catch (error) {
        console.error(`Error processing event ${eventData.title}:`, error);
        results.push({ title: eventData.title, success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      created: successCount,
      total: sampleEvents.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in populate_sample_events:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});