import { supabase } from './supabaseClient.js';

/**
 * Connexion avec Email et Mot de passe
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{data, error}>}
 */
export async function loginWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Inscription avec Email et Mot de passe
 * @param {string} email 
 * @param {string} password 
 * @param {object} metadata - Données supplémentaires (full_name, etc.)
 * @returns {Promise<{data, error}>}
 */
export async function registerWithEmail(email, password, metadata = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: metadata
            }
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Connexion via OAuth (Google, Apple, etc.)
 * @param {string} provider - 'google' | 'apple' | 'facebook'
 * @returns {Promise<{data, error}>}
 */
export async function loginWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/dashboard.html`
            }
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Déconnexion de l'utilisateur
 * Redirige vers la page d'accueil après succès
 */
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Erreur lors de la déconnexion:', err.message);
    }
}

/**
 * Envoi d'un email de réinitialisation de mot de passe
 * @param {string} email 
 * @returns {Promise<{data, error}>}
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/settings.html`
        });
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Vérifie la session active pour les pages publiques (UI intelligente)
 * Met à jour les boutons de navigation si connecté
 * @returns {Promise<Session|null>}
 */
export async function checkSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        updateAuthUI(session);
        return session;
    } catch (err) {
        console.error('Erreur vérification session:', err);
        return null;
    }
}

/**
 * Protège les pages privées
 * Redirige vers login.html si aucun utilisateur n'est connecté
 * @returns {Promise<Session>}
 */
export async function protectPrivatePage() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Sauvegarde l'URL actuelle pour rediriger après login (optionnel)
        sessionStorage.setItem('redirect_to', window.location.href);
        window.location.href = 'login.html';
        return null;
    }
    
    return session;
}

/**
 * Met à jour l'interface utilisateur (Boutons Connexion/Dashboard)
 * @param {Session} session 
 */
function updateAuthUI(session) {
    const authBtns = document.querySelectorAll('.auth-action-btn, #auth-action-btn');
    
    authBtns.forEach(btn => {
        if (session) {
            btn.textContent = 'Mon Dashboard';
            btn.href = 'dashboard.html';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            
            // Ajouter un écouteur pour la déconnexion si c'est un bouton spécifique logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        } else {
            btn.textContent = 'Connexion';
            btn.href = 'login.html';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    });

    // Gestion de l'affichage du profil dans la sidebar ou header
    if (session) {
        const userEmailEls = document.querySelectorAll('.user-email-display');
        userEmailEls.forEach(el => el.textContent = session.user.email);
    }
}

/**
 * Écouteur global des changements d'état d'authentification
 * Gère la persistance et les mises à jour UI automatiques
 */
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        updateAuthUI(session);
        // Redirection si on vient d'une page protégée
        const redirect = sessionStorage.getItem('redirect_to');
        if (redirect) {
            sessionStorage.removeItem('redirect_to');
            window.location.href = redirect;
        }
    } else if (event === 'SIGNED_OUT') {
        updateAuthUI(null);
        // Si on est sur une page privée, on redirige vers l'accueil
        const privatePages = ['dashboard.html', 'program.html', 'stats.html', 'messages.html', 'profile.html', 'settings.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (privatePages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
});

// Initialisation au chargement du DOM pour les pages qui importent ce script
document.addEventListener('DOMContentLoaded', () => {
    // Ne pas exécuter checkSession sur les pages de login/register pour éviter les boucles ou flashs
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html') {
        checkSession();
    }
});