-- Fix RLS pour organizations et organization_members
-- Permettre modification et suppression

-- Supprimer anciennes politiques organizations
DROP POLICY IF EXISTS "Public read organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated insert organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated update organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated delete organizations" ON organizations;

-- Supprimer anciennes politiques organization_members
DROP POLICY IF EXISTS "Public read members" ON organization_members;
DROP POLICY IF EXISTS "Authenticated insert members" ON organization_members;
DROP POLICY IF EXISTS "Authenticated update members" ON organization_members;
DROP POLICY IF EXISTS "Authenticated delete members" ON organization_members;

-- Supprimer anciennes politiques organization_relations
DROP POLICY IF EXISTS "Public read relations" ON organization_relations;
DROP POLICY IF EXISTS "Authenticated insert relations" ON organization_relations;
DROP POLICY IF EXISTS "Authenticated update relations" ON organization_relations;
DROP POLICY IF EXISTS "Authenticated delete relations" ON organization_relations;

-- Créer nouvelles politiques permissives pour tout le monde
CREATE POLICY "Allow all on organizations"
  ON organizations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on organization_members"
  ON organization_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on organization_relations"
  ON organization_relations
  FOR ALL
  USING (true)
  WITH CHECK (true);
