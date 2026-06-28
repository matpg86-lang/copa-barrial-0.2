import { getOpenTournament } from "./services/tournamentService.js";
import { showNotification } from "./notifications.js";
import { openPaymentModal } from "./modal.js";
import { validateRegistration } from "./validators.js";
import { createRegistration } from "./services/registrationService.js";

export function initRegistration() {

    const form = document.querySelector(".form");

    if (!form) return;

    form.addEventListener("submit", handleRegistration);

}

async function handleRegistration(e) {

    e.preventDefault();

    const data = getFormData();

    try {

        const tournament = await getOpenTournament();

        await validateRegistration(
            data,
            tournament
        );

        await createRegistration(
            data,
            tournament.id
        );

        openPaymentModal();

        e.target.reset();

    } catch (err) {

        console.error(err);

        showNotification(
            err.message,
            "error"
        );

    }

}

function getFormData() {

    return {

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

}