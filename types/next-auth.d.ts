import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      discordId: string;
      discordRoles: string[];
      agencies: string[];
      accessToken: string;
    } & DefaultSession['user'];
  }

  interface User {
    discordId: string;
    discordRoles: string[];
    agencies: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId: string;
    discordRoles: string[];
    agencies: string[];
    accessToken: string;
  }
}
