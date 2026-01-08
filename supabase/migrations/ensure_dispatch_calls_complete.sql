-- Migration: Création et configuration complète de dispatch_calls
-- Créé par: Snowzy
-- Date: 2026-01-08
-- Description: S'assure que la table dispatch_calls existe avec RLS et Realtime configurés

-- ===================================
-- 1. CRÉATION DE LA TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS dispatch_calls (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT NOT NULL CHECK (call_type IN ('robbery', 'medical', 'traffic', 'assault', 'fire', 'pursuit', 'suspicious', 'backup', 'other')),
  priority TEXT NOT NULL DEFAULT 'code2' CHECK (priority IN ('code1', 'code2', 'code3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'en_route', 'on_scene', 'resolved', 'cancelled')),
  location JSONB NOT NULL,
  image_url TEXT,
  assigned_units JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ===================================
-- 2. INDEX POUR PERFORMANCE
-- ===================================

CREATE INDEX IF NOT EXISTS idx_dispatch_calls_agency_id ON dispatch_calls(agency_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_status ON dispatch_calls(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_priority ON dispatch_calls(priority);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_call_type ON dispatch_calls(call_type);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_created_at ON dispatch_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_location ON dispatch_calls USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_assigned_units ON dispatch_calls USING GIN (assigned_units);

-- ===================================
-- 3. TRIGGER POUR updated_at
-- ===================================

-- Créer la fonction si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer et recréer le trigger
DROP TRIGGER IF EXISTS update_dispatch_calls_updated_at ON dispatch_calls;
CREATE TRIGGER update_dispatch_calls_updated_at
  BEFORE UPDATE ON dispatch_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ===================================

-- Désactiver d'abord pour nettoyer
ALTER TABLE dispatch_calls DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow all on dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public read dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public insert dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public update dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public delete dispatch_calls" ON dispatch_calls;

-- Activer RLS
ALTER TABLE dispatch_calls ENABLE ROW LEVEL SECURITY;

-- Politiques permissives
CREATE POLICY "Public read dispatch_calls"
ON dispatch_calls FOR SELECT
USING (true);

CREATE POLICY "Public insert dispatch_calls"
ON dispatch_calls FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update dispatch_calls"
ON dispatch_calls FOR UPDATE
USING (true);

CREATE POLICY "Public delete dispatch_calls"
ON dispatch_calls FOR DELETE
USING (true);

-- ===================================
-- 5. PERMISSIONS
-- ===================================

GRANT ALL ON dispatch_calls TO anon;
GRANT ALL ON dispatch_calls TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===================================
-- 6. REALTIME CONFIGURATION
-- ===================================

ALTER TABLE dispatch_calls REPLICA IDENTITY FULL;

-- Ajouter à la publication Realtime si pas déjà fait
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'dispatch_calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_calls;
  END IF;
END $$;

-- ===================================
-- 7. COMMENTAIRES
-- ===================================

COMMENT ON TABLE dispatch_calls IS 'Table de gestion des appels d''intervention avec carte GTA V interactive';
COMMENT ON COLUMN dispatch_calls.id IS 'Identifiant unique au format DIS-YYYY-NNN';
COMMENT ON COLUMN dispatch_calls.call_type IS 'Type d''appel: robbery, medical, traffic, assault, fire, pursuit, suspicious, backup, other';
COMMENT ON COLUMN dispatch_calls.priority IS 'Priorité: code1 (urgence), code2 (normal), code3 (non-urgent)';
COMMENT ON COLUMN dispatch_calls.status IS 'Statut: pending, dispatched, en_route, on_scene, resolved, cancelled';
COMMENT ON COLUMN dispatch_calls.location IS 'Position GPS au format {lat, lng, address}';
