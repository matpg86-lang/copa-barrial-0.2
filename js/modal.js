import { showNotification } from "./notifications.js";

export function initModal() {

    document
        .getElementById("closePaymentModal")
        ?.addEventListener("click", closePaymentModal);

    document
        .getElementById("copyAlias")
        ?.addEventListener("click", () => copyText("alias"));

    document
        .getElementById("copyCvu")
        ?.addEventListener("click", () => copyText("cvu"));

}

export function openPaymentModal() {

    document
        .getElementById("paymentModal")
        .classList.add("show");

}

export function closePaymentModal() {

    document
        .getElementById("paymentModal")
        .classList.remove("show");

}

export function copyText(id) {

    navigator.clipboard.writeText(
        document.getElementById(id).textContent
    );

    showNotification("Copiado al portapapeles.");

}