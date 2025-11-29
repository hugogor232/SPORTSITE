/* =========================================
   GLOBAL UI LOGIC - FitCoach Pro
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initFormValidation();
    initNumberCounters();
});

/* -----------------------------------------
   1. MENU MOBILE (BURGER)
   ----------------------------------------- */
function initMobileMenu() {
    const burger = document.getElementById('burger-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            navLinks.classList.toggle('active');
            
            // Toggle Burger Animation
            burger.classList.toggle('toggle');
            
            // Animate Links
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `fadeIn 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });

        // Close menu when clicking a link
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
            });
        });
    }
}

/* -----------------------------------------
   2. SCROLL ANIMATIONS (Intersection Observer)
   ----------------------------------------- */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Si c'est une barre de progression, animer la largeur
                if (entry.target.classList.contains('progress-fill')) {
                    const width = entry.target.getAttribute('data-width');
                    if (width) entry.target.style.width = width + '%';
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Cible les éléments à animer
    const animatedElements = document.querySelectorAll(
        '.animate-up, .card, .feature-card, .coach-card, .program-card, .progress-fill'
    );

    animatedElements.forEach(el => {
        // Ajoute une classe de base pour le CSS si nécessaire
        el.classList.add('scroll-hidden'); 
        observer.observe(el);
    });
}

/* -----------------------------------------
   3. SMOOTH SCROLL (Ancres)
   ----------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80; // Hauteur du header fixe
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

/* -----------------------------------------
   4. FORM VALIDATION & FEEDBACK
   ----------------------------------------- */
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Validation en temps réel
            input.addEventListener('input', () => {
                validateInput(input);
            });

            // Validation au blur
            input.addEventListener('blur', () => {
                validateInput(input);
            });
        });
    });
}

function validateInput(input) {
    // Reset styles
    input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    
    // Check validity
    if (input.checkValidity()) {
        if (input.value.length > 0) {
            input.style.borderColor = '#ccff00'; // Vert valide
        }
    } else {
        input.style.borderColor = '#ff4400'; // Rouge erreur
    }

    // Cas spécifique Email
    if (input.type === 'email' && input.value.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            input.style.borderColor = '#ff4400';
        }
    }
}

/* -----------------------------------------
   5. NUMBER COUNTERS ANIMATION
   ----------------------------------------- */
function initNumberCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Plus c'est bas, plus c'est rapide

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                
                const updateCount = () => {
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target;
                    }
                };

                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/* -----------------------------------------
   6. UTILS
   ----------------------------------------- */

// Debounce function pour limiter les appels (ex: resize, scroll)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Formatage de date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Formatage de nombre (ex: prix)
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Gestion globale des Modales (si utilisées hors contexte spécifique)
window.toggleModal = function(modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (show) {
            document.body.style.overflow = 'hidden'; // Empêche le scroll background
        } else {
            document.body.style.overflow = '';
        }
    }
};

// Fermeture modale avec touche Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});