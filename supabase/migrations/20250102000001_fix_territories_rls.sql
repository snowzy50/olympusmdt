-- Fix RLS policies for territories
-- Le problème est que les politiques utilisent "TO authenticated" mais ne vérifient pas correctement

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Authenticated insert territories" ON territories;
DROP POLICY IF EXISTS "Authenticated update territories" ON territories;
DROP POLICY IF EXISTS "Authenticated delete territories" ON territories;

DROP POLICY IF EXISTS "Authenticated insert POIs" ON territory_pois;
DROP POLICY IF EXISTS "Authenticated update POIs" ON territory_pois;
DROP POLICY IF EXISTS "Authenticated delete POIs" ON territory_pois;

-- Recréer avec policies plus permissives pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated insert territories"
  ON territories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update territories"
  ON territories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete territories"
  ON territories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert POIs"
  ON territory_pois FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update POIs"
  ON territory_pois FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete POIs"
  ON territory_pois FOR DELETE
  TO authenticated
  USING (true);
