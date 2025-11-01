# 🚔 OlympusMDT - Système MDT Premium pour FiveM

Une plateforme SaaS de Mobile Data Terminal (MDT) pour serveurs FiveM avec un design moderne glassmorphism/neomorphism.

## ✨ Caractéristiques

### 🎨 Design Premium
- **Glassmorphism** : Effets de verre dépoli avec backdrop-blur
- **Neomorphism** : Ombres douces et effet de profondeur
- **Dark Mode** : Thème sombre avec accents lumineux
- **Animations fluides** : Transitions et animations avec Framer Motion
- **Responsive** : Interface adaptative pour tous les écrans

### 📊 Fonctionnalités actuelles

#### Tableau de bord
- Statistiques en temps réel
- Actions rapides
- Activité récente
- Unités actives
- Aperçu des performances

#### Rapports
- Gestion complète des rapports
- Filtres et recherche
- Statuts multiples (brouillon, en attente, approuvé, rejeté)
- Niveaux de priorité

#### Planification
- Calendrier hebdomadaire/mensuel
- Gestion des shifts
- Affectations du personnel
- Planning personnel

### 🛠️ Technologies utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations
- **Lucide React** - Icônes
- **date-fns** - Gestion des dates

## 🚀 Démarrage rapide

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Scripts disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Créer un build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Vérifier le code
```

## 📁 Structure du projet

```
olympusmdt/
├── app/                      # Pages Next.js (App Router)
│   ├── page.tsx             # Dashboard principal
│   ├── rapports/            # Page des rapports
│   ├── planification/       # Page de planification
│   ├── layout.tsx           # Layout racine
│   └── globals.css          # Styles globaux
├── components/
│   ├── layout/              # Composants de mise en page
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                  # Composants UI réutilisables
│   │   └── StatCard.tsx
│   ├── dashboard/           # Composants du dashboard
│   │   ├── QuickActions.tsx
│   │   ├── RecentActivity.tsx
│   │   └── ActiveUnits.tsx
│   ├── reports/             # Composants des rapports
│   │   └── ReportCard.tsx
│   └── planning/            # Composants de planification
│       └── ShiftCard.tsx
├── lib/                     # Utilitaires
└── public/                  # Fichiers statiques
```

## 🎨 Système de design

### Couleurs

```css
- dark-950: #020617      (Background principal)
- dark-900: #0f172a      (Background secondaire)
- dark-850: #172033      (Néomorphisme)
- police-blue: #2563eb   (Couleur primaire)
- accent-purple: #8b5cf6
- accent-cyan: #06b6d4
- accent-green: #10b981
- accent-red: #ef4444
```

### Classes CSS personnalisées

```css
.glass              - Effet glassmorphism standard
.glass-strong       - Glassmorphism plus prononcé
.neo                - Effet neomorphism
.neo-inset          - Néomorphisme enfoncé
.card-hover         - Animation au survol des cartes
```

## 🔮 Fonctionnalités à venir

- [ ] Système d'authentification
- [ ] Base de données (recherche citoyens/véhicules)
- [ ] Système de notifications en temps réel
- [ ] Chat/Radio intégré
- [ ] Gestion des amendes
- [ ] Système de points de permis
- [ ] Carte interactive
- [ ] Rapports avancés avec templates
- [ ] Export PDF des rapports
- [ ] API REST pour intégration FiveM
- [ ] Webhooks Discord
- [ ] Panel d'administration

## 📝 Prochaines étapes

1. **Backend** : Implémenter l'API et la base de données
2. **Auth** : Système de connexion sécurisé
3. **Intégration FiveM** : Connecter avec le serveur de jeu
4. **Temps réel** : WebSockets pour les mises à jour live

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

Propriétaire - Tous droits réservés

---

Développé avec ❤️ pour la communauté FiveM
