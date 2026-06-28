let countdownInterval;

export function iniciarCuentaRegresiva(fecha) {

    const objetivo = new Date(fecha).getTime();

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {

        const diferencia = objetivo - Date.now();

        if (diferencia <= 0) {

            clearInterval(countdownInterval);

            document.getElementById("days").textContent = "0";
            document.getElementById("hours").textContent = "0";
            document.getElementById("minutes").textContent = "0";
            document.getElementById("seconds").textContent = "0";

            return;

        }

        document.getElementById("days").textContent =
            Math.floor(diferencia / 86400000);

        document.getElementById("hours").textContent =
            Math.floor((diferencia % 86400000) / 3600000);

        document.getElementById("minutes").textContent =
            Math.floor((diferencia % 3600000) / 60000);

        document.getElementById("seconds").textContent =
            Math.floor((diferencia % 60000) / 1000);

    }, 1000);

}