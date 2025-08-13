import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface WarmupRequest {
  buildId?: string
  cacheVersion?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Auth check
    const cronSecret = req.headers.get('x-cron-secret')
    const adminCronSecret = Deno.env.get('ADMIN_CRON_SECRET')
    
    let isAuthorized = false

    if (cronSecret && cronSecret === adminCronSecret) {
      isAuthorized = true
    } else {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (user) {
          const { data: isAdmin } = await supabase.rpc('is_admin')
          if (isAdmin) {
            isAuthorized = true
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const { buildId, cacheVersion }: WarmupRequest = await req.json()
    const siteUrl = Deno.env.get('SITE_URL') || 'https://catezile.ro'

    console.log(`Starting warmup for buildId=${buildId}, cacheVersion=${cacheVersion}`)

    // Critical routes to warm up
    const warmupRoutes = [
      '/',
      '/sitemap.xml',
      '/sitemaps/sitemap-sport-00001.xml.gz',
      '/sitemaps/sitemap-movies-00001.xml.gz', 
      '/sitemaps/sitemap-events-00001.xml.gz',
      '/tv',
      '/filme',
      '/evenimente',
      '/sarbatori',
      '/search_suggest?q=liga',
      '/search_suggest?q=untold',
      '/tv_now_status',
      '/rss.xml'
    ]

    const results: Array<{
      url: string
      status: number
      responseTime: number
      error?: string
    }> = []

    // Warmup requests in parallel
    const warmupPromises = warmupRoutes.map(async (route) => {
      const url = `${siteUrl}${route}${route.includes('?') ? '&' : '?'}v=${cacheVersion || 1}`
      const startTime = Date.now()
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CateZile-Warmup/1.0',
            'Cache-Control': 'no-store'
          },
          // Timeout after 10 seconds
          signal: AbortSignal.timeout(10000)
        })

        const responseTime = Date.now() - startTime
        
        results.push({
          url: route,
          status: response.status,
          responseTime
        })

        console.log(`Warmed ${route}: ${response.status} (${responseTime}ms)`)

      } catch (error) {
        const responseTime = Date.now() - startTime
        results.push({
          url: route,
          status: 0,
          responseTime,
          error: error.message
        })

        console.error(`Warmup failed for ${route}:`, error.message)
      }
    })

    await Promise.all(warmupPromises)

    // Calculate stats
    const totalRequests = results.length
    const successfulRequests = results.filter(r => r.status >= 200 && r.status < 400).length
    const failedRequests = totalRequests - successfulRequests
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests

    const notes = `Warmup completed: ${successfulRequests}/${totalRequests} successful, avg ${averageResponseTime.toFixed(0)}ms`

    // Update deployment log with warmup results
    if (buildId) {
      await supabase
        .from('deployment_log')
        .update({
          notes: notes,
          finished_at: new Date().toISOString()
        })
        .eq('build_id', buildId)
    }

    console.log(notes)

    return new Response(JSON.stringify({
      status: 'SUCCESS',
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      details: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Warmup error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})