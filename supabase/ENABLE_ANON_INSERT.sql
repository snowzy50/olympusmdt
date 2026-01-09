-- =====================================================
-- ACTIVER LES INSERTIONS ANONYMES (TEMPORAIRE)
-- Execute ce script AVANT l'import des donnees
-- =====================================================

-- Pour infractions
DROP POLICY IF EXISTS "infractions_insert_policy" ON infractions;
CREATE POLICY "infractions_insert_policy" ON infractions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Pour weapons_registry
DROP POLICY IF EXISTS "weapons_registry_insert_policy" ON weapons_registry;
CREATE POLICY "weapons_registry_insert_policy" ON weapons_registry
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Pour defcon_status
DROP POLICY IF EXISTS "defcon_status_insert_policy" ON defcon_status;
CREATE POLICY "defcon_status_insert_policy" ON defcon_status
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

SELECT 'Politiques RLS mises a jour - Insertions autorisees' as status;
