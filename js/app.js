import { cargarProximoTorneo } from "./tournament.js";
import { loadTeams } from "./teams.js";
import { initRegistration } from "./registration.js";
import { initAnimations } from "./animations.js";
import { initUI } from "./ui.js";
import { initModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", async () => {

    initUI();

    initAnimations();

    initRegistration();

    initModal();

    await Promise.all([

        cargarProximoTorneo(),

        loadTeams()

    ]);

});