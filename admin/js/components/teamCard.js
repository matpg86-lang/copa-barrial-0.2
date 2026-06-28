function createTeamCard(registration, players) {

    const card = document.createElement("div");
    card.className = "team-card";

    card.innerHTML = `
        <h3>${registration.teams.name}</h3>

        <p><strong>Capitán:</strong> ${registration.teams.captain_name}</p>

        <p><strong>Discord:</strong> ${registration.teams.captain_discord}</p>

        <hr>

        <div class="players"></div>

        <div class="team-actions">

<button
    class="approve approve-btn"
    data-id="${registration.id}">
    Aprobar
</button>

<button
    class="reject reject-btn"
    data-id="${registration.id}">
    Rechazar
</button>

        </div>
    `;

    const playersContainer = card.querySelector(".players");

    players.forEach(player => {

        const p = document.createElement("p");

        p.innerHTML = `
            <strong>${player.role}:</strong>
            ${player.summoner_name}
        `;

        playersContainer.appendChild(p);

    });

    return card;

}