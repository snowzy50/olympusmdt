-- Add missing fields to vehicles table for the MDT UI
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Update REPLICA IDENTITY to ensure realtime works with all columns
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
