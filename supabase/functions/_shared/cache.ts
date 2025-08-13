import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const cacheHeaders = {
  // For listings that update slowly (sitemaps, RSS)
  listings: {
    'Cache-Control': 'public, max-age=900, stale-while-revalidate=600',
    'Vary': 'Accept-Encoding'
  },
  
  // For search suggestions
  search: {
    'Cache-Control': 'public, max-age=60',
    'Vary': 'Accept-Encoding'
  },
  
  // For live data (scores, TV status)
  live: {
    'Cache-Control': 'no-store'
  },
  
  // For fast-changing data with short cache
  dynamic: {
    'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
    'Vary': 'Accept-Encoding'
  },
  
  // For OG images and assets
  assets: {
    'Cache-Control': 'public, max-age=3600, immutable',
    'Vary': 'Accept-Encoding'
  }
}

export const getCacheVersion = async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'deployment')
      .single()

    return data?.value?.cache_version || 1
  } catch {
    return 1
  }
}

export const generateETag = (content: string, cacheVersion?: number) => {
  const hash = Array.from(
    new Uint8Array(
      new TextEncoder().encode(content + (cacheVersion || ''))
    )
  ).map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `"${hash.slice(0, 16)}"`
}

export const triggerRebuildIfNeeded = async (reason: string, force = false) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const adminCronSecret = Deno.env.get('ADMIN_CRON_SECRET')
    if (!adminCronSecret) {
      console.log('ADMIN_CRON_SECRET not configured, skipping rebuild trigger')
      return
    }

    console.log(`Triggering rebuild: ${reason}`)
    
    const response = await supabase.functions.invoke('rebuild_hook', {
      body: { reason, force },
      headers: {
        'x-cron-secret': adminCronSecret
      }
    })

    if (response.error) {
      console.error('Failed to trigger rebuild:', response.error)
    } else {
      console.log('Rebuild triggered successfully:', response.data)
    }
    
  } catch (error) {
    console.error('Error triggering rebuild:', error)
  }
}

export const addCacheHeaders = (
  response: Response, 
  cacheType: keyof typeof cacheHeaders = 'listings',
  etag?: string
) => {
  const headers = new Headers(response.headers)
  
  // Add cache control headers
  Object.entries(cacheHeaders[cacheType]).forEach(([key, value]) => {
    headers.set(key, value)
  })
  
  // Add ETag if provided
  if (etag) {
    headers.set('ETag', etag)
  }
  
  // Add cache version header for debugging
  headers.set('X-Cache-Version', 'v1')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}