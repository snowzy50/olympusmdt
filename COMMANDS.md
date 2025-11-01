# 🛠️ Commandes utiles - OlympusMDT

## 🚀 Développement

### Démarrer le serveur de développement
```bash
npm run dev
```
Ouvre l'application sur http://localhost:3000 avec hot-reload

### Build de production
```bash
npm run build
```
Crée une version optimisée pour la production

### Démarrer en production
```bash
npm run start
```
Lance le serveur en mode production (nécessite `npm run build` d'abord)

### Linter
```bash
npm run lint
```
Vérifie le code avec ESLint

## 📦 Gestion des dépendances

### Installer toutes les dépendances
```bash
npm install
```

### Ajouter une dépendance
```bash
npm install <package-name>
```

### Ajouter une dépendance de développement
```bash
npm install -D <package-name>
```

### Mettre à jour les dépendances
```bash
npm update
```

### Supprimer une dépendance
```bash
npm uninstall <package-name>
```

## 🧹 Nettoyage

### Nettoyer les fichiers de build
```bash
rm -rf .next
```

### Réinstaller toutes les dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Nettoyer le cache npm
```bash
npm cache clean --force
```

## 🔧 Commandes Next.js utiles

### Analyser le bundle
```bash
# Installer l'analyseur
npm install -D @next/bundle-analyzer

# Analyser
ANALYZE=true npm run build
```

### Générer un sitemap
```bash
# À implémenter plus tard avec next-sitemap
```

## 🗄️ Base de données (à configurer)

### Prisma (quand configuré)
```bash
# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name <migration-name>

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio

# Reset la base de données
npx prisma migrate reset
```

## 🧪 Tests (à implémenter)

### Jest (à configurer)
```bash
# Lancer les tests
npm test

# Tests en mode watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Cypress (à configurer)
```bash
# Ouvrir Cypress
npx cypress open

# Lancer les tests E2E
npx cypress run
```

## 🐳 Docker (à configurer)

### Build l'image
```bash
docker build -t olympusmdt .
```

### Lancer le container
```bash
docker run -p 3000:3000 olympusmdt
```

### Docker Compose
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f
```

## 📊 Monitoring et Debug

### Analyser les performances
```bash
# Activer le mode profiler React
npm run dev -- --profile
```

### Voir les variables d'environnement
```bash
# Development
cat .env.local

# Production
cat .env.production
```

### Vérifier les types TypeScript
```bash
npx tsc --noEmit
```

## 🌐 Déploiement

### Vercel (recommandé pour Next.js)
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Production
vercel --prod
```

### Build statique (si nécessaire)
```bash
# Dans next.config.js, ajouter: output: 'export'
npm run build
# Les fichiers sont dans /out
```

## 🔐 Sécurité

### Audit de sécurité
```bash
npm audit

# Corriger automatiquement
npm audit fix

# Corriger avec breaking changes
npm audit fix --force
```

### Vérifier les licences
```bash
npx license-checker
```

## 📝 Git

### Initialiser Git (si pas fait)
```bash
git init
git add .
git commit -m "Initial commit - OlympusMDT v1.0"
```

### Workflow classique
```bash
# Vérifier les changements
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Description des changements"

# Push
git push origin main
```

### Créer une branche
```bash
# Créer et basculer
git checkout -b feature/nouvelle-fonctionnalite

# Pusher la branche
git push -u origin feature/nouvelle-fonctionnalite
```

## 🔄 Mise à jour du projet

### Mettre à jour Next.js
```bash
npm install next@latest react@latest react-dom@latest
```

### Mettre à jour Tailwind
```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

### Vérifier les versions
```bash
npm list --depth=0
```

## 📈 Performance

### Analyser la taille du bundle
```bash
npm run build
# Regarder les fichiers dans .next/static
```

### Optimiser les images
```bash
# Next.js optimise automatiquement avec next/image
# Vérifier la config dans next.config.js
```

## 🛠️ Développement avancé

### Générer un composant (script personnalisé à créer)
```bash
# À créer: scripts/generate-component.js
npm run generate:component <ComponentName>
```

### Hot reload des types
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Type checking en continu
npx tsc --watch --noEmit
```

## 🐛 Debug

### Debug dans VS Code
Créer `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logs détaillés
```bash
# Mode verbose
npm run dev -- --verbose

# Voir toutes les variables
NODE_OPTIONS='--inspect' npm run dev
```

## 💡 Astuces

### Clear Next.js cache
```bash
rm -rf .next && npm run dev
```

### Port différent
```bash
PORT=3001 npm run dev
```

### Mode strict
```bash
# Déjà activé dans next.config.js
reactStrictMode: true
```

---

Pour plus d'informations, consultez :
- [Next.js CLI](https://nextjs.org/docs/api-reference/cli)
- [npm Documentation](https://docs.npmjs.com/)
- [Package.json scripts](./package.json)
