-- Migration: Correction du type de created_by pour dispatch_calls
-- Créé par: Snowzy
-- Date: 2026-01-08
-- Description: Change created_by de UUID à TEXT pour accepter des identifiants flexibles

-- Modifier le type de la colonne created_by
ALTER TABLE dispatch_calls
ALTER COLUMN created_by TYPE TEXT;
