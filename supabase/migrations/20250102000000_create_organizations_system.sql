-- Migration: Système de gestion des organisations et territoires
-- Créé par: Snowzy
-- Description: Tables pour gangs, mafias, MC avec territoires et POI

-- Table des organisations (gangs, mafias, MC)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10), -- Ex: "VDL" pour "Vatos de Los"
  type VARCHAR(20) NOT NULL CHECK (type IN ('gang', 'mafia', 'mc', 'cartel', 'other')),
  color VARCHAR(7) NOT NULL, -- Couleur hex #RRGGBB
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table des membres d'organisations
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name VARCHAR(100) NOT NULL, -- Nom du personnage
  role VARCHAR(20) NOT NULL CHECK (role IN ('boss', 'underboss', 'lieutenant', 'soldier', 'associate')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(organization_id, user_name)
);

-- Table des relations entre organisations
CREATE TABLE organization_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  target_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('ally', 'enemy', 'neutral', 'war')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (organization_id != target_organization_id),
  UNIQUE(organization_id, target_organization_id)
);

-- Table des territoires
CREATE TABLE territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coordinates JSONB NOT NULL, -- Array de points [{lat, lng}, {lat, lng}, ...]
  color VARCHAR(7), -- Si différent de l'organisation
  opacity DECIMAL(3,2) DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des points d'intérêt (POI) dans les territoires
CREATE TABLE territory_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'lab', 'safehouse', 'dealpoint', 'garage', 'warehouse',
    'clubhouse', 'hideout', 'business', 'landmark', 'other'
  )),
  coordinates JSONB NOT NULL, -- {lat, lng}
  description TEXT,
  icon VARCHAR(10), -- Emoji ou code icône
  is_secret BOOLEAN DEFAULT FALSE, -- Si visible seulement par l'organisation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_members_organization ON organization_members(organization_id);
CREATE INDEX idx_members_user ON organization_members(user_id);
CREATE INDEX idx_relations_organization ON organization_relations(organization_id);
CREATE INDEX idx_relations_target ON organization_relations(target_organization_id);
CREATE INDEX idx_territories_organization ON territories(organization_id);
CREATE INDEX idx_pois_territory ON territory_pois(territory_id);
CREATE INDEX idx_pois_organization ON territory_pois(organization_id);
CREATE INDEX idx_pois_type ON territory_pois(type);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relations_updated_at
  BEFORE UPDATE ON organization_relations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territories_updated_at
  BEFORE UPDATE ON territories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pois_updated_at
  BEFORE UPDATE ON territory_pois
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour vérifier les chevauchements de territoires
CREATE OR REPLACE FUNCTION check_territory_overlap(
  new_org_id UUID,
  new_coordinates JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_territory RECORD;
BEGIN
  -- Pour chaque territoire existant d'une autre organisation
  FOR existing_territory IN
    SELECT coordinates
    FROM territories
    WHERE organization_id != new_org_id
    AND organization_id IN (SELECT id FROM organizations WHERE is_active = TRUE)
  LOOP
    -- Ici on devrait utiliser PostGIS pour une vraie détection de chevauchement
    -- Pour l'instant on retourne false (pas de chevauchement)
    -- TODO: Implémenter la vraie logique avec PostGIS ou dans l'application
  END LOOP;

  RETURN FALSE; -- Pas de chevauchement détecté
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_pois ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : Tout le monde peut lire
CREATE POLICY "Public read organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public read members" ON organization_members FOR SELECT USING (true);
CREATE POLICY "Public read relations" ON organization_relations FOR SELECT USING (true);
CREATE POLICY "Public read territories" ON territories FOR SELECT USING (true);
CREATE POLICY "Public read POIs" ON territory_pois FOR SELECT USING (NOT is_secret OR organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- Politiques RLS : Tout le monde peut créer/modifier (selon requirement)
CREATE POLICY "Authenticated insert organizations" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update organizations" ON organizations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete organizations" ON organizations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert members" ON organization_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update members" ON organization_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete members" ON organization_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert relations" ON organization_relations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update relations" ON organization_relations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete relations" ON organization_relations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert territories" ON territories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update territories" ON territories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete territories" ON territories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert POIs" ON territory_pois FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update POIs" ON territory_pois FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete POIs" ON territory_pois FOR DELETE TO authenticated USING (true);

-- Données de test
INSERT INTO organizations (name, short_name, type, color, description) VALUES
  ('Vatos de Los Santos', 'VDL', 'gang', '#00FF00', 'Gang contrôlant Grove Street'),
  ('Lost MC', 'Lost', 'mc', '#FF0000', 'Motorcycle Club des Lost'),
  ('Bratva', 'BRA', 'mafia', '#0000FF', 'Mafia russe opérant à Los Santos');

COMMENT ON TABLE organizations IS 'Organisations criminelles (gangs, mafias, MC)';
COMMENT ON TABLE organization_members IS 'Membres des organisations avec leurs rôles';
COMMENT ON TABLE organization_relations IS 'Relations entre organisations (alliances, ennemis)';
COMMENT ON TABLE territories IS 'Territoires contrôlés par les organisations';
COMMENT ON TABLE territory_pois IS 'Points d''intérêt dans les territoires (labs, planques, etc.)';
