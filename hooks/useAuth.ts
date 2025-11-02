/**
 * Hook useAuth pour remplacer useSession de NextAuth
 * Compatible avec Supabase Auth
 * Créé par Snowzy
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  AuthSession,
  getSession,
  getUserProfile,
  syncDiscordRoles
} from '@/lib/auth/supabase-auth';

export function useAuth() {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Récupérer la session initiale
    const initSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
    };

    initSession();

    // Écouter les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('[useAuth] Auth state changed:', event);

        if (event === 'SIGNED_IN' && supabaseSession) {
          try {
            // Synchroniser les rôles Discord
            const profile = await syncDiscordRoles();

            if (!profile) {
              console.error('[useAuth] Failed to sync Discord roles');
              setSession({ user: null, isLoading: false });
              return;
            }

            // Construire la session
            const discordAvatarUrl = profile.discord_avatar
              ? `https://cdn.discordapp.com/avatars/${profile.discord_id}/${profile.discord_avatar}.png`
              : null;

            setSession({
              user: {
                id: supabaseSession.user.id,
                name: profile.discord_username,
                email: supabaseSession.user.email || null,
                image: discordAvatarUrl,
                discordId: profile.discord_id,
                discordRoles: profile.discord_roles,
                agencies: profile.agencies,
                isAdmin: profile.is_admin,
              },
              isLoading: false,
            });
          } catch (error: any) {
            console.error('[useAuth] Error syncing roles:', error);

            // Si l'erreur est "no_roles", on redirige vers login avec erreur
            if (error.message === 'no_roles') {
              setSession({ user: null, isLoading: false });
              window.location.href = '/login?error=no_roles';
            } else {
              setSession({ user: null, isLoading: false });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession({ user: null, isLoading: false });
        } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
          // Rafraîchir le profil
          const profile = await getUserProfile(supabaseSession.user.id);
          if (profile) {
            const discordAvatarUrl = profile.discord_avatar
              ? `https://cdn.discordapp.com/avatars/${profile.discord_id}/${profile.discord_avatar}.png`
              : null;

            setSession({
              user: {
                id: supabaseSession.user.id,
                name: profile.discord_username,
                email: supabaseSession.user.email || null,
                image: discordAvatarUrl,
                discordId: profile.discord_id,
                discordRoles: profile.discord_roles,
                agencies: profile.agencies,
                isAdmin: profile.is_admin,
              },
              isLoading: false,
            });
          }
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    data: session.user ? { user: session.user } : null,
    status: session.isLoading ? 'loading' : session.user ? 'authenticated' : 'unauthenticated',
  };
}
