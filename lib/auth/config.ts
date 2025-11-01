import { AuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DiscordRoleService } from './discord-role-service';
import { mapRoleIdsToAgencies } from '@/config/agencies';

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds guilds.members.read',
        },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Vérification des identifiants admin
        if (credentials.username === 'Admin' && credentials.password === 'Admin123') {
          return {
            id: 'admin-bypass',
            name: 'Admin',
            email: 'admin@olympusrp.fr',
            isAdmin: true,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Gestion de l'admin bypass
      if (user && (user as any).isAdmin) {
        token.isAdmin = true;
        token.discordId = 'admin-bypass';
        token.discordRoles = [];
        token.agencies = ['lspd', 'bcso', 'sasp', 'ems', 'doj'];
        return token;
      }

      if (account && profile) {
        token.discordId = (profile as any).id;
        token.accessToken = account.access_token || '';

        // Récupérer les rôles Discord de l'utilisateur
        const roleService = new DiscordRoleService();
        const roleIds = await roleService.getUserRoles(
          (profile as any).id as string,
          account.access_token || ''
        );

        // Mapper directement les IDs de rôles aux agences
        const agencies = mapRoleIdsToAgencies(roleIds);

        token.discordRoles = roleIds;
        token.agencies = agencies;

        console.log('Discord Auth - User:', (profile as any).id);
        console.log('Discord Auth - Role IDs:', roleIds);
        console.log('Discord Auth - Agencies:', agencies);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId as string;
        session.user.discordRoles = token.discordRoles as string[];
        session.user.agencies = token.agencies as string[];
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};
