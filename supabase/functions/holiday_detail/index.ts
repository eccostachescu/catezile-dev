import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function calculateBridgeRecommendations(date: Date, holidayName: string) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const recommendations = [];

  // Thursday holiday -> take Friday for 4-day weekend
  if (dayOfWeek === 4) {
    recommendations.push({
      type: 'long_weekend',
      days_off: 1,
      total_days: 4,
      description: `Ia vineri liberă pentru un weekend prelungit de 4 zile cu ${holidayName}`
    });
  }

  // Tuesday holiday -> take Monday for 4-day weekend  
  if (dayOfWeek === 2) {
    recommendations.push({
      type: 'long_weekend',
      days_off: 1,
      total_days: 4,
      description: `Ia luni liberă pentru un weekend prelungit de 4 zile cu ${holidayName}`
    });
  }

  // Wednesday holiday -> take Tuesday or Thursday + Friday for 5-day break
  if (dayOfWeek === 3) {
    recommendations.push({
      type: 'mid_week_bridge',
      days_off: 2,
      total_days: 5,
      description: `Ia marți și joi liberă pentru o minivacanță de 5 zile cu ${holidayName}`
    });
  }

  // Monday holiday -> already 3-day weekend
  if (dayOfWeek === 1) {
    recommendations.push({
      type: 'natural_long_weekend',
      days_off: 0,
      total_days: 3,
      description: `Weekend prelungit natural de 3 zile cu ${holidayName}`
    });
  }

  // Friday holiday -> already 3-day weekend
  if (dayOfWeek === 5) {
    recommendations.push({
      type: 'natural_long_weekend',
      days_off: 0,
      total_days: 3,
      description: `Weekend prelungit natural de 3 zile cu ${holidayName}`
    });
  }

  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.pathname.split('/').pop();
    
    if (!slug) {
      throw new Error('Holiday slug is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const currentYear = new Date().getFullYear();

    // Get holiday with instances for current and next year
    const { data: holiday, error: holidayError } = await supabase
      .from('holiday')
      .select(`
        *,
        instances:holiday_instance!inner(*)
      `)
      .eq('slug', slug)
      .in('instances.year', [currentYear, currentYear + 1])
      .single();

    if (holidayError || !holiday) {
      return new Response(JSON.stringify({ error: 'Holiday not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Find the next occurrence
    const today = new Date();
    const nextInstance = holiday.instances
      .map((instance: any) => ({
        ...instance,
        date: new Date(instance.date)
      }))
      .filter((instance: any) => instance.date >= today)
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())[0];

    // Calculate days until next occurrence
    let daysUntil = null;
    if (nextInstance) {
      const timeDiff = nextInstance.date.getTime() - today.getTime();
      daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    // Generate bridge recommendations for next instance
    let bridgeRecommendations = [];
    if (nextInstance && !nextInstance.is_weekend) {
      bridgeRecommendations = calculateBridgeRecommendations(
        nextInstance.date, 
        holiday.name
      );
    }

    const result = {
      holiday,
      nextInstance,
      daysUntil,
      bridgeRecommendations,
      isWeekend: nextInstance?.is_weekend || false,
      currentYear,
      nextYear: currentYear + 1
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error fetching holiday detail:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});