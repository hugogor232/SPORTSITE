# FitCoach Pro - Plateforme de Coaching Sportif Serverless

FitCoach Pro est une application web moderne de coaching sportif personnalisé, construite sur une architecture **Serverless** utilisant **Supabase** comme backend unique (BaaS).

Le projet propose une expérience utilisateur fluide (SPA-like) avec authentification sécurisée, gestion de profils, programmes d'entraînement dynamiques, suivi de progression graphique et messagerie en temps réel.

## 🚀 Fonctionnalités

- **Authentification Complète** : Email/Mot de passe + OAuth (Google, Apple) via Supabase Auth.
- **Base de Données Temps Réel** : PostgreSQL avec Row Level Security (RLS) pour la protection des données.
- **Messagerie Instantanée** : Chat en direct entre coach et athlète via Supabase Realtime.
- **Stockage Multimédia** : Gestion des avatars et vidéos d'exercices via Supabase Storage.
- **Tableau de Bord Dynamique** : Agrégation des données utilisateur (stats, prochaines séances).
- **Design System** : Interface responsive Mobile-First, mode sombre, animations CSS soignées.

## 🛠 Stack Technique

- **Frontend** : HTML5, CSS3 (Variables, Flexbox/Grid), JavaScript (ES Modules).
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions).
- **Graphiques** : Chart.js.
- **Icônes** : FontAwesome 6.

## 📋 Prérequis

- Un navigateur web moderne.
- Un compte [Supabase](https://supabase.com) (Gratuit).
- Un serveur web local pour exécuter les modules ES (ex: Extension "Live Server" sur VS Code, Python SimpleHTTPServer, ou Node http-server).

## ⚙️ Installation et Configuration

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/fitcoach-pro.git
cd fitcoach-pro
```

### 2. Configuration Supabase

1.  Créez un nouveau projet sur [Supabase](https://app.supabase.com).
2.  Allez dans **Project Settings > API** pour récupérer :
    -   `Project URL`
    -   `anon public key`

### 3. Base de Données (SQL)

1.  Dans le dashboard Supabase, allez dans l'onglet **SQL Editor**.
2.  Ouvrez le fichier `schema.sql` fourni dans ce projet.
3.  Copiez tout le contenu et collez-le dans l'éditeur SQL de Supabase.
4.  Exécutez le script (`Run`).
    *   *Cela va créer les tables, les relations, les politiques de sécurité RLS, les triggers pour la création de profil et les buckets de stockage.*

### 4. Configuration de l'Authentification

1.  Allez dans **Authentication > Providers**.
2.  Activez **Email**.
3.  (Optionnel) Configurez **Google** ou **Apple** si vous souhaitez utiliser l'OAuth.
4.  Allez dans **Authentication > URL Configuration**.
5.  Ajoutez l'URL de votre site (ex: `http://localhost:5500` ou votre URL Vercel) dans **Site URL** et **Redirect URLs**.

### 5. Configuration du Client JS

1.  Ouvrez le fichier `supabaseClient.js` à la racine du projet.
2.  Remplacez les valeurs placeholders par vos clés Supabase :

```javascript
const SUPABASE_URL = 'VOTRE_SUPABASE_URL_ICI'
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY_ICI'
```

### 6. Données de test (Optionnel)

Pour tester l'application immédiatement, vous pouvez insérer des données factices dans la table `programs`, `workouts` et `exercise_videos` via l'éditeur de table Supabase, ou créer un script SQL de seed.

## 🚀 Lancement

Puisque le projet utilise des modules ES (`type="module"`), vous ne pouvez pas ouvrir `index.html` directement depuis le système de fichiers (`file://`). Vous devez utiliser un serveur local.

**Avec VS Code :**
1.  Installez l'extension **Live Server**.
2.  Faites un clic droit sur `index.html`.
3.  Choisissez "Open with Live Server".

**Avec Python :**
```bash
# Python 3
python -m http.server 8000
```
Ouvrez ensuite `http://localhost:8000` dans votre navigateur.

## 📦 Déploiement

Ce projet est statique (HTML/CSS/JS), il peut être déployé gratuitement et instantanément sur :

-   **Vercel** : Importez votre repo Git, aucune configuration de build n'est nécessaire.
-   **Netlify** : Glissez-déposez le dossier du projet.
-   **GitHub Pages** : Activez Pages dans les paramètres du repo.

**Note importante pour le déploiement :**
Assurez-vous d'ajouter l'URL de production (ex: `https://mon-fitcoach.vercel.app`) dans la liste des **Redirect URLs** dans l'interface d'authentification Supabase.

## 🔒 Sécurité

-   Toutes les interactions avec la base de données sont protégées par **Row Level Security (RLS)**.
-   Les clés API exposées dans le frontend (`anon key`) sont sûres tant que les politiques RLS sont correctement configurées (ce qui est le cas dans `schema.sql`).
-   Ne jamais exposer la `service_role key` côté client.

## 📂 Structure des fichiers

-   `index.html` : Landing page publique.
-   `dashboard.html` : Tableau de bord privé (protégé).
-   `login.html` / `register.html` : Pages d'auth.
-   `style.css` : Styles globaux et design system.
-   `script.js` : Logique UI (menu, animations).
-   `supabaseClient.js` : Initialisation du client Supabase.
-   `auth-oauth.js` : Fonctions de gestion de session.
-   `schema.sql` : Structure de la base de données.