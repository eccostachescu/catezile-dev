import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { securityShield, validateTurnstile } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventSubmission {
  title: string;
  subtitle?: string;
  description?: string;
  categorySlug: string;
  date: string;
  timeStart: string;
  timeEnd?: string;
  citySlug?: string;
  venueName?: string;
  address?: string;
  officialUrl?: string;
  imageUrl?: string;
  turnstile_token?: string;
  honeypot?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  // Apply security shield
  const securityCheck = await securityShield(req, supabaseClient, 'events_submit');
  if (securityCheck) return securityCheck;

  try {

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submission: EventSubmission = await req.json();

    // Check honeypot
    if (submission.honeypot) {
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify Turnstile token
    if (!await validateTurnstile(submission.turnstile_token || '')) {
      return new Response(JSON.stringify({ error: "Security verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create category
    const { data: category } = await supabaseClient
      .from('event_category')
      .select('id')
      .eq('slug', submission.categorySlug)
      .single();

    if (!category) {
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create city
    let cityId = null;
    if (submission.citySlug) {
      let { data: city } = await supabaseClient
        .from('city')
        .select('id')
        .eq('slug', submission.citySlug)
        .single();

      if (!city && submission.citySlug) {
        const { data: newCity } = await supabaseClient
          .from('city')
          .insert({
            slug: submission.citySlug,
            name: submission.citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          })
          .select()
          .single();
        city = newCity;
      }
      cityId = city?.id;
    }

    // Get or create venue
    let venueId = null;
    if (submission.venueName && cityId) {
      const venueSlug = slugify(submission.venueName);
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
            name: submission.venueName,
            address: submission.address,
            city_id: cityId
          })
          .select()
          .single();
        venue = newVenue;
      }
      venueId = venue?.id;
    }

    // Create start/end dates
    const startDate = new Date(`${submission.date}T${submission.timeStart}:00+02:00`);
    const endDate = submission.timeEnd 
      ? new Date(`${submission.date}T${submission.timeEnd}:00+02:00`)
      : null;

    // Create event slug
    const eventSlug = slugify(`${submission.title}-${submission.date}`);

    // Check for duplicates
    const { data: existingEvents } = await supabaseClient
      .from('event')
      .select('id, title')
      .eq('slug', eventSlug)
      .limit(1);

    let finalSlug = eventSlug;
    if (existingEvents && existingEvents.length > 0) {
      finalSlug = `${eventSlug}-${Date.now()}`;
    }

    // Create event
    const { data: event, error: eventError } = await supabaseClient
      .from('event')
      .insert({
        slug: finalSlug,
        title: submission.title,
        subtitle: submission.subtitle,
        description: submission.description,
        category_id: category.id,
        starts_at: startDate.toISOString(),
        ends_at: endDate?.toISOString(),
        venue_id: venueId,
        city_id: cityId,
        official_url: submission.officialUrl,
        image_url: submission.imageUrl,
        status: 'PENDING',
        submitted_by: user.id
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return new Response(JSON.stringify({ error: "Failed to create event" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log submission
    await supabaseClient
      .from('event_moderation_log')
      .insert({
        event_id: event.id,
        action: 'SUBMIT',
        actor: user.id
      });

    return new Response(JSON.stringify({ 
      success: true, 
      eventId: event.id,
      message: "Evenimentul a fost trimis pentru moderare. Vei fi notificat când va fi aprobat." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in events_submit:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});