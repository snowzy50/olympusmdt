# Configuration Variables d'Environnement Vercel

## Variables NextAuth Requises

```bash
# URL de votre application Vercel (remplacer par l'URL réelle)
NEXTAUTH_URL=https://your-app.vercel.app

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
2. Ajouter toutes les variables ci-dessus
3. Sélectionner "Production", "Preview", et "Development"
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
