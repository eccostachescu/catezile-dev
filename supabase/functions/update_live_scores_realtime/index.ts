import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Update live scores function loaded")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Starting live scores update...')

    // Check if there are any live matches
    const { data: liveMatches, error: fetchError } = await supabaseClient
      .from('match')
      .select('*')
      .in('status', ['1H', '2H', 'HT', 'ET', 'LIVE'])
      .gte('kickoff_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // Last 4 hours
      .lte('kickoff_at', new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) // Next 2 hours

    if (fetchError) {
      console.error('❌ Error fetching live matches:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${liveMatches?.length || 0} potential live matches`)

    if (!liveMatches || liveMatches.length === 0) {
      console.log('ℹ️ No live matches found, creating test data...')
      
      // Create a test live match for development
      const testMatch = {
        id: 'test-live-' + Date.now(),
        home: 'Rapid',
        away: 'FCSB',
        status: '1H',
        kickoff_at: new Date().toISOString(),
        tv_channels: ['Digi Sport 1'],
        competition_id: null,
        score: {
          home: { ft: 1 },
          away: { ft: 0 },
          minute: 65
        },
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { error: insertError } = await supabaseClient
        .from('match')
        .upsert(testMatch, { onConflict: 'id' })

      if (insertError) {
        console.error('❌ Error creating test match:', insertError)
      } else {
        console.log('✅ Created test live match')
      }
    }

    // Simulate score updates for live matches
    if (liveMatches && liveMatches.length > 0) {
      for (const match of liveMatches) {
        console.log(`🔄 Updating match: ${match.home} vs ${match.away}`)
        
        const currentScore = match.score || { home: { ft: 0 }, away: { ft: 0 }, minute: 1 }
        
        // Randomly update minute
        const newMinute = Math.min((currentScore.minute || 1) + Math.floor(Math.random() * 3), 90)
        
        // Small chance to update score
        let newScore = { ...currentScore, minute: newMinute }
        if (Math.random() < 0.1) { // 10% chance of goal
          if (Math.random() < 0.5) {
            newScore.home.ft = (newScore.home.ft || 0) + 1
          } else {
            newScore.away.ft = (newScore.away.ft || 0) + 1
          }
        }

        const { error: updateError } = await supabaseClient
          .from('match')
          .update({ 
            score: newScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', match.id)

        if (updateError) {
          console.error(`❌ Error updating match ${match.id}:`, updateError)
        } else {
          console.log(`✅ Updated match ${match.home} vs ${match.away} - ${newScore.home.ft}-${newScore.away.ft} (${newScore.minute}')`)
        }
      }
    }

    console.log('✅ Live scores update completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Live scores updated',
        matchesProcessed: liveMatches?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error in update_live_scores_realtime:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})