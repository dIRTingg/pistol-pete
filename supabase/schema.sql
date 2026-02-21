-- ═══════════════════════════════════════════════════════════════════════════
-- PISTOL PETE – Supabase Datenbankschema
-- TV Häslach e.V. Tennis | Ballmaschinen-App
-- ═══════════════════════════════════════════════════════════════════════════
-- Ausführen in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES (erweitert Supabase Auth users)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatisch ein Profil anlegen wenn ein neuer Auth-User entsteht
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SESSIONS (Ballmaschinen-Nutzungen)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name     TEXT NOT NULL,                      -- Denormalisiert für schnelle Anzeige
  start_at      TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER NOT NULL CHECK (duration_min > 0),
  cost          NUMERIC(5,2) NOT NULL,
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für häufige Abfragen
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_start_at_idx ON public.sessions(start_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CORRECTION REQUESTS (Korrekturanfragen)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.correction_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name           TEXT NOT NULL,
  requested_duration  INTEGER NOT NULL CHECK (requested_duration >= 0),
                      -- 0 = Stornierung
  note                TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS corrections_status_idx
  ON public.correction_requests(status)
  WHERE status = 'pending';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) – Zugriffsschutz
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_requests ENABLE ROW LEVEL SECURITY;

-- Helper: Ist der aktuelle User ein Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- PROFILES Policies
CREATE POLICY "Nutzer sieht eigenes Profil"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin sieht alle Profile"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin kann Profile anlegen"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin kann Profile aktualisieren"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin kann Profile löschen"
  ON public.profiles FOR DELETE
  USING (public.is_admin() AND id != auth.uid()); -- Sich selbst nicht löschen


-- SESSIONS Policies
CREATE POLICY "Nutzer sieht eigene Sessions"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Nutzer kann Session anlegen"
  ON public.sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin kann Sessions aktualisieren"
  ON public.sessions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin kann Sessions löschen"
  ON public.sessions FOR DELETE
  USING (public.is_admin());


-- CORRECTION REQUESTS Policies
CREATE POLICY "Nutzer sieht eigene Korrekturen"
  ON public.correction_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Nutzer kann Korrektur beantragen"
  ON public.correction_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin kann Korrektur aktualisieren"
  ON public.correction_requests FOR UPDATE
  USING (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. HILFSFUNKTION: Kosten berechnen (5 EUR / angefangene Stunde)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calc_cost(duration_minutes INTEGER)
RETURNS NUMERIC AS $$
  SELECT CEIL(duration_minutes::NUMERIC / 60) * 5;
$$ LANGUAGE sql IMMUTABLE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BEISPIEL: Admin-User anlegen
-- ─────────────────────────────────────────────────────────────────────────────
-- WICHTIG: Nutzer werden über Supabase Auth angelegt (Dashboard → Auth → Users)
-- Danach Rolle manuell setzen:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'uuid-des-admin-users';
--
-- Oder direkt im Dashboard: Authentication → Users → User anklicken → User Metadata:
-- { "name": "Florian Haustein", "role": "admin" }
