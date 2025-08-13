import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface RebuildRequest {
  reason: string
  force?: boolean
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

    // Auth check - either valid admin JWT or cron secret
    const cronSecret = req.headers.get('x-cron-secret')
    const adminCronSecret = Deno.env.get('ADMIN_CRON_SECRET')
    
    let isAuthorized = false
    let actor = 'unknown'

    if (cronSecret && cronSecret === adminCronSecret) {
      isAuthorized = true
      actor = 'cron'
    } else {
      // Check JWT for admin
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (user) {
          const { data: isAdmin } = await supabase.rpc('is_admin')
          if (isAdmin) {
            isAuthorized = true
            actor = `admin:${user.email}`
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

    const { reason, force = false }: RebuildRequest = await req.json()

    console.log(`Rebuild hook called: reason=${reason}, force=${force}, actor=${actor}`)

    // Get current settings
    const { data: settings } = await supabase
      .from('settings')
      .select('cache_version, last_build_at, build_locked, build_min_interval_min')
      .eq('key', 'deployment')
      .single()

    const buildLocked = settings?.value?.build_locked || false
    const minIntervalMin = settings?.value?.build_min_interval_min || 10
    const lastBuildAt = settings?.last_build_at

    // Check if builds are locked
    if (buildLocked && !force) {
      await supabase.from('deployment_log').insert({
        status: 'SKIPPED',
        reason: 'Builds are locked',
        actor,
        notes: `Original reason: ${reason}`
      })

      return new Response(JSON.stringify({ 
        status: 'SKIPPED',
        message: 'Builds are currently locked'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check minimum interval (unless forced)
    if (!force && lastBuildAt) {
      const lastBuild = new Date(lastBuildAt)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastBuild.getTime()) / (1000 * 60)
      
      if (diffMinutes < minIntervalMin) {
        await supabase.from('deployment_log').insert({
          status: 'SKIPPED', 
          reason: `Rate limited (${diffMinutes.toFixed(1)}min since last build)`,
          actor,
          notes: `Original reason: ${reason}`
        })

        return new Response(JSON.stringify({
          status: 'SKIPPED',
          message: `Rate limited. Last build was ${diffMinutes.toFixed(1)} minutes ago`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Trigger the actual build
    const deployHookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL')
    const githubToken = Deno.env.get('GITHUB_TOKEN')
    const githubRepo = Deno.env.get('GITHUB_REPO') // format: "owner/repo"
    
    let buildId = `manual-${Date.now()}`
    
    try {
      if (deployHookUrl) {
        // Use Vercel Deploy Hook
        console.log('Triggering Vercel deploy hook...')
        const vercelResponse = await fetch(deployHookUrl, { method: 'POST' })
        
        if (!vercelResponse.ok) {
          throw new Error(`Vercel deploy hook failed: ${vercelResponse.status}`)
        }
        
        buildId = `vercel-${Date.now()}`
        
      } else if (githubToken && githubRepo) {
        // Use GitHub repository dispatch
        console.log('Triggering GitHub Actions...')
        const githubResponse = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: 'rebuild_request',
            client_payload: { reason, actor }
          })
        })
        
        if (!githubResponse.ok) {
          throw new Error(`GitHub dispatch failed: ${githubResponse.status}`)
        }
        
        buildId = `github-${Date.now()}`
        
      } else {
        throw new Error('No deploy hook configured (VERCEL_DEPLOY_HOOK_URL or GITHUB_TOKEN/GITHUB_REPO)')
      }

      // Update settings and log the build start
      await supabase
        .from('settings')
        .update({
          last_build_at: new Date().toISOString(),
          build_status: 'STARTED',
          build_reason: reason
        })
        .eq('key', 'deployment')

      await supabase.from('deployment_log').insert({
        status: 'STARTED',
        reason,
        actor,
        build_id: buildId
      })

      console.log(`Build triggered successfully: ${buildId}`)

      return new Response(JSON.stringify({
        status: 'STARTED',
        buildId,
        message: 'Build triggered successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Build trigger failed:', error)
      
      await supabase.from('deployment_log').insert({
        status: 'FAILED',
        reason,
        actor,
        build_id: buildId,
        notes: `Error: ${error.message}`
      })

      return new Response(JSON.stringify({
        status: 'FAILED',
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Rebuild hook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})