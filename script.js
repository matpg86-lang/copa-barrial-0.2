// =========================
// Supabase
// =========================

const supabaseUrl = "https://jszgafljtsyohksffjdd.supabase.co";
const supabaseKey = "sb_publishable_bTNuABiFd42Ts1zDF8uZRg_pmcEYOPc";

const db = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// =========================
// Smooth Scroll
// =========================

document.addEventListener("click", e => {

    const link = e.target.closest('a[href^="#"]');

    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute("href");

    if (href === "#inicio") {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;

    }

    const target = document.querySelector(href);

    if (!target) return;

    const offset = 100;

    const y =
        target.getBoundingClientRect().top +
        window.scrollY -
        offset;

    window.scrollTo({
        top: y,
        behavior: "smooth"
});

});

const heroContent = document.querySelector(".hero-content");

window.addEventListener("scroll", () => {

    if (window.scrollY > 100) {

        heroContent.classList.add("hide");

    } else {

        heroContent.classList.remove("hide");

    }

});

// =========================
// Formulario
// =========================

const form = document.querySelector(".form");

form.addEventListener("submit", async e => {

    e.preventDefault();

    const data = {
        team: document.getElementById("team-name").value.trim(),
        captain: document.getElementById("captain-name").value.trim(),
        discord: document.getElementById("captain-discord").value.trim(),

        roster: {
            top: document.getElementById("top").value.trim(),
            jungle: document.getElementById("jg").value.trim(),
            mid: document.getElementById("mid").value.trim(),
            adc: document.getElementById("adc").value.trim(),
            support: document.getElementById("supp").value.trim()
        }
    };

    try {

        // Buscar torneo abierto
        const { data: tournament, error: tournamentError } = await db
            .from("tournaments")
            .select("id, max_teams")
            .eq("status", "open")
            .single();

        if (tournamentError) throw tournamentError;

        // =========================
        // Validaciones
        // =========================

        // Normalizar datos
        data.team = data.team.trim();
        data.captain = data.captain.trim();
        data.discord = data.discord.trim();

        Object.keys(data.roster).forEach(role => {
            data.roster[role] = data.roster[role].trim();
        });

        // Nombre del equipo
        if (data.team.length < 3) {

            showNotification(
                "El nombre del equipo debe tener al menos 3 caracteres.",
                "error"
            );

            return;
        }

        // Crear array del roster
        const roster = [
            data.roster.top,
            data.roster.jungle,
            data.roster.mid,
            data.roster.adc,
            data.roster.support
        ];

        // Validar formato Riot ID
        function isValidRiotId(riotId) {

            return /^[A-Za-z0-9 _.-]{3,16}#[A-Za-z0-9]{2,5}$/.test(
                riotId
            );

        }

        const riotIds = [
            data.captain,
            ...roster
        ];

        for (const riotId of riotIds) {

            if (!isValidRiotId(riotId)) {

                showNotification(
                    `Riot ID inválido: ${riotId}`,
                    "error"
                );

                return;

            }

        }

        // Capitán debe estar dentro del roster
        const captain = data.captain.toLowerCase();

        const rosterLower = roster.map(player =>
            player.toLowerCase()
        );

        if (!rosterLower.includes(captain)) {

            showNotification(
                "El Riot ID del capitán debe formar parte del roster.",
                "error"
            );

            return;

        }

        // No puede haber Riot IDs repetidos
        const uniqueRoster = new Set(rosterLower);

        if (uniqueRoster.size !== rosterLower.length) {

            showNotification(
                "No puede haber Riot IDs repetidos en el roster.",
                "error"
            );

            return;

        }

        // Nombre de equipo repetido
        const { data: existingTeam } = await db
            .from("teams")
            .select("id")
            .ilike("name", data.team)
            .limit(1);

        if (existingTeam.length > 0) {

            showNotification(
                "Ya existe un equipo con ese nombre.",
                "error"
            );

            return;

        }

        // Discord repetido
        const { data: existingDiscord } = await db
            .from("teams")
            .select("id")
            .ilike("captain_discord", data.discord)
            .limit(1);

        if (existingDiscord.length > 0) {

            showNotification(
                "Ese Discord ya tiene un equipo registrado.",
                "error"
            );

            return;

        }

        // Riot IDs ya inscriptos
        const { data: existingPlayers } = await db
            .from("players")
            .select("summoner_name")
            .in("summoner_name", roster);

        if (existingPlayers && existingPlayers.length > 0) {

            showNotification(
                `El jugador ${existingPlayers[0].summoner_name} ya está inscripto.`,
                "error"
            );

            return;

        }

        // Cupos disponibles
        const { count } = await db
            .from("registrations")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("tournament_id", tournament.id);

        if (count >= tournament.max_teams) {

            showNotification(
                "El torneo ya alcanzó el máximo de equipos.",
                "error"
            );

            return;

        }

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

        // Registrar equipo en el torneo
        const { error: registrationError } = await db
            .from("registrations")
            .insert({
                tournament_id: tournament.id,
                team_id: team.id,
                status: "pending_payment"
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

        openPaymentModal(
    data.team,
    data.captain
);

form.reset();

    } catch (err) {

        console.error(err);

        showNotification(
            err.message,
            "error"
        );

    }

});

function showNotification(message, type = "success") {

    const notification = document.createElement("div");

    notification.className = "notification";

    notification.textContent = message;

    Object.assign(notification.style, {

        position: "fixed",

        top: "20px",

        right: "20px",

        padding: "16px 24px",

        borderRadius: "8px",

        background: type === "success"
            ? "#28a745"
            : "#dc3545",

        color: "#fff",

        zIndex: 9999,

        opacity: 0,

        transform: "translateY(-15px)",

        transition: ".3s"

    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {

        notification.style.opacity = 1;

        notification.style.transform = "translateY(0)";

    });

    setTimeout(() => {

        notification.style.opacity = 0;

        notification.style.transform = "translateY(-15px)";

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 3000);

}

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

        }

    });

}, {
    threshold: .15
});

document.querySelectorAll(".card,.form-container").forEach(el => {

    observer.observe(el);

});

async function cargarProximoTorneo() {

    const { data: tournament, error } = await db
        .from("tournaments")
        .select("*")
        .eq("status", "open")
        .order("start_date")
        .limit(1)
        .single();

    if (error) {
        console.error(error);
        return;
    }

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
        .replace(" p. m.", " p.m.")
        .replace(" a. m.", " a.m.")
        .replace(" p. m.", " p.m.");

    document.getElementById("nextTournamentDate").innerHTML =
        `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dia} de ${mes}<br>${hora}`;

    const { count } = await db
        .from("registrations")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("tournament_id", tournament.id);

    document.getElementById("tournamentSlots").textContent =
        `${count} / ${tournament.max_teams} equipos inscriptos`;

    const porcentaje = (count / tournament.max_teams) * 100;

    document.getElementById("slotsProgress").style.width =
        `${porcentaje}%`;

    iniciarCuentaRegresiva(tournament.start_date);

}

function iniciarCuentaRegresiva(fecha) {

    const objetivo = new Date(fecha).getTime();

    setInterval(() => {

        const ahora = Date.now();

        const diferencia = objetivo - ahora;

        if (diferencia <= 0) {

            return;

        }

        document.getElementById("days").textContent =
            Math.floor(diferencia / 86400000);

        document.getElementById("hours").textContent =
            Math.floor(diferencia % 86400000 / 3600000);

        document.getElementById("minutes").textContent =
            Math.floor(diferencia % 3600000 / 60000);

        document.getElementById("seconds").textContent =
            Math.floor(diferencia % 60000 / 1000);

    }, 1000);

}

async function loadTeams() {

    const { data: tournament, error: tournamentError } = await db
        .from("tournaments")
        .select("id, max_teams")
        .eq("status", "open")
        .single();

    if (tournamentError) {
        console.error(tournamentError);
        return;
    }

    const { data: registrations, error: registrationsError } = await db
        .from("registrations")
        .select(`
            team_id,
            teams (
                name
            )
        `)
        .eq("tournament_id", tournament.id);

    if (registrationsError) {
        console.error(registrationsError);
        return;
    }

    const list = document.getElementById("teamsList");

    list.innerHTML = "";

    registrations.forEach(registration => {

        list.innerHTML += `
            <div class="team-item">

                <span class="team-name">
                    ${registration.teams.name}
                </span>

                <span class="team-status">
                    Inscripto
                </span>

            </div>
        `;

    });

    const available = tournament.max_teams - registrations.length;

    for (let i = 0; i < available; i++) {

        list.innerHTML += `
            <a href="#inscripcion" class="team-item available-slot">

                <span class="team-name">
                    ✅ Cupo disponible
                </span>

                <span class="team-status available">
                    Inscribirse
                </span>

            </a>
        `;

    }

}

function openPaymentModal(teamName, captain) {

    const phone = "549223XXXXXXXX";

    const message =
`Hola.

Realicé el pago de la inscripción.

Equipo: ${teamName}

Capitán: ${captain}

Adjunto el comprobante.`;

    document
        .getElementById("whatsappButton")
        .href =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    document
        .getElementById("paymentModal")
        .classList.add("show");

}

function closePaymentModal() {

    document
        .getElementById("paymentModal")
        .classList.remove("show");

}

function copyText(id){

    navigator.clipboard.writeText(
        document.getElementById(id).textContent
    );

    showNotification(
        "Copiado al portapapeles."
    );

}

cargarProximoTorneo();
loadTeams();