// Funcionalidades de la página

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Validación y envío del formulario
const form = document.querySelector('.form');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const teamName = document.getElementById('team-name').value.trim();
    const captainName = document.getElementById('captain-name').value.trim();
    const captainEmail = document.getElementById('captain-email').value.trim();
    const captainSummoner = document.getElementById('captain-summoner').value.trim();
    const players = document.getElementById('players').value.trim();
    const terms = document.getElementById('terms').checked;

    // Validaciones básicas
    if (!teamName) {
        showNotification('Por favor ingresa el nombre del equipo', 'error');
        return;
    }

    if (!captainName) {
        showNotification('Por favor ingresa tu nombre', 'error');
        return;
    }

    if (!isValidEmail(captainEmail)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }

    if (!captainSummoner) {
        showNotification('Por favor ingresa tu nombre de invocador', 'error');
        return;
    }

    const playerList = players.split(',').map(p => p.trim()).filter(p => p);
    if (playerList.length < 5) {
        showNotification('Debes ingresar al menos 5 nombres de invocadores', 'error');
        return;
    }

    if (!terms) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return;
    }

    // Si todas las validaciones pasan
    showNotification('¡Equipo inscrito correctamente! Revisa tu email para más información', 'success');
    form.reset();

    // Aquí iría el envío a un servidor
    console.log({
        teamName,
        captainName,
        captainEmail,
        captainSummoner,
        players: playerList
    });
});

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos inline para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '5px',
        zIndex: '9999',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
    });

    // Colores según tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
        notification.style.color = '#fff';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
        notification.style.color = '#fff';
    } else {
        notification.style.backgroundColor = 'var(--card-bg)';
        notification.style.color = 'var(--accent-color)';
        notification.style.border = '2px solid var(--accent-color)';
    }

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animaciones CSS dinámicas
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Efecto parallax suave en hero
window.addEventListener('scroll', function () {
    const scrollPosition = window.scrollY;
    const heroSection = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');

    if (heroSection && window.innerWidth > 1024) {
        heroBackground.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});

// Observador para animaciones al scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todos los cards
document.querySelectorAll('.card, .prize-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Contador de visitantes simple (localStorage)
function updateVisitorCount() {
    let count = localStorage.getItem('copa-barrial-visitors') || 0;
    count = parseInt(count) + 1;
    localStorage.setItem('copa-barrial-visitors', count);
    console.log(`Visitantes: ${count}`);
}

// Ejecutar al cargar
updateVisitorCount();
