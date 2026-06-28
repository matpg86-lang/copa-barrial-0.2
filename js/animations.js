export function initAnimations() {

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    }, {

        threshold: .15

    });

    document
        .querySelectorAll(".card,.form-container")
        .forEach(el => observer.observe(el));

}