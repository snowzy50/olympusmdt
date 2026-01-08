-- Migration: Correction globale des contraintes UUID pour toutes les tables MDT
-- Créé par: Snowzy
-- Date: 2026-01-08
-- Description: Supprime les contraintes FK UUID et ajoute/modifie les colonnes TEXT nécessaires

-- ===================================
-- 1. TABLE WARRANTS (Mandats)
-- ===================================

-- Supprimer la contrainte FK si elle existe
ALTER TABLE IF EXISTS public.warrants
DROP CONSTRAINT IF EXISTS warrants_issued_by_id_fkey;

ALTER TABLE IF EXISTS public.warrants
DROP CONSTRAINT IF EXISTS warrants_suspect_id_fkey;

-- Ajouter la colonne issued_by_name si elle n'existe pas
ALTER TABLE public.warrants
ADD COLUMN IF NOT EXISTS issued_by_name TEXT;

-- Ajouter la colonne number si elle n'existe pas (certaines migrations utilisent warrant_number)
ALTER TABLE public.warrants
ADD COLUMN IF NOT EXISTS number TEXT;

-- Copier warrant_number vers number si nécessaire
UPDATE public.warrants
SET number = warrant_number
WHERE number IS NULL AND warrant_number IS NOT NULL;

-- Ajouter issued_at si manquant
ALTER TABLE public.warrants
ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT NOW();

-- Copier issued_date vers issued_at si nécessaire
UPDATE public.warrants
SET issued_at = issued_date
WHERE issued_at IS NULL AND issued_date IS NOT NULL;

-- Ajouter expires_at si manquant
ALTER TABLE public.warrants
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ===================================
-- 2. TABLE EVENTS (Événements)
-- ===================================

-- Supprimer la contrainte FK si elle existe
ALTER TABLE IF EXISTS public.events
DROP CONSTRAINT IF EXISTS events_created_by_fkey;

-- Changer le type de created_by en TEXT si c'est UUID
DO $$
BEGIN
  -- Vérifier si la colonne existe et est de type UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events'
    AND column_name = 'created_by'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.events ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
  END IF;
END $$;

-- S'assurer que created_by existe
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ===================================
-- 3. TABLE DISPATCH_CALLS
-- ===================================

-- Supprimer la contrainte FK si elle existe
ALTER TABLE IF EXISTS public.dispatch_calls
DROP CONSTRAINT IF EXISTS dispatch_calls_created_by_fkey;

-- Changer le type de created_by en TEXT si c'est UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatch_calls'
    AND column_name = 'created_by'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.dispatch_calls ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
  END IF;
END $$;

-- ===================================
-- 4. TABLE SUMMONS (Convocations)
-- ===================================

-- Supprimer les contraintes FK si elles existent
ALTER TABLE IF EXISTS public.summons
DROP CONSTRAINT IF EXISTS summons_issued_by_fkey;

ALTER TABLE IF EXISTS public.summons
DROP CONSTRAINT IF EXISTS summons_citizen_id_fkey;

-- Ajouter issued_by_name si manquant
ALTER TABLE public.summons
ADD COLUMN IF NOT EXISTS issued_by_name TEXT;

-- ===================================
-- 5. TABLE COMPLAINTS (Plaintes)
-- ===================================

-- Supprimer les contraintes FK si elles existent
ALTER TABLE IF EXISTS public.complaints
DROP CONSTRAINT IF EXISTS complaints_assigned_to_fkey;

-- Ajouter assigned_to_name si manquant
ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;

-- ===================================
-- 6. CONFIGURATION RLS PERMISSIVE
-- ===================================

-- Warrants
ALTER TABLE IF EXISTS public.warrants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all warrants" ON public.warrants;
CREATE POLICY "Allow all warrants" ON public.warrants FOR ALL USING (true) WITH CHECK (true);

-- Events
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all events" ON public.events;
CREATE POLICY "Allow all events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Summons
ALTER TABLE IF EXISTS public.summons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all summons" ON public.summons;
CREATE POLICY "Allow all summons" ON public.summons FOR ALL USING (true) WITH CHECK (true);

-- Complaints
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all complaints" ON public.complaints;
CREATE POLICY "Allow all complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);

-- Dispatch calls
ALTER TABLE IF EXISTS public.dispatch_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all dispatch_calls" ON public.dispatch_calls;
CREATE POLICY "Allow all dispatch_calls" ON public.dispatch_calls FOR ALL USING (true) WITH CHECK (true);

-- ===================================
-- 7. PERMISSIONS
-- ===================================

GRANT ALL ON public.warrants TO anon, authenticated;
GRANT ALL ON public.events TO anon, authenticated;
GRANT ALL ON public.summons TO anon, authenticated;
GRANT ALL ON public.complaints TO anon, authenticated;
GRANT ALL ON public.dispatch_calls TO anon, authenticated;

-- ===================================
-- 8. REALTIME CONFIGURATION
-- ===================================

ALTER TABLE IF EXISTS public.warrants REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.events REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.summons REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.complaints REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.dispatch_calls REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication Realtime
DO $$
DECLARE
  tables TEXT[] := ARRAY['warrants', 'events', 'summons', 'complaints', 'dispatch_calls'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
