import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestImageRequest {
  eventId: string;
  imageUrl: string;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { eventId, imageUrl, reason }: SuggestImageRequest = await req.json();

    if (!eventId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Event ID and image URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Insert suggestion
    const { data, error } = await supabase
      .from('event_image_suggestion')
      .insert({
        event_id: eventId,
        suggested_image_url: imageUrl,
        suggested_by: user?.id || null,
        reason: reason || null,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating suggestion:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create image suggestion' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestion: data,
        message: 'Image suggestion submitted for admin review'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest_image function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);