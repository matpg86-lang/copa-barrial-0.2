import { db } from "../supabase.js";

export async function createRegistration(data, tournamentId) {

    // Crear equipo
    const { data: team, error: teamError } = await db
        .from("teams")
        .insert({
            name: data.team,
            captain_name: data.captain,
            captain_discord: data.discord
        })
        .select()
        .single();

    if (teamError) throw teamError;

    // Registrar inscripción
    const { error: registrationError } = await db
        .from("registrations")
        .insert({
            tournament_id: tournamentId,
            team_id: team.id,
            status: "pending"
        });

    if (registrationError) throw registrationError;

    // Guardar jugadores
    const players = Object.entries(data.roster).map(([role, summoner]) => ({
        team_id: team.id,
        role,
        summoner_name: summoner
    }));

    const { error: playersError } = await db
        .from("players")
        .insert(players);

    if (playersError) throw playersError;

    return team;

}