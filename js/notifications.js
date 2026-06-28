export function showNotification(message, type = "success") {

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