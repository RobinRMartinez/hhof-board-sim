import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse incoming form data from Apps Script
    const body = await req.json();

    // Create Supabase client using environment variables
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert into inductee_submissions
    const { data, error } = await supabase
      .from("inductee_submissions")
      .insert([{
        full_name:             body.full_name,
        first_name:            body.first_name,
        last_name:             body.last_name,
        place_of_birth:        body.place_of_birth,
        current_residence:     body.current_residence,
        age_started_hockey:    body.age_started_hockey,
        hockey_journey:        body.hockey_journey,
        highest_level:         body.highest_level,
        teams_played_for:      body.teams_played_for,
        primary_positions:     body.primary_positions,
        jersey_numbers:        body.jersey_numbers,
        years_active:          body.years_active,
        current_status:        body.current_status,
        playing_frequency:     body.playing_frequency,
        notable_competitions:  body.notable_competitions,
        fitness_activities:    body.fitness_activities,
        weekly_activity_level: body.weekly_activity_level,
        nutrition_approach:    body.nutrition_approach,
        current_health_issues: body.current_health_issues,
        why_you_play:          body.why_you_play,
        love_about_game:       body.love_about_game,
        favorite_player_why:   body.favorite_player_why,
        submitted_by:          body.submitted_by,
        contact_email:         body.contact_email,
        contact_phone:         body.contact_phone,
        date_submitted:        body.date_submitted,
        inductee_email:        body.inductee_email,
        year_of_birth:         body.year_of_birth,
        category:              body.category,
        status:                "draft"
      }]);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});