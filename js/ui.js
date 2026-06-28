export function initUI() {

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

        window.scrollTo({

            top:
                target.getBoundingClientRect().top +
                window.scrollY -
                offset,

            behavior: "smooth"

        });

    });

    const heroContent =
        document.querySelector(".hero-content");

    window.addEventListener("scroll", () => {

        heroContent?.classList.toggle(
            "hide",
            window.scrollY > 100
        );

    });

}