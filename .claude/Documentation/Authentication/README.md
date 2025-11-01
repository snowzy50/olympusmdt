# Système d'Authentification Discord - OlympusMDT

## 📋 Vue d'ensemble

Ce dossier contient toute la documentation relative au système d'authentification Discord OAuth2 pour OlympusMDT.

**Créé par** : Snowzy
**Date** : Janvier 2025
**Version** : 1.0.0

---

## 📚 Documentation Disponible

### 1. [Discord-OAuth-Implementation.md](./Discord-OAuth-Implementation.md)
**Pour les développeurs**

Documentation technique complète incluant :
- Architecture du système
- Configuration détaillée
- Flux d'authentification
- Mapping rôles → agences
- Sécurité et protection
- Tests et débogage
- Dépannage

### 2. [Guide-Utilisateur.md](./Guide-Utilisateur.md)
**Pour les utilisateurs finaux**

Guide simple pour :
- Se connecter avec Discord
- Comprendre les rôles requis
- Naviguer dans l'application
- Résoudre les problèmes courants

### 3. [Guide-Admin.md](./Guide-Admin.md)
**Pour les administrateurs**

Guide complet pour :
- Configuration Discord initiale
- Gestion des utilisateurs et rôles
- Ajout de nouvelles agences
- Surveillance et logs
- Maintenance et sécurité

---

## 🚀 Démarrage Rapide

### Pour les Développeurs

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Discord

# 3. Lancer le serveur de développement
npm run dev
```

### Variables Requises

```env
VITE_DISCORD_CLIENT_ID=votre_client_id
VITE_DISCORD_CLIENT_SECRET=votre_client_secret
VITE_DISCORD_GUILD_ID=votre_guild_id
DISCORD_BOT_TOKEN=votre_bot_token
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_unique
```

---

## 🏗️ Structure des Fichiers

```
olympusmdt/
├── lib/
│   └── auth/
│       ├── config.ts                    # Configuration NextAuth
│       └── discord-role-service.ts      # Service gestion rôles Discord
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts   # Route NextAuth
│   │       └── roles/route.ts           # API récupération rôles
│   ├── login/
│   │   └── page.tsx                     # Page de connexion
│   └── agency-selection/
│       └── page.tsx                     # Sélection agence
├── config/
│   └── agencies.ts                      # Configuration centralisée agences
├── middleware.ts                        # Protection des routes
├── types/
│   └── next-auth.d.ts                   # Types TypeScript
└── .env                                 # Variables d'environnement
```

---

## 🔐 Rôles Discord Supportés

| Rôle Discord | Agency ID | Description |
|--------------|-----------|-------------|
| `MDT SASP` | `sasp` | San Andreas State Police |
| `MDT LSPD` | `lspd` | Los Santos Police Department |
| `MDT BCSO` | `bcso` | Blaine County Sheriff Office |
| `MDT EMS` | `ems` | Emergency Medical Services |
| `MDT DOJ` | `doj` | Department of Justice |

---

## 🎯 Fonctionnalités

### ✅ Implémenté

- [x] Connexion Discord OAuth2
- [x] Récupération automatique des rôles Discord
- [x] Mapping rôles Discord → Agences OlympusMDT
- [x] Filtrage des agences par rôles
- [x] Protection des routes par middleware
- [x] Vérification des permissions par agence
- [x] Déconnexion
- [x] Gestion des erreurs
- [x] Messages d'erreur personnalisés
- [x] Configuration centralisée des agences

### 🔄 En Développement

- [ ] Système de permissions avancées (admin, officer, etc.)
- [ ] Logs d'audit des connexions
- [ ] Dashboard administrateur
- [ ] Statistiques d'utilisation
- [ ] Intégration Supabase pour stockage utilisateurs

### 💡 Améliorations Futures

- [ ] Multi-serveurs Discord
- [ ] Système de notifications Discord
- [ ] Authentification 2FA
- [ ] Gestion des sessions avancée
- [ ] API pour applications mobiles

---

## 🔧 Configuration

### Étape 1 : Discord Developer Portal

1. Créer une application sur https://discord.com/developers/applications
2. Configurer OAuth2 avec les scopes : `identify`, `guilds`, `guilds.members.read`
3. Ajouter les redirect URLs
4. Créer un bot et activer Server Members Intent
5. Inviter le bot sur votre serveur

### Étape 2 : Rôles Discord

Créer les rôles suivants sur votre serveur Discord :
- `MDT SASP`
- `MDT LSPD`
- `MDT BCSO`
- `MDT EMS`
- `MDT DOJ`

### Étape 3 : Configuration Application

1. Copier `.env.example` vers `.env`
2. Remplir les variables avec vos credentials Discord
3. Générer un `NEXTAUTH_SECRET` :
   ```bash
   openssl rand -base64 32
   ```

### Étape 4 : Démarrage

```bash
npm run dev
```

---

## 🧪 Tests

### Test de Connexion

1. Accédez à `http://localhost:3000/login`
2. Cliquez sur "Se connecter avec Discord"
3. Autorisez l'application
4. Vérifiez la redirection vers `/agency-selection`

### Test des Rôles

```typescript
// Dans la console du navigateur
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
console.log(session?.user?.agencies);
// Devrait afficher : ['sasp', 'lspd', ...]
```

### Test de Protection

1. Essayez d'accéder à `/dashboard/sasp` sans le rôle
2. Devrait rediriger vers `/agency-selection`

---

## 📊 Monitoring

### Logs Serveur

Les logs sont affichés dans la console du serveur Next.js :

```
[NextAuth] User logged in: DiscordID
[Discord] Fetching roles for user: DiscordID
[Discord] Found roles: [MDT SASP, MDT LSPD]
[Discord] Mapped to agencies: [sasp, lspd]
```

### API Debug

Endpoint de debug disponible : `/api/auth/debug`

---

## 🐛 Dépannage

### Problèmes Courants

1. **"No user found"**
   - Vérifiez les credentials Discord
   - Vérifiez les redirect URLs

2. **"No roles found"**
   - Vérifiez que le bot a les bonnes permissions
   - Vérifiez les noms des rôles Discord

3. **"Callback error"**
   - Vérifiez NEXTAUTH_URL
   - Vérifiez NEXTAUTH_SECRET

### Support

Pour plus d'aide, consultez :
- [Discord-OAuth-Implementation.md](./Discord-OAuth-Implementation.md) - Section Dépannage
- [Guide-Admin.md](./Guide-Admin.md) - Section Dépannage

---

## 🔒 Sécurité

### Bonnes Pratiques

✅ À faire :
- Générer un NEXTAUTH_SECRET fort
- Ne jamais committer les secrets dans Git
- Utiliser HTTPS en production
- Limiter les permissions du bot Discord
- Mettre à jour régulièrement les dépendances

❌ À ne pas faire :
- Partager les tokens Discord
- Utiliser des secrets faibles
- Donner des permissions excessives au bot
- Ignorer les logs d'erreur

---

## 📝 Licence

© OlympusRP.fr - Tous droits réservés
Créé par Snowzy

---

## 🤝 Contribution

Pour contribuer à ce système :

1. Lisez la documentation technique
2. Suivez les conventions de code
3. Testez vos modifications
4. Mettez à jour la documentation si nécessaire

---

## 📞 Contact

- **Développeur** : Snowzy
- **Support** : Discord Olympus RP
- **Documentation** : `.claude/Documentation/`

---

**Dernière mise à jour** : Janvier 2025
**Version** : 1.0.0
