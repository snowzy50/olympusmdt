import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DiscordRoleService } from '@/lib/auth/discord-role-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const roleService = new DiscordRoleService();

    // Récupérer les noms de rôles
    const roleNames = await roleService.getRoleNames(session.user.discordRoles);

    // Mapper aux agences
    const agencies = roleService.mapRoleNamesToAgencies(roleNames);

    return NextResponse.json({
      discordId: session.user.discordId,
      roleIds: session.user.discordRoles,
      roleNames,
      agencies,
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    );
  }
}
