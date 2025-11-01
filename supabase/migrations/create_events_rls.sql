-- Migration: RLS (Row Level Security) pour la table events
-- Créé par: Snowzy
-- Date: 2025-11-01
-- Description: Politiques de sécurité pour l'isolation des données par agence

-- Activer RLS sur la table events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Les utilisateurs peuvent voir les événements de leur agence
CREATE POLICY "Users can view events from their agency"
  ON events
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique INSERT: Les utilisateurs peuvent créer des événements pour leur agence
CREATE POLICY "Users can create events for their agency"
  ON events
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique UPDATE: Les utilisateurs peuvent modifier les événements de leur agence
CREATE POLICY "Users can update events from their agency"
  ON events
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique DELETE: Les utilisateurs peuvent supprimer les événements de leur agence
CREATE POLICY "Users can delete events from their agency"
  ON events
  FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
    )
  );

-- Politique spéciale pour les administrateurs (accès à toutes les agences)
CREATE POLICY "Admins can view all events"
  ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM agents
      WHERE discord_id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );

-- Commentaire
COMMENT ON POLICY "Users can view events from their agency" ON events IS 'Permet aux agents de voir uniquement les événements de leur agence';
