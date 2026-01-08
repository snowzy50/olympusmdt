-- Add missing fields to warrants table for the MDT UI
ALTER TABLE public.warrants ADD COLUMN IF NOT EXISTS suspect_name TEXT;
ALTER TABLE public.warrants ADD COLUMN IF NOT EXISTS issued_by_name TEXT;

-- Update REPLICA IDENTITY to ensure realtime works with all columns
ALTER TABLE public.warrants REPLICA IDENTITY FULL;
