import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Orthodox Easter calculation using Meeus/Jones/Butcher algorithm
function calculateOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  
  // Orthodox Easter is 13 days later than Julian calendar due to calendar difference
  const julianDate = new Date(year, month - 1, day);
  julianDate.setDate(julianDate.getDate() + 13);
  
  return julianDate;
}

// Western Easter calculation
function calculateWesternEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

function parseRule(rule: string, year: number): Date | null {
  if (rule.startsWith('fixed:')) {
    const [month, day] = rule.substring(6).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  if (rule.startsWith('orthodox_easter:')) {
    const offset = parseInt(rule.substring(16));
    const easter = calculateOrthodoxEaster(year);
    easter.setDate(easter.getDate() + offset);
    return easter;
  }
  
  if (rule.startsWith('western_easter:')) {
    const offset = parseInt(rule.substring(15));
    const easter = calculateWesternEaster(year);
    easter.setDate(easter.getDate() + offset);
    return easter;
  }
  
  return null;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { fromYear, toYear } = req.method === 'POST' 
      ? await req.json() 
      : { fromYear: new Date().getFullYear() - 1, toYear: new Date().getFullYear() + 2 };

    console.log(`Generating holidays for years ${fromYear} to ${toYear}`);

    // Get all holidays with their rules
    const { data: holidays, error: holidaysError } = await supabase
      .from('holiday')
      .select('*');

    if (holidaysError) throw holidaysError;

    const instances = [];
    const affectedRoutes = new Set<string>();

    for (const holiday of holidays || []) {
      for (let year = fromYear; year <= toYear; year++) {
        const date = parseRule(holiday.rule, year);
        if (!date) continue;

        const dateEnd = holiday.rule.includes('easter') && holiday.slug.includes('rusalii') 
          ? new Date(date.getTime() + 24 * 60 * 60 * 1000) // Rusalii is 2 days
          : null;

        const instance = {
          holiday_id: holiday.id,
          year,
          date: date.toISOString().split('T')[0],
          date_end: dateEnd?.toISOString().split('T')[0] || null,
          is_weekend: isWeekend(date)
        };

        instances.push(instance);
        affectedRoutes.add(`/sarbatori/${holiday.slug}`);
      }
    }

    // Upsert instances
    const { error: upsertError } = await supabase
      .from('holiday_instance')
      .upsert(instances, { 
        onConflict: 'holiday_id,year',
        ignoreDuplicates: false 
      });

    if (upsertError) throw upsertError;

    // Add main routes to affected routes
    affectedRoutes.add('/sarbatori');
    affectedRoutes.add('/');

    console.log(`Generated ${instances.length} holiday instances, affected routes: ${Array.from(affectedRoutes).join(', ')}`);

    // Ping sitemaps for affected routes
    try {
      await supabase.functions.invoke('ping_sitemaps', {
        body: { 
          routes: Array.from(affectedRoutes),
          reason: 'holidays_generated'
        }
      });
    } catch (e) {
      console.warn('Failed to ping sitemaps:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      generated: instances.length,
      years: `${fromYear}-${toYear}`,
      affectedRoutes: Array.from(affectedRoutes)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error generating holidays:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});