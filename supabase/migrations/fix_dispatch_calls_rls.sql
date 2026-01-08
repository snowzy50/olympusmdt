-- Migration: Configuration RLS pour dispatch_calls
-- Créé par: Snowzy
-- Date: 2026-01-08
-- Description: Configure les politiques RLS pour permettre les opérations CRUD sur dispatch_calls

-- Désactiver RLS temporairement pour s'assurer que la table est accessible
ALTER TABLE IF EXISTS dispatch_calls DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow all on dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public read dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public insert dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public update dispatch_calls" ON dispatch_calls;
DROP POLICY IF EXISTS "Public delete dispatch_calls" ON dispatch_calls;

-- Activer RLS
ALTER TABLE dispatch_calls ENABLE ROW LEVEL SECURITY;

-- Créer des politiques permissives pour toutes les opérations
-- SELECT: Tout le monde peut lire les appels
CREATE POLICY "Public read dispatch_calls"
ON dispatch_calls FOR SELECT
USING (true);

-- INSERT: Tout le monde peut créer des appels
CREATE POLICY "Public insert dispatch_calls"
ON dispatch_calls FOR INSERT
WITH CHECK (true);

-- UPDATE: Tout le monde peut modifier des appels
CREATE POLICY "Public update dispatch_calls"
ON dispatch_calls FOR UPDATE
USING (true);

-- DELETE: Tout le monde peut supprimer des appels
CREATE POLICY "Public delete dispatch_calls"
ON dispatch_calls FOR DELETE
USING (true);

-- Grant les permissions au rôle anon et authenticated
GRANT ALL ON dispatch_calls TO anon;
GRANT ALL ON dispatch_calls TO authenticated;

-- Vérifier que Realtime est bien configuré
ALTER TABLE dispatch_calls REPLICA IDENTITY FULL;

-- S'assurer que la table est dans la publication realtime
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
