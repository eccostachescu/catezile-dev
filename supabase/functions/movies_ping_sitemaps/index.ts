import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Validate cron secret if provided
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://catezile.ro';

    console.log('Collecting movie URLs for sitemap update...');

    // Get all movie URLs that need to be pinged
    const { data: movies, error: moviesError } = await supabase
      .from('movie')
      .select('slug, updated_ext_at')
      .not('slug', 'is', null)
      .order('updated_ext_at', { ascending: false });

    if (moviesError) {
      throw new Error(`Failed to fetch movies: ${moviesError.message}`);
    }

    const urls: string[] = [];

    // Add main movies hub
    urls.push(`${SITE_URL}/filme`);

    // Add individual movie pages
    for (const movie of movies || []) {
      urls.push(`${SITE_URL}/filme/${movie.slug}`);
    }

    // Add monthly pages (current + next 12 months)
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      urls.push(`${SITE_URL}/filme/${year}-${month}`);
    }

    // Add platform pages
    const platformSlugs = ['netflix', 'prime', 'max', 'disney', 'apple-tv'];
    for (const platform of platformSlugs) {
      urls.push(`${SITE_URL}/filme/${platform}`);
    }

    urls.push(`${SITE_URL}/filme/la-cinema`);

    console.log(`Collected ${urls.length} movie URLs to ping`);

    const results = [];

    // Call ping_sitemaps function if available
    try {
      const { data: pingSitemapsResult, error: pingSitemapsError } = await supabase.functions.invoke('ping_sitemaps', {
        body: { urls: urls.slice(0, 100) } // Limit to avoid timeout
      });

      if (pingSitemapsError) {
        console.warn('ping_sitemaps error:', pingSitemapsError);
      } else {
        results.push({ service: 'ping_sitemaps', result: pingSitemapsResult });
      }
    } catch (error) {
      console.warn('ping_sitemaps not available:', error.message);
    }

    // Call indexnow_submit function if available
    try {
      const { data: indexNowResult, error: indexNowError } = await supabase.functions.invoke('indexnow_submit', {
        body: { urls: urls.slice(0, 50) } // IndexNow has stricter limits
      });

      if (indexNowError) {
        console.warn('indexnow_submit error:', indexNowError);
      } else {
        results.push({ service: 'indexnow_submit', result: indexNowResult });
      }
    } catch (error) {
      console.warn('indexnow_submit not available:', error.message);
    }

    console.log('Movies sitemap ping completed');

    return new Response(JSON.stringify({ 
      success: true, 
      urls_processed: urls.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in movies_ping_sitemaps:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});