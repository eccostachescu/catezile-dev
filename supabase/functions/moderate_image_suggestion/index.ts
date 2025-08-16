import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerateSuggestionRequest {
  suggestionId: string;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check admin permissions
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdminData } = await supabase.rpc('is_admin');
    if (!isAdminData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { suggestionId, action, adminNotes }: ModerateSuggestionRequest = await req.json();

    if (!suggestionId || !action) {
      return new Response(
        JSON.stringify({ error: 'Suggestion ID and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the suggestion
    const { data: suggestion, error: fetchError } = await supabase
      .from('event_image_suggestion')
      .select('*, event!inner(*)')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      return new Response(
        JSON.stringify({ error: 'Suggestion not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update suggestion status
    const { error: updateError } = await supabase
      .from('event_image_suggestion')
      .update({
        status: action,
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', suggestionId);

    if (updateError) {
      console.error('Error updating suggestion:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update suggestion' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If approved, update the event image
    if (action === 'APPROVE') {
      const { error: eventUpdateError } = await supabase
        .from('event')
        .update({ image_url: suggestion.suggested_image_url })
        .eq('id', suggestion.event_id);

      if (eventUpdateError) {
        console.error('Error updating event image:', eventUpdateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update event image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Image suggestion ${action.toLowerCase()}d successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moderate_image_suggestion function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);