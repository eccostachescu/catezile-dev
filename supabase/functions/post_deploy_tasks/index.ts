import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface PostDeployRequest {
  buildId: string
  success: boolean
  notes?: string
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

    // Auth check - cron secret or admin JWT
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

    const { buildId, success, notes }: PostDeployRequest = await req.json()

    console.log(`Post deploy tasks: buildId=${buildId}, success=${success}`)

    if (success) {
      // Increment cache version for cache busting
      const { data: settings } = await supabase
        .from('settings')
        .select('cache_version')
        .eq('key', 'deployment')
        .single()

      const currentVersion = settings?.value?.cache_version || 1
      const newVersion = currentVersion + 1

      // Update settings
      await supabase
        .from('settings')
        .update({
          cache_version: newVersion,
          build_status: 'SUCCESS'
        })
        .eq('key', 'deployment')

      // Update deployment log
      await supabase
        .from('deployment_log')
        .update({
          status: 'SUCCESS',
          finished_at: new Date().toISOString(),
          notes: notes || `Cache version bumped to ${newVersion}`
        })
        .eq('build_id', buildId)

      // Trigger warmup
      console.log('Triggering warmup...')
      const warmupResponse = await supabase.functions.invoke('warmup', {
        body: { 
          buildId,
          cacheVersion: newVersion 
        },
        headers: {
          'x-cron-secret': adminCronSecret
        }
      })

      if (warmupResponse.error) {
        console.error('Warmup failed:', warmupResponse.error)
      }

      // Ping sitemaps if there were URL changes in the last 24h
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: urlChanges } = await supabase
        .from('url_change_log')
        .select('id')
        .gte('created_at', yesterday.toISOString())
        .limit(1)

      if (urlChanges && urlChanges.length > 0) {
        console.log('Pinging sitemaps due to recent URL changes...')
        await supabase.functions.invoke('ping_sitemaps', {
          body: { source: 'post_deploy' },
          headers: {
            'x-cron-secret': adminCronSecret
          }
        })
      }

      return new Response(JSON.stringify({
        status: 'SUCCESS',
        cacheVersion: newVersion,
        warmupTriggered: true,
        sitemapsPinged: urlChanges && urlChanges.length > 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else {
      // Handle failed build
      await supabase
        .from('settings')
        .update({
          build_status: 'FAILED'
        })
        .eq('key', 'deployment')

      await supabase
        .from('deployment_log')
        .update({
          status: 'FAILED',
          finished_at: new Date().toISOString(),
          notes: notes || 'Build failed'
        })
        .eq('build_id', buildId)

      // TODO: Send admin notification email about failed build
      console.log('Build failed, admin notification should be sent')

      return new Response(JSON.stringify({
        status: 'FAILED',
        message: 'Build failure recorded'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Post deploy tasks error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})