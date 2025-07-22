import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreakUpdateRequest {
  user_id: string;
  action: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, action, timestamp }: StreakUpdateRequest = await req.json()

    console.log('Updating streak for user:', user_id, 'action:', action)

    if (!user_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get current date
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get existing streak data
    const { data: existingStreak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching streak:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch streak data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let newStreakCount = 1
    let newLongestStreak = 1
    
    if (existingStreak) {
      const lastActiveDate = existingStreak.last_session_date
      
      if (lastActiveDate === today) {
        // Already active today, don't double-count
        console.log('User already active today, no streak update needed')
        return new Response(
          JSON.stringify({ 
            message: 'Already active today', 
            current_streak: existingStreak.current_streak,
            longest_streak: existingStreak.longest_streak
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else if (lastActiveDate === yesterday) {
        // Increment streak
        newStreakCount = existingStreak.current_streak + 1
        newLongestStreak = Math.max(existingStreak.longest_streak, newStreakCount)
        console.log('Incrementing streak from', existingStreak.current_streak, 'to', newStreakCount)
      } else {
        // Reset streak (more than 1 day gap)
        newStreakCount = 1
        newLongestStreak = Math.max(existingStreak.longest_streak, 1)
        console.log('Resetting streak to 1 due to gap in activity')
      }

      // Update existing record
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreakCount,
          longest_streak: newLongestStreak,
          last_session_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      if (updateError) {
        console.error('Error updating streak:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update streak' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // Create new streak record
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          user_id,
          current_streak: 1,
          longest_streak: 1,
          last_session_date: today
        })

      if (insertError) {
        console.error('Error creating streak:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create streak' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      console.log('Created new streak record for user')
    }

    return new Response(
      JSON.stringify({ 
        message: 'Streak updated successfully',
        current_streak: newStreakCount,
        longest_streak: newLongestStreak,
        last_active_date: today
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-streak function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})