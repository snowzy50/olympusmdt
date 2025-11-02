-- Migration: Création de la table dispatch_calls pour le système de dispatch
-- Créé par: Snowzy
-- Date: 2025-11-02
-- Description: Table pour gérer les appels d'intervention avec carte interactive GTA V

-- Création de la table dispatch_calls
CREATE TABLE IF NOT EXISTS dispatch_calls (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT NOT NULL CHECK (call_type IN ('robbery', 'medical', 'traffic', 'assault', 'fire', 'pursuit', 'suspicious', 'backup', 'other')),
  priority TEXT NOT NULL DEFAULT 'code2' CHECK (priority IN ('code1', 'code2', 'code3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'en_route', 'on_scene', 'resolved', 'cancelled')),
  location JSONB NOT NULL, -- {lat: number, lng: number, address: string}
  image_url TEXT,
  assigned_units JSONB DEFAULT '[]'::jsonb, -- array d'IDs d'unités assignées
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_agency_id ON dispatch_calls(agency_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_status ON dispatch_calls(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_priority ON dispatch_calls(priority);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_call_type ON dispatch_calls(call_type);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_created_at ON dispatch_calls(created_at DESC);

-- Index GIN pour recherche dans JSONB
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_location ON dispatch_calls USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_dispatch_calls_assigned_units ON dispatch_calls USING GIN (assigned_units);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_dispatch_calls_updated_at
  BEFORE UPDATE ON dispatch_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Configurer REPLICA IDENTITY FULL pour Realtime
ALTER TABLE dispatch_calls REPLICA IDENTITY FULL;

-- Activer Realtime pour la table dispatch_calls
ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_calls;

-- Commentaires pour documentation
COMMENT ON TABLE dispatch_calls IS 'Table de gestion des appels d\'intervention avec carte GTA V interactive';
COMMENT ON COLUMN dispatch_calls.id IS 'Identifiant unique au format DIS-YYYY-NNN';
COMMENT ON COLUMN dispatch_calls.call_type IS 'Type d\'appel: robbery, medical, traffic, assault, fire, pursuit, suspicious, backup, other';
COMMENT ON COLUMN dispatch_calls.priority IS 'Priorité: code1 (urgence), code2 (normal), code3 (non-urgent)';
COMMENT ON COLUMN dispatch_calls.status IS 'Statut: pending, dispatched, en_route, on_scene, resolved, cancelled';
COMMENT ON COLUMN dispatch_calls.location IS 'Position GPS au format {lat, lng, address}';
COMMENT ON COLUMN dispatch_calls.assigned_units IS 'Array d\'IDs des unités assignées';
