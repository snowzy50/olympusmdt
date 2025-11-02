/**
 * Service d'authentification Supabase pour OlympusMDT
 * Remplace NextAuth pour compatibilité static export + OVH
 * Créé par Snowzy
 */

import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  discord_id: string;
  discord_username: string | null;
  discord_avatar: string | null;
  discord_roles: string[];
  agencies: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    discordId: string;
    discordRoles: string[];
    agencies: string[];
    isAdmin: boolean;
  } | null;
  isLoading: boolean;
}

/**
 * Login avec Discord OAuth
 */
export async function signInWithDiscord(redirectTo = '/agency-selection') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
        scopes: 'identify guilds guilds.members.read',
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Discord login error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAuth] signInWithDiscord error:', error);
    return { data: null, error };
  }
}

/**
 * Login Admin (credentials bypass)
 */
export async function signInWithCredentials(username: string, password: string) {
  try {
    // Vérifier les credentials admin
    if (username === 'Admin' && password === 'Admin123') {
      // Créer un profil admin fictif dans localStorage
      const adminProfile: UserProfile = {
        id: 'admin-bypass',
        user_id: 'admin-bypass',
        discord_id: 'admin-bypass',
        discord_username: 'Admin',
        discord_avatar: null,
        discord_roles: [],
        agencies: ['sasp', 'samc', 'safd', 'dynasty8', 'doj'],
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Stocker dans localStorage pour bypass
      localStorage.setItem('admin-bypass-profile', JSON.stringify(adminProfile));
      localStorage.setItem('admin-bypass-session', 'true');

      return { success: true, profile: adminProfile };
    }

    return { success: false, error: 'Identifiants incorrects' };
  } catch (error) {
    console.error('[SupabaseAuth] signInWithCredentials error:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
}

/**
 * Déconnexion
 */
export async function signOut() {
  try {
    // Nettoyer localStorage admin bypass
    localStorage.removeItem('admin-bypass-profile');
    localStorage.removeItem('admin-bypass-session');

    // Déconnexion Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[SupabaseAuth] Sign out error:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAuth] signOut error:', error);
    return { error };
  }
}

/**
 * Récupère le profil utilisateur depuis user_profiles
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[SupabaseAuth] Get profile error:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('[SupabaseAuth] getUserProfile error:', error);
    return null;
  }
}

/**
 * Synchronise les rôles Discord via Edge Function
 */
export async function syncDiscordRoles(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[SupabaseAuth] No session found');
      return null;
    }

    // Appeler l'Edge Function
    const { data, error } = await supabase.functions.invoke('sync-discord-roles', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Sync roles error:', error);
      return null;
    }

    if (data.error === 'no_roles') {
      throw new Error('no_roles');
    }

    return data.profile as UserProfile;
  } catch (error) {
    console.error('[SupabaseAuth] syncDiscordRoles error:', error);
    throw error;
  }
}

/**
 * Récupère la session actuelle
 */
export async function getSession(): Promise<AuthSession> {
  try {
    // Vérifier admin bypass
    const isAdminBypass = localStorage.getItem('admin-bypass-session') === 'true';
    if (isAdminBypass) {
      const adminProfile = localStorage.getItem('admin-bypass-profile');
      if (adminProfile) {
        const profile: UserProfile = JSON.parse(adminProfile);
        return {
          user: {
            id: profile.user_id,
            name: profile.discord_username,
            email: 'admin@olympusrp.fr',
            image: null,
            discordId: profile.discord_id,
            discordRoles: profile.discord_roles,
            agencies: profile.agencies,
            isAdmin: profile.is_admin,
          },
          isLoading: false,
        };
      }
    }

    // Session Supabase normale
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { user: null, isLoading: false };
    }

    // Récupérer le profil
    const profile = await getUserProfile(session.user.id);

    if (!profile) {
      return { user: null, isLoading: false };
    }

    // Construire l'objet user compatible NextAuth
    const discordAvatarUrl = profile.discord_avatar
      ? `https://cdn.discordapp.com/avatars/${profile.discord_id}/${profile.discord_avatar}.png`
      : null;

    return {
      user: {
        id: session.user.id,
        name: profile.discord_username,
        email: session.user.email || null,
        image: discordAvatarUrl,
        discordId: profile.discord_id,
        discordRoles: profile.discord_roles,
        agencies: profile.agencies,
        isAdmin: profile.is_admin,
      },
      isLoading: false,
    };
  } catch (error) {
    console.error('[SupabaseAuth] getSession error:', error);
    return { user: null, isLoading: false };
  }
}

/**
 * Hook useAuth pour remplacer useSession de NextAuth
 */
export function useAuth() {
  // Ce hook sera créé dans un fichier séparé
  // Pour l'instant, c'est juste le type
  return {
    session: null as AuthSession | null,
    isLoading: true,
  };
}
