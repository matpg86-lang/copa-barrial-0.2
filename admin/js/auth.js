const supabaseUrl = "https://jszgafljtsyohksffjdd.supabase.co";
const supabaseKey = "sb_publishable_bTNuABiFd42Ts1zDF8uZRg_pmcEYOPc";

const db = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// Si ya hay sesión, entrar directamente al dashboard
(async () => {

    const { data } = await db.auth.getSession();

    if (data.session) {

        window.location.href = "dashboard.html";

    }

})();

const loginButton = document.getElementById("loginButton");

if (loginButton) {

    loginButton.addEventListener("click", login);

}

async function login() {

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const { error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {

        alert(error.message);
        return;

    }

    window.location.href = "dashboard.html";

}