import { db } from "../supabase.js";

export async function getOpenTournament() {

    const { data, error } = await db
        .from("tournaments")
        .select("*")
        .eq("status", "open")
        .order("start_date")
        .limit(1)
        .single();

    if (error) throw error;

    return data;

}

export async function getApprovedTeamsCount(tournamentId) {

    const { count, error } = await db
        .from("registrations")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("tournament_id", tournamentId)
        .eq("status", "approved");

    if (error) throw error;

    return count;

}