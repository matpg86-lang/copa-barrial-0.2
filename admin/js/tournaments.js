async function showTournaments() {

    const view = document.getElementById("view");

    view.innerHTML = `

        <div class="page-header">

            <h2>Torneos</h2>

            <button
                class="primary-btn"
                onclick="openTournamentModal()">

                + Nuevo torneo

            </button>

        </div>

        <div id="tournamentsList">

            Cargando...

        </div>

    `;

    await loadTournaments();

}

async function loadTournaments() {

    const { data, error } = await db
        .from("tournaments")
        .select("*")
        .order("start_date");

    if (error) {

        console.error(error);
        return;

    }

    const list = document.getElementById("tournamentsList");

    list.innerHTML = "";

    data.forEach(tournament => {

        list.innerHTML += `

            <div class="tournament-card">

                <div>

                    <h3>${tournament.name}</h3>

                    <p>🎮 ${tournament.game}</p>

                    <p>
                        📅
                        ${new Date(
                            tournament.start_date
                        ).toLocaleString("es-AR")}
                    </p>

                    <p>

                        👥 Máximo:
                        ${tournament.max_teams}

                    </p>

                    <span class="status ${tournament.status}">

                        ${tournament.status}

                    </span>

                </div>

                <div class="actions">

                    <button
                        class="edit"
                        onclick="editTournament('${tournament.id}')">

                        Editar

                    </button>

                    <button
                        class="close"
                        onclick="toggleTournament('${tournament.id}','${tournament.status}')">

                        ${tournament.status==="open"
                            ?"Cerrar":"Abrir"}

                    </button>

                </div>

            </div>

        `;

    });

}

function openTournamentModal(){

    document
        .getElementById("modalTitle")
        .textContent="Nuevo Torneo";

    document
        .getElementById("modalBody")
        .innerHTML=`

        <div class="modal-body">

            <input
                id="tournamentName"
                placeholder="Nombre">

            <input
                id="tournamentGame"
                value="League of Legends">

            <input
                id="tournamentDate"
                type="datetime-local">

            <input
                id="tournamentTeams"
                type="number"
                value="4">

            <textarea
                id="tournamentDescription"
                placeholder="Descripción"></textarea>

            <div class="modal-footer">

                <button
                    onclick="closeModal()">

                    Cancelar

                </button>

                <button
                    class="primary-btn"
                    onclick="saveTournament()">

                    Guardar

                </button>

            </div>

        </div>

    `;

    document
    .getElementById("modalOverlay")
    .classList
    .add("show");

}

function closeModal(){

    document
    .getElementById("modalOverlay")
    .classList
    .remove("show");

}

async function saveTournament(){

    const name =
        document
        .getElementById("tournamentName")
        .value;

    const game =
        document
        .getElementById("tournamentGame")
        .value;

    const start_date =
        document
        .getElementById("tournamentDate")
        .value;

    const max_teams =
        Number(
            document
            .getElementById("tournamentTeams")
            .value
        );

    const description =
        document
        .getElementById("tournamentDescription")
        .value;

    const { error } = await db
        .from("tournaments")
        .insert({

            name,
            game,
            start_date,
            max_teams,
            description,
            status:"closed"

        });

    if(error){

        alert(error.message);

        return;

    }

    closeModal();

    loadTournaments();

}

function editTournament(id){

    alert(id);

}

function toggleTournament(id,status){

    alert(status);

}