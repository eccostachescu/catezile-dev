import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  eventId: string;
  action: 'APPROVE' | 'REJECT' | 'MERGE';
  reason?: string;
  mergeIntoId?: string;
}

function generateSeoTitle(title: string, city?: string, date?: string): string {
  const parts = [title];
  if (city) parts.push(city);
  if (date) {
    const eventDate = new Date(date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('ro-RO', { month: 'long' });
    parts.push(`${day} ${month}`);
  }
  return parts.join(' — ');
}

function generateSeoDescription(title: string, venue?: string, city?: string): string {
  let desc = `Tot ce trebuie să știi despre ${title}`;
  if (venue) desc += ` la ${venue}`;
  if (city) desc += `, ${city}`;
  desc += ': data, ora, bilete și cum ajungi. Setează reminder și adaugă în calendar.';
  return desc;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const request: ModerationRequest = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('event')
      .select(`
        *,
        city:city_id(name),
        venue:venue_id(name)
      `)
      .eq('id', request.eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updateData: any = {
      moderator_id: user.id,
      moderation_notes: request.reason
    };

    if (request.action === 'APPROVE') {
      // Generate SEO fields
      const seoTitle = generateSeoTitle(
        event.title, 
        event.city?.name, 
        event.starts_at
      );
      const seoDescription = generateSeoDescription(
        event.title,
        event.venue?.name,
        event.city?.name
      );

      updateData = {
        ...updateData,
        status: 'PUBLISHED',
        seo_title: seoTitle,
        seo_description: seoDescription
      };

      // Update search index
      await supabaseClient
        .from('search_index')
        .upsert({
          entity_id: event.id,
          kind: 'event',
          title: event.title,
          subtitle: event.subtitle,
          slug: event.slug,
          when_at: event.starts_at,
          search_text: `${event.title} ${event.subtitle || ''} ${event.description || ''}`,
          category_slug: event.category_id,
          popularity: 0
        });

    } else if (request.action === 'REJECT') {
      updateData.status = 'REJECTED';
    } else if (request.action === 'MERGE' && request.mergeIntoId) {
      // Copy useful fields to target event
      const { data: targetEvent } = await supabaseClient
        .from('event')
        .select('*')
        .eq('id', request.mergeIntoId)
        .single();

      if (targetEvent) {
        // Update target with missing info
        const mergeData: any = {};
        if (!targetEvent.description && event.description) mergeData.description = event.description;
        if (!targetEvent.image_url && event.image_url) mergeData.image_url = event.image_url;
        if (!targetEvent.official_url && event.official_url) mergeData.official_url = event.official_url;

        if (Object.keys(mergeData).length > 0) {
          await supabaseClient
            .from('event')
            .update(mergeData)
            .eq('id', request.mergeIntoId);
        }
      }

      updateData.status = 'REJECTED';
      updateData.moderation_notes = `Merged into event ${request.mergeIntoId}. ${request.reason || ''}`;
    }

    // Update event
    const { error: updateError } = await supabaseClient
      .from('event')
      .update(updateData)
      .eq('id', request.eventId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: "Failed to update event" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log moderation action
    await supabaseClient
      .from('event_moderation_log')
      .insert({
        event_id: request.eventId,
        action: request.action,
        actor: user.id,
        reason: request.reason
      });

    // If approved, ping sitemaps and search
    if (request.action === 'APPROVE') {
      try {
        await supabaseClient.functions.invoke('ping_sitemaps');
        await supabaseClient.functions.invoke('indexnow_submit', {
          body: { urls: [`/evenimente/${event.slug}`] }
        });
      } catch (error) {
        console.log('Failed to ping external services:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Event ${request.action.toLowerCase()}d successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in events_moderate:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});