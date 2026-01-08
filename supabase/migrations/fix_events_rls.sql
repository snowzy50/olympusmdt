-- FIX RLS POLICIES FOR EVENTS
-- Date: 2026-01-08

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if any (optional, but cleaner)
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.events;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.events;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.events;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.events;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON public.events;

-- Re-create comprehensive policy
-- "Enable all for authenticated" handles SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Enable all for authenticated" 
ON public.events 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Verify grants
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

-- Ensure sequence permissions if any (events uses text ID, but good practice)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
