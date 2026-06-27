const supabaseUrl = "https://jszgafljtsyohksffjdd.supabase.co";
const supabaseKey = "sb_publishable_bTNuABiFd42Ts1zDF8uZRg_pmcEYOPc";

const db = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

console.log(supabaseUrl);
console.log(supabaseKey);
console.log(db);

async function probarConexion() {

    const { data, error } = await db
        .from("tournaments")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    console.log(data);
}

probarConexion();

// =========================
// Smooth Scroll
// =========================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", e => {

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

        if (target) {

            const offset = 100; // altura del header

            const y = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: y,
                behavior: "smooth"
            });

        }

    });

});

// =========================
// Normalizar datos
// =========================

data.team = data.team.trim();
data.captain = data.captain.trim();
data.discord = data.discord.trim();

Object.keys(data.roster).forEach(role => {
    data.roster[role] = data.roster[role].trim();
});

// =========================
// Validar nombre del equipo
// =========================

if (data.team.length < 3) {

    showNotification(
        "El nombre del equipo debe tener al menos 3 caracteres.",
        "error"
    );

    return;

}

// =========================
// Crear roster
// =========================

const roster = [
    data.roster.top,
    data.roster.jungle,
    data.roster.mid,
    data.roster.adc,
    data.roster.support
];

// =========================
// Validar formato Riot ID
// =========================

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

// =========================
// Capitán debe estar en el roster
// =========================

const captain = data.captain.toLowerCase();

const rosterLower = roster.map(player =>
    player.toLowerCase()
);

if (!rosterLower.includes(captain)) {

    showNotification(
        "El capitán debe formar parte del roster.",
        "error"
    );

    return;

}

// =========================
// Jugadores repetidos
// =========================

const uniqueRoster = new Set(rosterLower);

if (uniqueRoster.size !== rosterLower.length) {

    showNotification(
        "No puede haber Riot IDs repetidos en el roster.",
        "error"
    );

    return;

}

// =========================
// Equipo existente
// =========================

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

// =========================
// Discord existente
// =========================

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

// =========================
// Jugadores ya inscriptos
// =========================

const { data: existingPlayers } = await db
    .from("players")
    .select("summoner_name")
    .in("summoner_name", roster);

if (existingPlayers.length > 0) {

    showNotification(
        `El jugador ${existingPlayers[0].summoner_name} ya está inscripto.`,
        "error"
    );

    return;

}

// =========================
// Cupos disponibles
// =========================

const { count } = await db
    .from("registrations")
    .select("*", {
        count: "exact",
        head: true
    })
    .eq("tournament_id", tournament.id);

if (count >= tournament.max_teams) {

    showNotification(
        "El torneo ya está completo.",
        "error"
    );

    return;

}

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
            .select("id")
            .eq("status", "open")
            .single();

        if (tournamentError) throw tournamentError;

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
                status: "pending"
            });

        if (registrationError) throw registrationError;

        // Guardar jugadores
        const { error: playersError } = await db
            .from("players")
            .insert([
                {
                    team_id: team.id,
                    role: "Top",
                    summoner_name: data.roster.top
                },
                {
                    team_id: team.id,
                    role: "Jungle",
                    summoner_name: data.roster.jungle
                },
                {
                    team_id: team.id,
                    role: "Mid",
                    summoner_name: data.roster.mid
                },
                {
                    team_id: team.id,
                    role: "ADC",
                    summoner_name: data.roster.adc
                },
                {
                    team_id: team.id,
                    role: "Support",
                    summoner_name: data.roster.support
                }
            ]);

        if (playersError) throw playersError;

        showNotification(
            "Equipo inscrito correctamente.",
            "success"
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

        },300);

    },3000);

}

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("visible");

        }

    });

},{
    threshold:.15
});

document.querySelectorAll(".card,.form-container").forEach(el=>{

    observer.observe(el);

});