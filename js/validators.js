import { db } from "./supabase.js";

export async function validateRegistration(data, tournament) {

    normalizeData(data);

    validateTeamName(data.team);

    const roster = getRoster(data);

    validateRiotIds(data.captain, roster);

    validateCaptain(data.captain, roster);

    validateUniquePlayers(roster);

    await validateExistingTeam(data.team);

    await validateExistingDiscord(data.discord);

    await validateExistingPlayers(roster);

    await validateSlots(tournament);

}

function normalizeData(data){

    data.team = data.team.trim();

    data.captain = data.captain.trim();

    data.discord = data.discord.trim();

    Object.keys(data.roster).forEach(role=>{

        data.roster[role] =
            data.roster[role].trim();

    });

}

function getRoster(data){

    return [

        data.roster.top,

        data.roster.jungle,

        data.roster.mid,

        data.roster.adc,

        data.roster.support

    ];

}

function validateTeamName(name){

    if(name.length < 3){

        throw new Error(
            "El nombre del equipo debe tener al menos 3 caracteres."
        );

    }

}

function isValidRiotId(id){

    return /^[A-Za-z0-9 _.-]{3,16}#[A-Za-z0-9]{2,5}$/.test(id);

}

function validateRiotIds(captain, roster){

    for(const riotId of [captain,...roster]){

        if(!isValidRiotId(riotId)){

            throw new Error(
                `Riot ID inválido: ${riotId}`
            );

        }

    }

}

function validateCaptain(captain, roster){

    const captainLower =
        captain.toLowerCase();

    const rosterLower =
        roster.map(player=>player.toLowerCase());

    if(!rosterLower.includes(captainLower)){

        throw new Error(
            "El Riot ID del capitán debe formar parte del roster."
        );

    }

}

function validateUniquePlayers(roster){

    const players =
        roster.map(player=>player.toLowerCase());

    if(new Set(players).size !== players.length){

        throw new Error(
            "No puede haber Riot IDs repetidos en el roster."
        );

    }

}

async function validateExistingTeam(team){

    const { data } = await db

        .from("teams")

        .select("id")

        .ilike("name",team)

        .limit(1);

    if(data.length){

        throw new Error(
            "Ya existe un equipo con ese nombre."
        );

    }

}

async function validateExistingDiscord(discord){

    const { data } = await db

        .from("teams")

        .select("id")

        .ilike("captain_discord",discord)

        .limit(1);

    if(data.length){

        throw new Error(
            "Ese Discord ya tiene un equipo registrado."
        );

    }

}

async function validateExistingPlayers(roster){

    const { data } = await db

        .from("players")

        .select("summoner_name")

        .in("summoner_name",roster);

    if(data.length){

        throw new Error(
            `El jugador ${data[0].summoner_name} ya está inscripto.`
        );

    }

}

async function validateSlots(tournament){

    const { count } = await db

        .from("registrations")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq("tournament_id",tournament.id)

        .eq("status","approved");

    if(count >= tournament.max_teams){

        throw new Error(
            "El torneo ya alcanzó el máximo de equipos."
        );

    }

}