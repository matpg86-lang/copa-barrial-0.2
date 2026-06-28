import { getApprovedTeams } from "./services/teamService.js";

export async function loadTeams() {

    try {

        const {
            tournament,
            registrations
        } = await getApprovedTeams();

        renderTeams(
            tournament,
            registrations
        );

    } catch (err) {

        console.error(err);

    }

}

function renderTeams(tournament, registrations) {

    const list = document.getElementById("teamsList");

    list.replaceChildren();

    registrations.forEach(registration => {

        list.appendChild(
            createTeamItem(
                registration.teams.name
            )
        );

    });

    const available =
        tournament.max_teams -
        registrations.length;

    for (let i = 0; i < available; i++) {

        list.appendChild(
            createAvailableSlot()
        );

    }

}

function createTeamItem(name) {

    const div = document.createElement("div");

    div.className = "team-item";

    div.innerHTML = `
        <span class="team-name">
            ${name}
        </span>

        <span class="team-status">
            Inscripto
        </span>
    `;

    return div;

}

function createAvailableSlot() {

    const a = document.createElement("a");

    a.href = "#inscripcion";

    a.className = "team-item available-slot";

    a.innerHTML = `
        <span class="team-name">
            ✅ Cupo disponible
        </span>

        <span class="team-status available">
            Inscribirse
        </span>
    `;

    return a;

}