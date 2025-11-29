-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES & STRUCTURE
-- ==========================================

-- Table: PROFILES
-- Extension des données utilisateurs Supabase Auth
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'admin')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'elite')),
    height NUMERIC, -- en cm
    weight NUMERIC, -- en kg
    goal TEXT, -- weight_loss, muscle_gain, etc.
    bio TEXT,
    assigned_coach_id UUID REFERENCES public.profiles(id),
    notification_preferences JSONB DEFAULT '{"marketing": true, "workout": true, "messages": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: PROGRAMS
-- Catalogue des programmes d'entraînement
CREATE TABLE public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    goal TEXT, -- weight_loss, muscle, cardio, flexibility
    duration_weeks INTEGER NOT NULL,
    price NUMERIC DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: USER_PROGRAMS
-- Liaison entre un utilisateur et un programme (Abonnement actif)
CREATE TABLE public.user_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: WORKOUTS
-- Séances d'entraînement liées à un programme
CREATE TABLE public.workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    day_number INTEGER NOT NULL, -- Jour dans le programme (ex: Jour 1 à 60)
    week_number INTEGER NOT NULL,
    duration_minutes INTEGER,
    calories_burn INTEGER,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: WORKOUT_LOGS
-- Historique des séances réalisées par l'utilisateur
CREATE TABLE public.workout_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_program_id UUID REFERENCES public.user_programs(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

-- Table: PROGRESS_LOGS
-- Suivi des métriques (Poids, Mensurations, Max Reps)
CREATE TABLE public.progress_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type TEXT NOT NULL, -- weight, body_fat, bench_press, squat, etc.
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: MESSAGES
-- Chat temps réel entre athlètes et coachs
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: TESTIMONIALS
-- Témoignages pour la page Success Stories
CREATE TABLE public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    program_name TEXT,
    quote TEXT NOT NULL,
    image_before TEXT,
    image_after TEXT,
    stats JSONB, -- ex: {"Poids": "-10kg", "Durée": "3 mois"}
    category TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: POSTS
-- Articles de blog
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    image_url TEXT,
    read_time INTEGER,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: FAQ_ITEMS
-- Questions fréquentes
CREATE TABLE public.faq_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: CONTACT_MESSAGES
-- Formulaire de contact
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: EXERCISE_VIDEOS
-- Bibliothèque vidéo
CREATE TABLE public.exercise_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration TEXT,
    thumbnail_url TEXT,
    storage_path TEXT, -- Chemin dans Supabase Storage
    video_url TEXT, -- URL directe si externe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- POLICIES: PROGRAMS (Catalogue public)
CREATE POLICY "Programs are viewable by everyone" 
ON public.programs FOR SELECT USING (true);

-- POLICIES: USER_PROGRAMS (Données privées)
CREATE POLICY "Users can view own programs" 
ON public.user_programs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs" 
ON public.user_programs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" 
ON public.user_programs FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES: WORKOUTS (Catalogue public)
CREATE POLICY "Workouts are viewable by everyone" 
ON public.workouts FOR SELECT USING (true);

-- POLICIES: WORKOUT_LOGS (Données privées)
CREATE POLICY "Users can view/edit own logs" 
ON public.workout_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_programs up 
        WHERE up.id = workout_logs.user_program_id 
        AND up.user_id = auth.uid()
    )
);

-- POLICIES: PROGRESS_LOGS (Données privées)
CREATE POLICY "Users can manage own progress" 
ON public.progress_logs FOR ALL USING (auth.uid() = user_id);

-- POLICIES: MESSAGES (Privé entre sender et receiver)
CREATE POLICY "Users can view their own messages" 
ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can insert messages" 
ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- POLICIES: PUBLIC CONTENT (Blog, FAQ, Testimonials, Videos)
CREATE POLICY "Public content is viewable by everyone" 
ON public.testimonials FOR SELECT USING (is_published = true);

CREATE POLICY "Posts are viewable by everyone" 
ON public.posts FOR SELECT USING (is_published = true);

CREATE POLICY "FAQ is viewable by everyone" 
ON public.faq_items FOR SELECT USING (true);

CREATE POLICY "Videos are viewable by everyone" 
ON public.exercise_videos FOR SELECT USING (true);

-- POLICIES: CONTACT MESSAGES (Public Insert)
CREATE POLICY "Anyone can insert contact message" 
ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'athlete')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. REALTIME SETUP
-- ==========================================

-- Ajouter la table messages à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ==========================================
-- 5. STORAGE BUCKETS (Configuration via SQL)
-- ==========================================
-- Note: La création des buckets se fait souvent via l'interface, 
-- mais voici les insertions pour la table storage.buckets si nécessaire.

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false) ON CONFLICT DO NOTHING; -- Privé pour contenu premium

-- Policies Storage Avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' );