-- Temporary fix: Allow anonymous inserts for testing
-- This allows the Next.js app to work without Supabase Auth
-- TODO: Integrate NextAuth JWT with Supabase RLS in production

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert agents in their agencies" ON agents;

-- Create new policy that allows anonymous inserts
CREATE POLICY "Allow anonymous inserts for testing"
ON agents
FOR INSERT
TO public
WITH CHECK (true);

-- Note: This is ONLY for development/testing
-- In production, you should integrate NextAuth JWT with Supabase
