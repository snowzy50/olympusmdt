# Configuration Variables d'Environnement Vercel

## Variables NextAuth Requises

```bash
# URL de votre application Vercel (remplacer par l'URL réelle)
NEXTAUTH_URL=olympusmdt.vercel.app

# Secret pour signer les JWT (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET=votre-secret-genere-32-caracteres-minimum
```

## Variables Discord Requises

```bash
# OAuth Discord Application
DISCORD_CLIENT_ID=votre-client-id-discord
DISCORD_CLIENT_SECRET=votre-client-secret-discord

# Bot Discord & Server
DISCORD_GUILD_ID=votre-guild-id-serveur-discord
DISCORD_BOT_TOKEN=votre-bot-token-discord
```

## Variables Supabase Requises

```bash
# Supabase - Base de données (organisations, territoires, dispatch)
NEXT_PUBLIC_SUPABASE_URL=https://gyhjbbrlrcrstbklsxwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGpiYnJscmNyc3Ria2xzeHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTEzNTMsImV4cCI6MjA3MjMyNzM1M30.xiPCBJY0_vgCz6ZIZV9S7JdL9Y5_SrD5WbxiuChTJAk

# Note: Ces variables sont nécessaires pour:
# - Page /dashboard/sasp/organizations (carte des territoires)
# - Page /dispatch (système de dispatch avec carte)
# - Toutes les fonctionnalités de carte interactive
```

## Configuration Discord Developer Portal

### 1. OAuth2 Redirects URLs
Dans Discord Developer Portal > OAuth2 > Redirects, ajouter :
- `https://your-app.vercel.app/api/auth/callback/discord`
- `http://localhost:3000/api/auth/callback/discord` (pour dev local)

### 2. OAuth2 Scopes Requis
- `identify`
- `guilds`
- `guilds.members.read`

### 3. Bot Permissions
- Server Members Intent (activé dans Bot settings)

## Comment configurer sur Vercel

1. Aller sur vercel.com > Votre projet > Settings > Environment Variables
2. Ajouter **toutes les 8 variables** ci-dessus:
   - 2 variables NextAuth (NEXTAUTH_URL, NEXTAUTH_SECRET)
   - 4 variables Discord (CLIENT_ID, CLIENT_SECRET, GUILD_ID, BOT_TOKEN)
   - 2 variables Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Pour chaque variable, sélectionner "Production", "Preview", et "Development"
4. Cliquer "Save"
5. Redéployer l'application

## Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Vérifier la configuration

Après déploiement, tester :
- Accès à `/login` doit afficher le bouton Discord
- Clic sur Discord doit rediriger vers Discord OAuth
- Après autorisation, doit rediriger vers `/agency-selection`

---
Créé par: Snowzy
