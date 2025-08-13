import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatRoDate(date: Date): string {
  const months = [
    'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
    'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
  ];
  
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const siteUrl = Deno.env.get('SITE_URL') || 'https://catezile.ro';
    const currentYear = new Date().getFullYear();

    // Get upcoming holidays (next 2 years)
    const { data: instances, error } = await supabase
      .from('holiday_instance')
      .select(`
        *,
        holiday:holiday_id (*)
      `)
      .gte('date', new Date().toISOString().split('T')[0])
      .in('year', [currentYear, currentYear + 1])
      .order('date', { ascending: true })
      .limit(100);

    if (error) throw error;

    const feedItems = (instances || []).map((instance: any) => {
      const date = new Date(instance.date);
      const formattedDate = formatRoDate(date);
      const holiday = instance.holiday;
      
      return `
    <item>
      <title>${holiday.name} — ${formattedDate}</title>
      <link>${siteUrl}/sarbatori/${holiday.slug}</link>
      <guid>${siteUrl}/sarbatori/${holiday.slug}-${instance.year}</guid>
      <description>
        <![CDATA[
          ${holiday.name} în ${instance.year} este pe ${formattedDate}.
          ${instance.is_weekend ? 'Pică în weekend.' : 'Pică în zi lucrătoare.'}
          ${holiday.description ? holiday.description : ''}
        ]]>
      </description>
      <pubDate>${date.toUTCString()}</pubDate>
      <category>${holiday.kind}</category>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sărbători legale în România — CateZile.ro</title>
    <link>${siteUrl}/sarbatori</link>
    <description>Calendarul complet al sărbătorilor legale, religioase și naționale din România</description>
    <language>ro-RO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss/sarbatori.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

    return new Response(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error generating holidays RSS feed:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});