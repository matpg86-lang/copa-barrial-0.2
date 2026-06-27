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
// Formulario
// =========================

const form = document.querySelector(".form");

form.addEventListener("submit", e => {

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

    console.log(data);

    showNotification(
        "Equipo inscrito correctamente.",
        "success"
    );

    form.reset();

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