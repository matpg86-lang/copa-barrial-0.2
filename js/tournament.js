import {
    getOpenTournament,
    getApprovedTeamsCount
} from "./services/tournamentService.js";

import { iniciarCuentaRegresiva } from "./countdown.js";

export async function cargarProximoTorneo() {

    try {

        const tournament = await getOpenTournament();

        const count = await getApprovedTeamsCount(
            tournament.id
        );

        renderTournament(
            tournament,
            count
        );

        iniciarCuentaRegresiva(
            tournament.start_date
        );

    } catch (err) {

        console.error(err);

    }

}

function renderTournament(tournament, count) {

    document.getElementById("nextTournamentName").textContent =
        tournament.name;

    const fecha = new Date(tournament.start_date);

    const diaSemana = fecha.toLocaleDateString("es-AR", {
        weekday: "long"
    });

    const dia = fecha.getDate();

    const mes = fecha.toLocaleDateString("es-AR", {
        month: "long"
    });

    const hora = fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).replace(" a. m.", " a.m.")
      .replace(" p. m.", " p.m.");

    document.getElementById("nextTournamentDate").innerHTML =
        `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dia} de ${mes}<br>${hora}`;

    document.getElementById("tournamentSlots").textContent =
        `${count} / ${tournament.max_teams} equipos inscriptos`;

    document.getElementById("slotsProgress").style.width =
        `${(count / tournament.max_teams) * 100}%`;

}