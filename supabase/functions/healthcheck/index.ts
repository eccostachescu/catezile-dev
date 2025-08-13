import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheck {
  name: string
  status: 'green' | 'yellow' | 'red'
  message: string
  lastRun?: string
  responseTime?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  const startTime = Date.now()

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const checks: HealthCheck[] = []

    // 1. Database connectivity check
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key')
        .limit(1)

      if (error) throw error

      checks.push({
        name: 'database',
        status: 'green',
        message: 'Database connection OK'
      })
    } catch (error) {
      checks.push({
        name: 'database',
        status: 'red',
        message: `Database error: ${error.message}`
      })
    }

    // 2. Search functionality check
    try {
      const searchResponse = await supabase.functions.invoke('search_suggest', {
        body: { q: 'test' }
      })

      if (searchResponse.error) {
        checks.push({
          name: 'search',
          status: 'yellow',
          message: `Search function error: ${searchResponse.error.message}`
        })
      } else {
        checks.push({
          name: 'search',
          status: 'green',
          message: 'Search function OK'
        })
      }
    } catch (error) {
      checks.push({
        name: 'search',
        status: 'red',
        message: `Search function failed: ${error.message}`
      })
    }

    // 3. TV status check
    try {
      const tvResponse = await supabase.functions.invoke('tv_now_status')
      
      if (tvResponse.error) {
        checks.push({
          name: 'tv_status',
          status: 'yellow',
          message: `TV status error: ${tvResponse.error.message}`
        })
      } else {
        checks.push({
          name: 'tv_status',
          status: 'green',
          message: 'TV status function OK'
        })
      }
    } catch (error) {
      checks.push({
        name: 'tv_status',
        status: 'red',
        message: `TV status failed: ${error.message}`
      })
    }

    // 4. Check recent cron job executions
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Check Liga1 live updates (should run every 5 min during match days)
    const { data: liga1Logs } = await supabase
      .from('ingestion_log')
      .select('ran_at, status')
      .eq('source', 'liga1_live_tick')
      .gte('ran_at', fiveMinutesAgo.toISOString())
      .order('ran_at', { ascending: false })
      .limit(1)

    if (liga1Logs && liga1Logs.length > 0) {
      checks.push({
        name: 'liga1_live',
        status: liga1Logs[0].status === 'SUCCESS' ? 'green' : 'yellow',
        message: `Liga1 live updates: ${liga1Logs[0].status}`,
        lastRun: liga1Logs[0].ran_at
      })
    } else {
      // Check if it's a match day by looking at upcoming matches
      const { data: upcomingMatches } = await supabase
        .from('match')
        .select('id')
        .gte('kickoff_at', now.toISOString())
        .lte('kickoff_at', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .limit(1)

      if (upcomingMatches && upcomingMatches.length > 0) {
        checks.push({
          name: 'liga1_live',
          status: 'yellow',
          message: 'Liga1 live updates not running on match day'
        })
      } else {
        checks.push({
          name: 'liga1_live',
          status: 'green',
          message: 'Liga1 live updates (no matches today)'
        })
      }
    }

    // Check movies sync (should run daily)
    const { data: movieLogs } = await supabase
      .from('ingestion_log')
      .select('ran_at, status')
      .eq('source', 'movies_sync_tmdb')
      .gte('ran_at', oneDayAgo.toISOString())
      .order('ran_at', { ascending: false })
      .limit(1)

    if (movieLogs && movieLogs.length > 0) {
      checks.push({
        name: 'movies_sync',
        status: movieLogs[0].status === 'SUCCESS' ? 'green' : 'yellow',
        message: `Movies sync: ${movieLogs[0].status}`,
        lastRun: movieLogs[0].ran_at
      })
    } else {
      checks.push({
        name: 'movies_sync',
        status: 'red',
        message: 'Movies sync not run in 24h'
      })
    }

    // Check holidays generation (should run monthly)
    const { data: holidayLogs } = await supabase
      .from('ingestion_log')
      .select('ran_at, status')
      .eq('source', 'holidays_generate')
      .gte('ran_at', thirtyDaysAgo.toISOString())
      .order('ran_at', { ascending: false })
      .limit(1)

    if (holidayLogs && holidayLogs.length > 0) {
      checks.push({
        name: 'holidays_generate',
        status: holidayLogs[0].status === 'SUCCESS' ? 'green' : 'yellow',
        message: `Holidays generation: ${holidayLogs[0].status}`,
        lastRun: holidayLogs[0].ran_at
      })
    } else {
      checks.push({
        name: 'holidays_generate',
        status: 'red',
        message: 'Holidays not generated in 30 days'
      })
    }

    // Determine overall status
    const hasRed = checks.some(c => c.status === 'red')
    const hasYellow = checks.some(c => c.status === 'yellow')
    
    let overallStatus: 'green' | 'yellow' | 'red'
    if (hasRed) {
      overallStatus = 'red'
    } else if (hasYellow) {
      overallStatus = 'yellow'
    } else {
      overallStatus = 'green'
    }

    const responseTime = Date.now() - startTime

    // Log health check
    await supabase.from('health_check_log').insert({
      status: overallStatus,
      checks: checks,
      response_time_ms: responseTime
    })

    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      checks
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Healthcheck error:', error)
    
    const responseTime = Date.now() - startTime
    
    return new Response(JSON.stringify({
      status: 'red',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error.message,
      checks: [{
        name: 'healthcheck',
        status: 'red',
        message: `Healthcheck failed: ${error.message}`
      }]
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  }
})