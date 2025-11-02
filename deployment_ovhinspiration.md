> ok j'aimerai maintenant pouvoir deployer ce site sur internet via ovh tu as ca comme inspiration sans
  copier ce que fait le document . il faut adapter par rapport a notre donnees / projet 

  # Guide de Déploiement OVH via GitHub Actions

Ce guide explique comment configurer le déploiement automatique d'une application Vite/React vers un hébergement OVH mutualisé via FTP en utilisant GitHub Actions.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration OVH](#configuration-ovh)
3. [Configuration GitHub](#configuration-github)
4. [Structure du workflow](#structure-du-workflow)
5. [Configuration des fichiers](#configuration-des-fichiers)
6. [Déploiement](#déploiement)
7. [Vérification et dépannage](#vérification-et-dépannage)

---

## Prérequis

### Infrastructure
- Compte OVH avec hébergement mutualisé
- Accès FTP activé
- Nom de domaine configuré et pointé vers OVH
- Repository GitHub

### Outils
- Node.js 18+ installé localement
- Git configuré
- Application Vite/React fonctionnelle

---

## Configuration OVH

### 1. Récupérer les informations FTP

Connectez-vous à votre espace client OVH:

1. **Hébergements** → Sélectionner votre hébergement
2. **FTP-SSH** → Noter les informations:
   - **Serveur FTP**: `ftp.clusterXXX.hosting.ovh.net` (exemple: `ftp.cluster121.hosting.ovh.net`)
   - **Login FTP**: votre identifiant (généralement votre domaine)
   - **Mot de passe**: si oublié, réinitialisez-le depuis l'espace client

### 2. Structure des répertoires OVH

Sur OVH mutualisé, la structure typique est:
```
/
├── www/              # ← Racine web publique (vos fichiers vont ici)
├── logs/             # Logs du serveur
└── .ovhconfig        # Configuration PHP/serveur
```

**Important**: Déployez toujours dans `/www/` qui est la racine publique accessible via votre domaine.

### 3. Configuration PHP (si nécessaire)

Si votre app utilise des scripts PHP (comme `api/discord-roles.php`):

1. Créer/éditer `.ovhconfig` à la racine FTP:
```ini
app.engine=php
app.engine.version=8.2
http.firewall=security
environment=production
```

2. Redémarrer l'hébergement depuis l'espace client OVH si nécessaire.

---

## Configuration GitHub

### 1. Secrets GitHub Repository

Allez dans votre repository GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez les secrets suivants:

#### Secrets FTP OVH (obligatoires)
```
OVH_FTP_USER     → Votre login FTP OVH
OVH_FTP_PASS     → Votre mot de passe FTP OVH
```

#### Secrets Application (selon vos besoins)
```
VITE_DISCORD_CLIENT_ID          → Client ID de votre app Discord
VITE_DISCORD_CLIENT_SECRET      → Client Secret Discord
VITE_DISCORD_GUILD_ID           → ID de votre serveur Discord
VITE_SUPABASE_URL               → URL de votre projet Supabase (optionnel)
VITE_SUPABASE_ANON_KEY          → Clé anonyme Supabase (optionnel)
DISCORD_BOT_TOKEN               → Token de bot Discord (si utilisé côté serveur)
```

**Note**: Tous les secrets commençant par `VITE_` seront injectés dans le build frontend.

### 2. Vérifier les permissions GitHub Actions

Dans **Settings** → **Actions** → **General**:
- ✅ Cochez "Allow all actions and reusable workflows"
- ✅ Permissions: "Read and write permissions"

---

## Structure du workflow

### 1. Créer le fichier workflow

Créez `.github/workflows/deploy-ovh.yml` à la racine de votre repository:

```yaml
name: Deploy to OVH

on:
  push:
    branches:
      - main  # Déclenché à chaque push sur main
  workflow_dispatch:  # Permet déclenchement manuel

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Récupérer le code
      - name: Checkout code
        uses: actions/checkout@v3

      # 2. Installer Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Installer les dépendances
      - name: Install dependencies
        run: npm ci

      # 4. Build l'application avec variables d'environnement
      - name: Build application
        run: npm run build
        env:
          VITE_DISCORD_CLIENT_ID: ${{ secrets.VITE_DISCORD_CLIENT_ID }}
          VITE_DISCORD_CLIENT_SECRET: ${{ secrets.VITE_DISCORD_CLIENT_SECRET }}
          VITE_DISCORD_GUILD_ID: ${{ secrets.VITE_DISCORD_GUILD_ID }}
          VITE_APP_URL: https://votre-domaine.fr
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      # 5. Préparer les fichiers de déploiement
      - name: Prepare deployment files
        run: |
          # Copier .htaccess dans dist/ pour URL rewriting SPA
          cp public/.htaccess dist/.htaccess || echo "⚠️ .htaccess not found"

          # Copier les fichiers API PHP si présents
          if [ -d "api" ]; then
            mkdir -p dist/api
            cp -r api/* dist/api/
          fi

      # 6. Vérifier que les credentials FTP sont configurés
      - name: Check FTP credentials
        id: check-ftp
        run: |
          if [ -n "${{ secrets.OVH_FTP_USER }}" ] && [ -n "${{ secrets.OVH_FTP_PASS }}" ]; then
            echo "ftp_available=true" >> $GITHUB_OUTPUT
          else
            echo "ftp_available=false" >> $GITHUB_OUTPUT
            echo "⚠️ FTP credentials not configured. Skipping deployment."
          fi

      # 7. Déployer via FTP
      - name: Deploy to OVH via FTP
        if: steps.check-ftp.outputs.ftp_available == 'true'
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: ftp.cluster121.hosting.ovh.net  # ← Remplacez par votre serveur
          username: ${{ secrets.OVH_FTP_USER }}
          password: ${{ secrets.OVH_FTP_PASS }}
          local-dir: ./dist/
          server-dir: /www/
          dangerous-clean-slate: true  # Supprime tout avant d'uploader (⚠️ attention)

      # 8. Vérifier que le site répond
      - name: Verify deployment
        run: |
          echo "Testing deployment..."
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://votre-domaine.fr)
          echo "HTTP Status: $HTTP_CODE"

          if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Deployment successful!"
          else
            echo "⚠️ Deployment may have issues (HTTP $HTTP_CODE)"
          fi
```

### 2. Adapter le workflow à votre structure

Si votre app est dans un sous-répertoire (comme `mdt-dashboard/`):

```yaml
- name: Install dependencies
  run: |
    cd votre-sous-dossier
    npm ci

- name: Build application
  run: |
    cd votre-sous-dossier
    npm run build
  env:
    # ... vos variables

- name: Deploy to OVH via FTP
  uses: SamKirkland/FTP-Deploy-Action@4.3.3
  with:
    local-dir: ./votre-sous-dossier/dist/
    # ... reste de la config
```

---

## Configuration des fichiers

### 1. Fichier `.htaccess` pour SPA (CRUCIAL)

Créez `public/.htaccess` dans votre projet:

```apache
# Enable URL rewriting
RewriteEngine On
RewriteBase /

# Don't rewrite existing files/directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Redirect everything to index.html (SPA routing)
RewriteRule . /index.html [L]
```

**Pourquoi c'est crucial?**
- Sans ce fichier, les routes React (`/dashboard`, `/login`, etc.) renverront une erreur 404 lors d'un refresh
- OVH Apache a besoin de cette config pour gérer le routing côté client

### 2. Fichier `.env.example`

Créez un template pour documenter les variables:

```bash
# Discord OAuth2 Configuration
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
VITE_DISCORD_REDIRECT_URI=https://votre-domaine.fr/auth/callback

# Discord Guild ID
VITE_DISCORD_GUILD_ID=your_discord_server_id

# URLs
VITE_APP_URL=https://votre-domaine.fr
VITE_API_URL=https://votre-domaine.fr/api

# Supabase (optionnel)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Fichier `.gitignore`

Assurez-vous que `.env` est ignoré:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Build output
dist/
build/

# Dependencies
node_modules/
```

---

## Déploiement

### 1. Premier déploiement

```bash
# 1. Vérifier que le build fonctionne localement
npm run build

# 2. Tester le build en local
npm run preview

# 3. Commit et push sur main
git add .
git commit -m "🚀 Setup OVH deployment"
git push origin main
```

### 2. Suivre le déploiement

1. Allez sur GitHub → **Actions**
2. Cliquez sur le workflow en cours
3. Suivez les logs en temps réel
4. Vérifiez les étapes:
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Build application
   - ✅ Deploy to OVH via FTP
   - ✅ Verify deployment

### 3. Déclenchement manuel

Si vous voulez déployer sans push:

1. GitHub → **Actions**
2. Sélectionner "Deploy to OVH"
3. Cliquer "Run workflow" → "Run workflow"

---

## Vérification et dépannage

### Vérifier que le site fonctionne

```bash
# Test HTTP
curl -I https://votre-domaine.fr

# Test avec affichage du contenu
curl https://votre-domaine.fr
```

**Résultat attendu**: HTTP 200 OK + contenu HTML

### Problèmes courants

#### ❌ Erreur 404 sur les routes React

**Symptôme**: `https://votre-domaine.fr/dashboard` → 404

**Solution**:
- Vérifier que `.htaccess` est bien présent dans `/www/`
- Vérifier que le module `mod_rewrite` est activé (par défaut sur OVH)
- Contenu du `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### ❌ Variables d'environnement non définies

**Symptôme**: `import.meta.env.VITE_XXX` retourne `undefined`

**Solution**:
- Vérifier que les secrets GitHub sont bien configurés
- Vérifier que le nom commence par `VITE_` (Vite ne build que celles-ci)
- Rebuild en local pour tester:
```bash
VITE_DISCORD_CLIENT_ID=test npm run build
```

#### ❌ Échec du déploiement FTP

**Symptôme**: GitHub Actions échoue à l'étape "Deploy to OVH via FTP"

**Solutions**:
1. **Vérifier les credentials FTP**:
   - Login/password corrects dans GitHub Secrets
   - Tester via FileZilla pour confirmer

2. **Vérifier le serveur FTP**:
   - Format: `ftp.clusterXXX.hosting.ovh.net`
   - Trouver le bon cluster dans l'espace client OVH

3. **Permissions**:
   - Le répertoire `/www/` doit être accessible en écriture
   - Sur OVH mutualisé, c'est normalement le cas par défaut

#### ❌ Page blanche après déploiement

**Symptôme**: Le site charge mais affiche une page blanche

**Solutions**:
1. **Vérifier la console browser** (F12):
   - Erreurs JavaScript?
   - Erreurs de chargement de ressources?

2. **Vérifier le base path dans Vite**:

   Si votre app est dans un sous-dossier, modifiez `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/',  // ou '/sous-dossier/' si déployé dans un sous-dossier
   })
   ```

3. **Vérifier les chemins absolus**:
   - Ne pas utiliser de chemins absolus hardcodés
   - Utiliser `import.meta.env.BASE_URL` si nécessaire

#### ❌ API PHP ne fonctionne pas

**Symptôme**: Appels API retournent 500 ou 404

**Solutions**:
1. **Vérifier la version PHP**:
   - Créer `.ovhconfig` à la racine FTP
   - Spécifier `app.engine.version=8.2`

2. **Vérifier les chemins**:
   - Les fichiers PHP doivent être dans `/www/api/`
   - Accessible via `https://votre-domaine.fr/api/script.php`

3. **Logs PHP**:
   - Consulter `/logs/` via FTP pour voir les erreurs PHP

### Commandes de debug

#### Vérifier les fichiers déployés
```bash
# Se connecter via FTP
ftp ftp.cluster121.hosting.ovh.net
# Login: votre-login
# Password: votre-password

# Lister les fichiers
cd www
ls -la
```

#### Vérifier les headers HTTP
```bash
curl -I https://votre-domaine.fr
curl -I https://votre-domaine.fr/dashboard
curl -I https://votre-domaine.fr/api/discord-roles.php
```

#### Tester le build localement avant déploiement
```bash
# Build avec variables de production
VITE_APP_URL=https://votre-domaine.fr npm run build

# Servir le build
npx serve -s dist -p 3000

# Tester
open http://localhost:3000
```

---

## Checklist de déploiement

Avant de déployer:

- [ ] Secrets GitHub configurés (FTP + variables app)
- [ ] Fichier `.htaccess` présent dans `public/`
- [ ] Build fonctionne en local (`npm run build`)
- [ ] Preview fonctionne en local (`npm run preview`)
- [ ] Workflow GitHub Actions créé dans `.github/workflows/`
- [ ] URL de production configurée dans `VITE_APP_URL`
- [ ] Discord OAuth redirect URI mis à jour avec URL de production
- [ ] Domaine DNS pointé vers OVH
- [ ] Accès FTP testé via FileZilla ou autre client

Après le premier déploiement:

- [ ] Site accessible via `https://votre-domaine.fr`
- [ ] Routes React fonctionnent (`/dashboard`, `/login`, etc.)
- [ ] Variables d'environnement chargées correctement
- [ ] OAuth Discord fonctionne
- [ ] API PHP répond (si applicable)
- [ ] Console browser sans erreurs
- [ ] Tests manuels des fonctionnalités principales

---

## Maintenance et mises à jour

### Déploiement continu

Une fois configuré, chaque `git push` sur `main` déclenche automatiquement:
1. Build de l'application
2. Déploiement sur OVH
3. Vérification HTTP

### Rollback

Si un déploiement pose problème:

1. **Via Git**:
```bash
git revert HEAD
git push origin main
```

2. **Via FTP manuel**:
- Garder une sauvegarde locale du dossier `dist/` précédent
- Upload manuel via FileZilla en cas d'urgence

### Monitoring

Configurez une alerte GitHub:
- **Settings** → **Notifications** → Cocher "Actions"
- Recevoir un email si un workflow échoue

---

## Ressources

- [Documentation OVH Hébergement Web](https://docs.ovh.com/fr/hosting/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Router & Server Configuration](https://reactrouter.com/en/main/routers/create-browser-router#server-configuration)

---

**Créé pour**: Déploiement d'applications Vite/React sur OVH mutualisé
**Testé avec**: Node.js 18, Vite 5, React 18, OVH Cluster 121
**Dernière mise à jour**: Janvier 2025
