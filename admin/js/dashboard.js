const supabaseUrl = "https://jszgafljtsyohksffjdd.supabase.co";
const supabaseKey = "sb_publishable_bTNuABiFd42Ts1zDF8uZRg_pmcEYOPc";

const db = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// =========================
// Dashboard
// =========================

async function checkSession() {

    const { data } = await db.auth.getSession();

    if (!data.session) {

        window.location.href = "login.html";
        return false;

    }

    console.log("Administrador:", data.session.user.email);

    return true;

}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        await db.auth.signOut();

        window.location.href = "login.html";

    });

}

// =========================
// Equipos pendientes
// =========================

async function loadPendingTeams() {

    const { data: tournament, error: tournamentError } = await db
        .from("tournaments")
        .select("id")
        .eq("status", "open")
        .single();

    if (tournamentError) {
        console.error(tournamentError);
        return;
    }

    const { data: registrations, error } = await db
        .from("registrations")
        .select(`
            id,
            status,
            teams (
                id,
                name,
                captain_name,
                captain_discord
            )
        `)
        .eq("tournament_id", tournament.id)
        .eq("status", "pending");

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById("pendingCount").textContent =
        registrations.length;

    const container = document.getElementById("teamsContainer");

    container.replaceChildren();

    for (const registration of registrations) {

        const { data: players } = await db
            .from("players")
            .select("role, summoner_name")
            .eq("team_id", registration.teams.id);

        const card = createTeamCard(
            registration,
            players
        );

        container.appendChild(card);

    }

}



async function approveTeam(id) {

    const { error } = await db
        .from("registrations")
        .update({
            status: "approved"
        })
        .eq("id", id);
console.log(error);
    if (error) {

        alert(error.message);
        return;

    }
    await loadStats();
    await loadPendingTeams();

}

async function rejectTeam(id) {

    if (!confirm("¿Rechazar esta inscripción?"))
        return;

    const { error } = await db
        .from("registrations")
        .update({
            status: "rejected"
        })
        .eq("id", id);

    if (error) {

        alert(error.message);
        return;

    }
    await loadStats();
    await loadPendingTeams();

}

async function loadStats() {

    const { data: tournament } = await db
        .from("tournaments")
        .select("id")
        .eq("status", "open")
        .single();

    if (!tournament) return;

    const { count: pending } = await db
        .from("registrations")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("tournament_id", tournament.id)
        .eq("status", "pending");

    const { count: approved } = await db
        .from("registrations")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("tournament_id", tournament.id)
        .eq("status", "approved");

    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("approvedCount").textContent = approved;
    document.getElementById("teamsCount").textContent =
        pending + approved;

}

function showDashboard(){

    const container =
        document.getElementById("view");

    container.innerHTML = `

        <div class="stats">

            <div class="stat-card">

                <h2 id="pendingCount">0</h2>

                <span>Pendientes</span>

            </div>

            <div class="stat-card">

                <h2 id="approvedCount">0</h2>

                <span>Aprobados</span>

            </div>

            <div class="stat-card">

                <h2 id="teamsCount">0</h2>

                <span>Total Equipos</span>

            </div>

        </div>

        <div id="teamsContainer"></div>

    `;

    loadStats();

    loadPendingTeams();

}

document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("approve-btn")) {

        await approveTeam(
            e.target.dataset.id
        );

    }

    if (e.target.classList.contains("reject-btn")) {

        await rejectTeam(
            e.target.dataset.id
        );

    }

});

// =========================
// Inicio
// =========================

(async () => {

    const logged = await checkSession();

    if (!logged) return;

    showDashboard();

})();