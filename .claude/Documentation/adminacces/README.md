# Accès Admin - Documentation Technique

## Vue d'ensemble

Cette branche implémente un système d'accès admin qui bypass complètement l'authentification Discord. Cela permet un accès direct à toutes les agences sans nécessiter de rôles Discord.

## Fonctionnalités

### 1. Page de connexion Admin
- **Route**: `/admin`
- **Design**: Interface sécurisée avec thème rouge/orange pour différencier de la connexion Discord
- **Champs**:
  - Nom d'utilisateur: `Admin`
  - Mot de passe: `****` (visible avec toggle eye/eye-off)

### 2. Credentials Admin
- **Username**: `Admin`
- **Password**: `Admin123`
- **Accès**: Toutes les agences (LSPD, BCSO, SASP, EMS, DOJ)

### 3. Bypass complet
L'admin bypass contourne:
- Vérification des rôles Discord
- Restriction d'accès aux agences
- Vérification du nombre d'agences

## Architecture

### Fichiers modifiés

#### 1. `/app/admin/page.tsx` (nouveau)
Page de connexion admin avec:
- Formulaire username/password
- Toggle pour afficher/masquer le mot de passe
- Gestion d'erreurs
- Redirection automatique vers agency-selection après connexion

#### 2. `/lib/auth/config.ts`
Ajout du `CredentialsProvider`:
```typescript
CredentialsProvider({
  id: 'credentials',
  name: 'Admin Credentials',
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
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
})
```

Modification du callback JWT pour gérer l'admin:
```typescript
async jwt({ token, account, profile, user }) {
  // Gestion de l'admin bypass
  if (user && (user as any).isAdmin) {
    token.isAdmin = true;
    token.discordId = 'admin-bypass';
    token.discordRoles = [];
    token.agencies = ['lspd', 'bcso', 'sasp', 'ems', 'doj'];
    return token;
  }
  // ... reste du code Discord
}
```

#### 3. `/middleware.ts`
Modifications pour autoriser l'accès admin:

**Routes publiques**:
```typescript
const publicRoutes = ['/login', '/admin', '/api/auth'];
```

**Redirection après connexion**:
```typescript
if (token && (pathname === '/login' || pathname === '/admin')) {
  return NextResponse.redirect(new URL('/agency-selection', request.url));
}
```

**Bypass agency-selection**:
```typescript
if (pathname.startsWith('/agency-selection') && token) {
  const isAdmin = token.isAdmin as boolean;

  // Bypass pour l'admin
  if (isAdmin) {
    return NextResponse.next();
  }
  // ... vérifications normales
}
```

**Bypass dashboard**:
```typescript
if (pathname.startsWith('/dashboard/')) {
  const isAdmin = token?.isAdmin as boolean;

  // Bypass pour l'admin
  if (isAdmin) {
    return NextResponse.next();
  }
  // ... vérifications normales
}
```

## Sécurité

### Points importants
1. **Credentials en dur**: Les identifiants sont stockés en dur dans le code pour simplifier l'accès
2. **Pas de limitation**: L'admin a accès à toutes les fonctionnalités sans restriction
3. **Logs**: Les connexions admin sont loggées dans le middleware

### Recommandations
Pour la production, considérer:
- Déplacer les credentials dans les variables d'environnement
- Ajouter un système de rate limiting
- Implémenter des logs de sécurité plus robustes
- Ajouter une authentification 2FA

## Utilisation

### Connexion Admin
1. Accéder à `/admin`
2. Entrer:
   - Username: `Admin`
   - Password: `Admin123`
3. Cliquer sur "Se connecter"
4. Redirection automatique vers agency-selection avec accès à toutes les agences

### Depuis la page de login Discord
Un lien "Accès Admin" est disponible en bas du formulaire de connexion Discord (page `/login`).

## Tests

### Test de connexion
```bash
# Démarrer le serveur
npm run dev

# Accéder à http://localhost:3000/admin
# Tester les credentials Admin/Admin123
```

### Test de bypass
```bash
# Après connexion admin, vérifier l'accès à:
# - /agency-selection (toutes les agences visibles)
# - /dashboard/lspd (accès direct)
# - /dashboard/bcso (accès direct)
# - etc.
```

## Changelog

### Version 0.1.0 (2025-11-01)
- Création de la page `/admin`
- Ajout du CredentialsProvider
- Implémentation du bypass dans middleware
- Ajout du lien "Accès Admin" sur la page login
- Documentation complète

## Auteur

Créé par Snowzy
