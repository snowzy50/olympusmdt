# Guide Administrateur - Gestion des Rôles et Accès

## Configuration Initiale

### 1. Configuration Discord

#### Étape 1 : Créer les Rôles Discord

Sur votre serveur Discord Olympus RP, créez les rôles suivants :

1. `MDT SASP` - Pour l'accès à la Police d'État
2. `MDT LSPD` - Pour l'accès à la Police de Los Santos
3. `MDT BCSO` - Pour l'accès au Shérif du Comté
4. `MDT EMS` - Pour l'accès aux Services Médicaux
5. `MDT DOJ` - Pour l'accès au Département de la Justice

**⚠️ IMPORTANT :** Le nom des rôles doit être **EXACTEMENT** comme indiqué ci-dessus (respectez les majuscules et les espaces).

#### Étape 2 : Configuration du Bot Discord

1. Allez sur https://discord.com/developers/applications
2. Sélectionnez votre application OlympusMDT
3. Allez dans **Bot**
4. Activez les **Privileged Gateway Intents** :
   - ✅ Server Members Intent
   - ✅ Presence Intent (optionnel)

5. Invitez le bot sur votre serveur avec la permission "Read Messages/View Channels"

---

## Gestion des Utilisateurs

### Donner l'Accès à un Utilisateur

1. **Sur Discord** :
   - Faites un clic droit sur l'utilisateur
   - Sélectionnez "Rôles"
   - Ajoutez le ou les rôles MDT appropriés

2. **L'utilisateur peut maintenant** :
   - Se connecter à OlympusMDT
   - Accéder aux agences correspondant à ses rôles

### Révoquer l'Accès

1. **Sur Discord** :
   - Retirez le rôle MDT de l'utilisateur

2. **L'utilisateur** :
   - Perdra immédiatement l'accès à l'agence
   - Devra se reconnecter pour que les changements prennent effet

### Multi-Agences

Un utilisateur peut avoir **plusieurs rôles MDT** :

**Exemple** :
- Utilisateur avec `MDT SASP` + `MDT LSPD`
- Verra les deux agences sur la page de sélection
- Peut basculer entre les deux dashboards

---

## Ajouter une Nouvelle Agence

### Étape 1 : Créer le Rôle Discord

Sur Discord, créez un nouveau rôle : `MDT VOTRE_AGENCE`

### Étape 2 : Ajouter le Mapping

1. Ouvrez le fichier : `lib/auth/discord-role-service.ts`
2. Ajoutez dans `roleToAgencyMap` :

```typescript
{
  roleName: 'MDT VOTRE_AGENCE',
  agencyId: 'votre_agence',
  agencyName: 'Nom Complet de Votre Agence'
}
```

### Étape 3 : Ajouter l'Agence dans la Liste

1. Ouvrez le fichier : `app/agency-selection/page.tsx`
2. Ajoutez dans `allAgencies` :

```typescript
{
  id: 'votre_agence',
  name: 'Nom Court',
  shortName: 'SIGLE',
  description: 'Description',
  icon: Shield, // ou un autre icône de lucide-react
  logo: '/images/agencies/votre_agence.png',
  color: 'primary',
  gradient: 'from-primary-600 to-primary-800',
  hoverBorder: 'border-primary-400',
  hoverBg: 'bg-primary-50',
  dashboardPath: '/dashboard/votre_agence',
}
```

### Étape 4 : Créer le Dashboard

Créez le dossier et la page : `app/dashboard/votre_agence/page.tsx`

### Étape 5 : Redémarrer l'Application

```bash
npm run dev
```

---

## Surveillance et Logs

### Vérifier les Connexions

Les logs de connexion sont affichés dans la console du serveur Next.js :

```
[NextAuth] User logged in: DiscordID
[Discord] Fetching roles for user: DiscordID
[Discord] Found roles: [role1, role2]
[Discord] Mapped to agencies: [sasp, lspd]
```

### Déboguer les Problèmes de Rôles

Créez un endpoint de debug : `/api/auth/debug`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json({
    user: session?.user,
    discordRoles: session?.user?.discordRoles,
    agencies: session?.user?.agencies,
  });
}
```

Accédez à `http://localhost:3000/api/auth/debug` pour voir les détails.

---

## Sécurité

### Bonnes Pratiques

1. **Ne partagez jamais** :
   - Le Client Secret Discord
   - Le Bot Token
   - Le NEXTAUTH_SECRET

2. **Utilisez des secrets forts** :
   ```bash
   # Générer un nouveau secret
   openssl rand -base64 32
   ```

3. **Limitez les permissions Discord** :
   - Le bot n'a besoin que de lire les membres et rôles
   - Pas besoin de permissions d'administration

4. **Rotation des Tokens** :
   - Changez régulièrement les secrets en production
   - Régénérez les tokens Discord si compromis

### Permissions Recommandées

Le bot Discord doit avoir :
- ✅ View Channels
- ✅ Read Messages
- ❌ Send Messages (pas nécessaire)
- ❌ Administrator (JAMAIS)

---

## Maintenance

### Mettre à Jour les Rôles Discord

Si vous devez renommer un rôle Discord :

1. **Mettez à jour le mapping** dans `lib/auth/discord-role-service.ts`
2. **Redémarrez l'application**
3. **Demandez aux utilisateurs de se reconnecter**

### Supprimer une Agence

1. **Retirez le rôle Discord** de tous les utilisateurs
2. **Supprimez le mapping** dans `discord-role-service.ts`
3. **Supprimez l'agence** dans `agency-selection/page.tsx`
4. **Supprimez le dashboard** correspondant

---

## Statistiques et Monitoring

### Compter les Utilisateurs par Agence

Utilisez l'API Discord ou créez un endpoint custom :

```typescript
// api/admin/stats/route.ts
export async function GET() {
  // Récupérer tous les membres du serveur
  // Compter les rôles MDT
  // Retourner les statistiques
}
```

### Alertes

Configurez des alertes pour :
- Échecs de connexion répétés
- Tentatives d'accès non autorisé
- Erreurs API Discord

---

## Dépannage

### "Failed to fetch guild roles"

**Causes possibles :**
- Bot Token invalide
- Bot pas sur le serveur
- Permissions insuffisantes

**Solution :**
1. Vérifiez le Bot Token dans `.env`
2. Réinvitez le bot sur le serveur
3. Activez Server Members Intent

### "User has no roles"

**Causes possibles :**
- Utilisateur n'a pas de rôle MDT
- Nom du rôle incorrect
- Mapping non à jour

**Solution :**
1. Vérifiez les rôles Discord de l'utilisateur
2. Vérifiez le nom exact du rôle
3. Comparez avec le mapping dans le code

### Utilisateur ne voit pas l'agence

**Vérifications :**
1. Le rôle Discord est-il bien assigné ?
2. Le mapping existe-t-il dans le code ?
3. L'agence est-elle dans la liste ?
4. L'utilisateur s'est-il reconnecté ?

---

## Backup et Restauration

### Sauvegarder la Configuration

Sauvegardez régulièrement :
- `.env` (sans le pusher sur Git !)
- `lib/auth/discord-role-service.ts`
- `app/agency-selection/page.tsx`

### Restaurer après une Panne

1. Restaurez les fichiers de configuration
2. Vérifiez les variables d'environnement
3. Redémarrez l'application
4. Testez la connexion avec un compte test

---

## Contact Support

Pour toute assistance technique :
- **Développeur** : Snowzy
- **Documentation** : `.claude/Documentation/Authentication/`

---

Créé par Snowzy - Janvier 2025
