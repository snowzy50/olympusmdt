import { getDiscordRoleMapping } from '@/config/agencies';

export interface AgencyRoleMapping {
  roleName: string;
  roleId?: string;
  agencyId: string;
  agencyName: string;
}

export class DiscordRoleService {
  private static roleToAgencyMap: AgencyRoleMapping[] = getDiscordRoleMapping();

  /**
   * Récupère les rôles Discord d'un utilisateur
   */
  async getUserRoles(userId: string, accessToken: string): Promise<string[]> {
    try {
      const guildId = process.env.VITE_DISCORD_GUILD_ID || process.env.DISCORD_GUILD_ID;

      if (!guildId) {
        console.error('Discord Guild ID not configured');
        return [];
      }

      // Utiliser l'API Discord REST pour récupérer les rôles
      const response = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch Discord member data:', response.statusText);
        return [];
      }

      const memberData = await response.json();
      return memberData.roles || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Récupère les noms de rôles à partir des IDs
   */
  async getRoleNames(roleIds: string[]): Promise<string[]> {
    try {
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.VITE_DISCORD_GUILD_ID || process.env.DISCORD_GUILD_ID;

      if (!botToken || !guildId) {
        console.error('Discord bot token or guild ID not configured');
        return [];
      }

      const response = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch guild roles:', response.statusText);
        return [];
      }

      const guildRoles = await response.json();
      const roleNames: string[] = [];

      for (const roleId of roleIds) {
        const role = guildRoles.find((r: any) => r.id === roleId);
        if (role) {
          roleNames.push(role.name);
        }
      }

      return roleNames;
    } catch (error) {
      console.error('Error fetching role names:', error);
      return [];
    }
  }

  /**
   * Mappe les rôles Discord aux agences accessibles
   */
  mapRolesToAgencies(roleIds: string[]): string[] {
    const agencies: string[] = [];

    // Si vous avez besoin de mapper par ID exact, vous pouvez le faire ici
    // Pour l'instant, nous allons utiliser une approche simple avec les noms

    return agencies;
  }

  /**
   * Mappe les noms de rôles aux agences
   */
  mapRoleNamesToAgencies(roleNames: string[]): string[] {
    const agencies: string[] = [];

    for (const roleName of roleNames) {
      const mapping = DiscordRoleService.roleToAgencyMap.find(
        (m) => m.roleName.toLowerCase() === roleName.toLowerCase()
      );

      if (mapping) {
        agencies.push(mapping.agencyId);
      }
    }

    return agencies;
  }

  /**
   * Vérifie si un utilisateur a accès à une agence
   */
  hasAccessToAgency(userAgencies: string[], agencyId: string): boolean {
    return userAgencies.includes(agencyId);
  }

  /**
   * Obtient toutes les mappings de rôles
   */
  static getAllRoleMappings(): AgencyRoleMapping[] {
    return this.roleToAgencyMap;
  }

  /**
   * Ajoute une nouvelle mapping de rôle
   */
  static addRoleMapping(mapping: AgencyRoleMapping): void {
    this.roleToAgencyMap.push(mapping);
  }
}
