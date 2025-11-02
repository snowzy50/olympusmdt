-- Fix RLS pour permettre aux utilisateurs anonymes (avec anon key) de créer des territoires
-- Cela correspond à l'utilisation actuelle du service avec SUPABASE_ANON_KEY

-- D'abord, supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public read territories" ON territories;
DROP POLICY IF EXISTS "Authenticated insert territories" ON territories;
DROP POLICY IF EXISTS "Authenticated update territories" ON territories;
DROP POLICY IF EXISTS "Authenticated delete territories" ON territories;
DROP POLICY IF EXISTS "Allow authenticated insert territories" ON territories;
DROP POLICY IF EXISTS "Allow authenticated update territories" ON territories;
DROP POLICY IF EXISTS "Allow authenticated delete territories" ON territories;

DROP POLICY IF EXISTS "Public read POIs" ON territory_pois;
DROP POLICY IF EXISTS "Authenticated insert POIs" ON territory_pois;
DROP POLICY IF EXISTS "Authenticated update POIs" ON territory_pois;
DROP POLICY IF EXISTS "Authenticated delete POIs" ON territory_pois;
DROP POLICY IF EXISTS "Allow authenticated insert POIs" ON territory_pois;
DROP POLICY IF EXISTS "Allow authenticated update POIs" ON territory_pois;
DROP POLICY IF EXISTS "Allow authenticated delete POIs" ON territory_pois;

-- Créer de nouvelles politiques qui permettent TOUT (lecture + écriture) pour tous
-- Y compris les utilisateurs anonymes (anon role)

-- Territories
CREATE POLICY "Allow all on territories"
  ON territories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Territory POIs
CREATE POLICY "Allow all on territory_pois"
  ON territory_pois
  FOR ALL
  USING (true)
  WITH CHECK (true);
