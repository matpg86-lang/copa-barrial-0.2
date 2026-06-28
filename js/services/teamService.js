import { db } from "../supabase.js";

export async function getApprovedTeams() {

    const { data: tournament, error } = await db
        .from("tournaments")
        .select("id, max_teams")
        .eq("status", "open")
        .single();

    if (error) throw error;

    const { data: registrations, error: registrationsError } = await db
        .from("registrations")
        .select(`
            team_id,
            teams (
                name
            )
        `)
        .eq("tournament_id", tournament.id)
        .eq("status", "approved");

    if (registrationsError) throw registrationsError;

    return {
        tournament,
        registrations
    };

}