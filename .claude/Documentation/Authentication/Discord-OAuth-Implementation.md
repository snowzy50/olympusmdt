# Système d'Authentification Discord OAuth2

## Vue d'ensemble

Ce document décrit l'implémentation complète du système d'authentification Discord OAuth2 pour OlympusMDT. Le système permet aux utilisateurs de se connecter via Discord et d'accéder aux agences en fonction de leurs rôles Discord.

---

## Architecture du Système

### 1. Flux d'authentification

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Utilisateur│ --> │  Page Login  │ --> │   Discord   │ --> │   NextAuth   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                            │                                         │
                            │                                         ▼
                            │                                  ┌──────────────┐
                            │                                  │ Discord API  │
                            │                                  │ (Get Roles)  │
                            │                                  └──────────────┘
                            │                                         │
                            ▼                                         ▼
                    ┌──────────────┐                          ┌──────────────┐
                    │   Dashboard  │ <----------------------- │   Mapping    │
                    │   Protected  │                          │ Rôles/Agency │
                    └──────────────┘                          └──────────────┘
```

### 2. Composants Principaux

#### A. Configuration NextAuth (`lib/auth/config.ts`)
- Configure Discord comme provider OAuth2
- Gère les callbacks JWT et session
- Récupère et mappe les rôles Discord

#### B. Service Discord Roles (`lib/auth/discord-role-service.ts`)
- Récupère les rôles Discord d'un utilisateur
- Mappe les rôles Discord aux agences OlympusMDT
- Vérifie les permissions d'accès

#### C. Middleware (`middleware.ts`)
- Protège les routes nécessitant une authentification
- Vérifie les permissions d'accès aux agences
- Redirige les utilisateurs non autorisés

#### D. Pages
- `/login` : Page de connexion Discord
- `/agency-selection` : Sélection d'agence (filtré par rôles)
- `/dashboard/[agency]` : Dashboard protégé par agence

---

## Configuration

### 1. Variables d'Environnement

Ajoutez les variables suivantes dans `.env` :

```env
# Discord OAuth2 Configuration
VITE_DISCORD_CLIENT_ID=votre_client_id
VITE_DISCORD_CLIENT_SECRET=votre_client_secret
VITE_DISCORD_GUILD_ID=votre_guild_id

# Discord Bot Configuration
DISCORD_BOT_TOKEN=votre_bot_token
DISCORD_GUILD_ID=votre_guild_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_key_unique
```

### 2. Configuration Discord Developer Portal

#### A. Créer une Application Discord
1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Notez le **Client ID** et **Client Secret**

#### B. Configurer OAuth2
1. Dans votre application Discord, allez dans **OAuth2**
2. Ajoutez les **Redirect URLs** :
   ```
   http://localhost:3000/api/auth/callback/discord
   https://votre-domaine.com/api/auth/callback/discord
   ```
3. Sélectionnez les scopes :
   - `identify`
   - `guilds`
   - `guilds.members.read`

#### C. Créer un Bot
1. Allez dans **Bot**
2. Créez un bot et copiez le **Token**
3. Activez les **Privileged Gateway Intents** :
   - Server Members Intent

#### D. Inviter le Bot sur votre Serveur
```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=0&scope=bot
```

---

## Mapping Rôles Discord → Agences

Le mapping est défini dans `lib/auth/discord-role-service.ts` :

```typescript
const roleToAgencyMap: AgencyRoleMapping[] = [
  { roleName: 'MDT SASP', agencyId: 'sasp', agencyName: 'San Andreas State Police' },
  { roleName: 'MDT LSPD', agencyId: 'lspd', agencyName: 'Los Santos Police Department' },
  { roleName: 'MDT BCSO', agencyId: 'bcso', agencyName: 'Blaine County Sheriff Office' },
  { roleName: 'MDT EMS', agencyId: 'ems', agencyName: 'Emergency Medical Services' },
  { roleName: 'MDT DOJ', agencyId: 'doj', agencyName: 'Department of Justice' },
];
```

### Comment ça fonctionne ?

1. **Connexion utilisateur** : L'utilisateur se connecte via Discord
2. **Récupération des rôles** : Le système récupère tous les rôles Discord de l'utilisateur
3. **Mapping** : Le système compare les rôles avec le mapping défini
4. **Filtrage** : Seules les agences correspondant aux rôles sont affichées
5. **Protection** : Les dashboards sont protégés par le middleware

### Ajouter un Nouveau Rôle/Agence

Pour ajouter une nouvelle agence :

1. **Ajoutez le mapping dans le service** (`lib/auth/discord-role-service.ts`) :
```typescript
{
  roleName: 'MDT NOUVELLE_AGENCE',
  agencyId: 'nouvelle_agence',
  agencyName: 'Nom Complet Agence'
}
```

2. **Ajoutez l'agence dans la liste** (`app/agency-selection/page.tsx`) :
```typescript
{
  id: 'nouvelle_agence',
  name: 'Nouvelle Agence',
  shortName: 'NA',
  description: 'Description',
  icon: Shield,
  logo: '/images/agencies/na.png',
  color: 'primary',
  gradient: 'from-primary-600 to-primary-800',
  hoverBorder: 'border-primary-400',
  hoverBg: 'bg-primary-50',
  dashboardPath: '/dashboard/nouvelle_agence',
}
```

3. **Créez le rôle sur Discord** avec le nom exact : `MDT NOUVELLE_AGENCE`

---

## Sécurité

### 1. Protection des Routes

Le middleware protège automatiquement :
- Toutes les routes sauf `/login` et `/api/auth/*`
- Les dashboards par agence (`/dashboard/[agency]`)

### 2. Vérification des Permissions

```typescript
// Dans le middleware
if (pathname.startsWith('/dashboard/')) {
  const agencyId = pathname.split('/')[2];
  const userAgencies = token?.agencies as string[] || [];

  if (!userAgencies.includes(agencyId)) {
    return NextResponse.redirect(new URL('/agency-selection', request.url));
  }
}
```

### 3. Gestion des Erreurs

- **Pas de rôles** : Redirection vers `/login?error=no_roles`
- **Non authentifié** : Redirection vers `/login`
- **Accès refusé** : Redirection vers `/agency-selection`

---

## Tests et Débogage

### 1. Vérifier l'Authentification

```typescript
// Dans un composant client
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
console.log('User:', session?.user);
console.log('Agencies:', session?.user?.agencies);
console.log('Discord Roles:', session?.user?.discordRoles);
```

### 2. API Endpoint de Test

Créez un endpoint pour tester : `/api/auth/debug`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json(session);
}
```

### 3. Logs Discord

Les logs sont affichés dans la console serveur :
```
- Error fetching user roles
- Failed to fetch Discord member data
- Failed to fetch guild roles
```

---

## Dépannage

### Problème : "Error: No user found"

**Solution** : Vérifiez que :
- Le Client ID et Secret sont corrects
- Les redirect URLs sont bien configurées
- Le bot a accès au serveur Discord

### Problème : "No roles found"

**Solution** : Vérifiez que :
- Le bot a les permissions Server Members Intent
- Le bot est bien sur le serveur
- Les rôles Discord correspondent au mapping

### Problème : "Callback error"

**Solution** : Vérifiez que :
- NEXTAUTH_URL est correct
- NEXTAUTH_SECRET est défini
- Les scopes OAuth2 sont corrects

---

## Endpoints API

### `/api/auth/[...nextauth]`
Gère toute l'authentification NextAuth

### `/api/auth/roles`
Retourne les rôles et agences de l'utilisateur connecté

**Response** :
```json
{
  "discordId": "123456789",
  "roleIds": ["role_id_1", "role_id_2"],
  "roleNames": ["MDT SASP", "MDT LSPD"],
  "agencies": ["sasp", "lspd"]
}
```

---

## Personnalisation

### Changer les Noms de Rôles

Modifiez le mapping dans `lib/auth/discord-role-service.ts` :

```typescript
{ roleName: 'VOTRE_NOM_DE_ROLE', agencyId: 'agency_id', ... }
```

### Ajouter des Permissions Supplémentaires

Vous pouvez étendre le système en ajoutant :
- Des niveaux de permissions (admin, officer, etc.)
- Des restrictions par fonctionnalité
- Des rôles hiérarchiques

---

## Production

### Liste de Vérification

- [ ] NEXTAUTH_SECRET généré avec `openssl rand -base64 32`
- [ ] NEXTAUTH_URL configuré avec le domaine de production
- [ ] Discord redirect URLs incluent le domaine de production
- [ ] Variables d'environnement sécurisées (pas dans le repo)
- [ ] Bot Discord avec permissions correctes
- [ ] Tests d'authentification effectués

### Génération de NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Créé par Snowzy
Dernière mise à jour : Janvier 2025
