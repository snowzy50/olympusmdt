# Documentation OlympusMDT

Bienvenue dans la documentation complète d'OlympusMDT - Plateforme de Traçabilité des Dispositifs Médicaux.

## 📚 Structure de la documentation

Cette documentation est organisée par modules et par type de contenu pour faciliter la navigation.

### 🏗️ Architecture

Documentation technique de l'architecture globale et des choix de design.

- **[PROJECT_SUMMARY.md](./Architecture/PROJECT_SUMMARY.md)** - Vue d'ensemble complète du projet
- **[DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)** - Guide de conception et standards UI/UX

### 📖 Guides

Guides d'utilisation et documentation de référence.

- **[GETTING_STARTED.md](./Guides/GETTING_STARTED.md)** - Guide de démarrage rapide
- **[COMMANDS.md](./Guides/COMMANDS.md)** - Liste des commandes disponibles
- **[ROADMAP.md](./Guides/ROADMAP.md)** - Feuille de route du projet

### 📊 Dashboard

Documentation technique et guide utilisateur du module Dashboard.

- **[README.md](./Dashboard/README.md)** - Documentation technique complète
- **[GUIDE_UTILISATION.md](./Dashboard/GUIDE_UTILISATION.md)** - Guide utilisateur détaillé

**Composants :**
- `components/dashboard/ActiveUnits.tsx` - Affichage des unités actives
- `components/dashboard/QuickActions.tsx` - Actions rapides
- `components/dashboard/RecentActivity.tsx` - Historique récent
- `components/ui/StatCard.tsx` - Cartes de statistiques

### 📅 Planification

Documentation technique et guide utilisateur du module Planification.

- **[README.md](./Planification/README.md)** - Documentation technique complète
- **[GUIDE_UTILISATION.md](./Planification/GUIDE_UTILISATION.md)** - Guide utilisateur détaillé

**Composants :**
- `components/planning/ShiftCard.tsx` - Carte de cycle de stérilisation
- Vue calendrier (à implémenter)
- Gestion des autoclaves
- Planification des opérateurs

### 📋 Rapports

Documentation technique et guide utilisateur du module Rapports.

- **[README.md](./Rapports/README.md)** - Documentation technique complète
- **[GUIDE_UTILISATION.md](./Rapports/GUIDE_UTILISATION.md)** - Guide utilisateur détaillé

**Types de rapports :**
- Traçabilité dispositif
- Conformité cycle
- Synthèse mensuelle
- Audit complet
- Rapports personnalisés

## 🎯 Navigation rapide

### Pour les développeurs

1. **Commencer :** [GETTING_STARTED.md](./Guides/GETTING_STARTED.md)
2. **Architecture :** [PROJECT_SUMMARY.md](./Architecture/PROJECT_SUMMARY.md)
3. **Design :** [DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)
4. **Commandes :** [COMMANDS.md](./Guides/COMMANDS.md)

### Pour les utilisateurs

1. **Dashboard :** [Guide d'utilisation](./Dashboard/GUIDE_UTILISATION.md)
2. **Planification :** [Guide d'utilisation](./Planification/GUIDE_UTILISATION.md)
3. **Rapports :** [Guide d'utilisation](./Rapports/GUIDE_UTILISATION.md)

### Pour les chefs de projet

1. **Vue d'ensemble :** [PROJECT_SUMMARY.md](./Architecture/PROJECT_SUMMARY.md)
2. **Roadmap :** [ROADMAP.md](./Guides/ROADMAP.md)
3. **Standards :** [DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)

## 🔍 Trouver ce dont vous avez besoin

### Par rôle

**Technicien de stérilisation :**
- [Guide Dashboard](./Dashboard/GUIDE_UTILISATION.md) - Surveiller les dispositifs
- [Guide Planification](./Planification/GUIDE_UTILISATION.md) - Gérer les cycles

**Superviseur :**
- Tous les guides utilisateurs
- [Guide Rapports](./Rapports/GUIDE_UTILISATION.md) - Générer des rapports

**Développeur :**
- Documentation technique de chaque module
- [PROJECT_SUMMARY.md](./Architecture/PROJECT_SUMMARY.md)
- [DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)

**Auditeur qualité :**
- [Guide Rapports](./Rapports/GUIDE_UTILISATION.md)
- Documentation de conformité

### Par tâche

**Installation et démarrage :**
→ [GETTING_STARTED.md](./Guides/GETTING_STARTED.md)

**Créer un cycle de stérilisation :**
→ [Guide Planification](./Planification/GUIDE_UTILISATION.md#créer-un-cycle-de-stérilisation)

**Générer un rapport :**
→ [Guide Rapports](./Rapports/GUIDE_UTILISATION.md#générer-un-rapport)

**Comprendre l'architecture :**
→ [PROJECT_SUMMARY.md](./Architecture/PROJECT_SUMMARY.md)

**Développer un nouveau composant :**
→ [DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)

**Voir la feuille de route :**
→ [ROADMAP.md](./Guides/ROADMAP.md)

## 📦 Modules

### ✅ Implémentés

| Module | Version | Documentation |
|--------|---------|---------------|
| **Dashboard** | 1.0.0 | [Docs](./Dashboard/) |
| **Planification** | 1.0.0 | [Docs](./Planification/) |
| **Rapports** | 1.0.0 | [Docs](./Rapports/) |

### 🚧 En développement

| Module | Statut | Documentation |
|--------|--------|---------------|
| Gestion des dispositifs | Planifié | À venir |
| Maintenance | Planifié | À venir |
| Administration | Planifié | À venir |
| Traçabilité temps réel | Planifié | À venir |

## 🛠️ Stack technique

- **Framework :** Next.js 14+ (App Router)
- **UI :** React 18+, TypeScript
- **Styling :** Tailwind CSS
- **Icônes :** Lucide React
- **Base de données :** À définir (PostgreSQL recommandé)
- **API :** Next.js API Routes
- **Tests :** Jest + React Testing Library (à implémenter)

## 📊 Normes et conformité

OlympusMDT est conçu pour respecter :

- **ISO 13485** - Systèmes de management de la qualité (dispositifs médicaux)
- **ISO 17665** - Stérilisation des produits de santé
- **EN 285** - Stérilisation - Grands stérilisateurs à vapeur d'eau
- **RGPD** - Protection des données personnelles

## 🤝 Contribution

Pour contribuer au projet :

1. Consultez le [DESIGN_GUIDE.md](./Architecture/DESIGN_GUIDE.md)
2. Suivez les conventions de code
3. Documentez vos modifications
4. Testez vos changements

## 📞 Support

- **Documentation :** Vous êtes ici ! 📍
- **Issues :** Reportez les bugs sur GitHub
- **Email :** support@olympusmdt.com
- **Téléphone :** +33 1 XX XX XX XX

## 📝 Changelog

Voir [CHANGELOG.md](../../CHANGELOG.md) à la racine du projet.

## 🏛️ À propos

**OlympusMDT** est une plateforme complète de traçabilité des dispositifs médicaux, conçue pour optimiser la gestion de la stérilisation dans les établissements de santé.

**Créé par :** Snowzy
**Licence :** À définir
**Version actuelle :** 1.0.0
**Dernière mise à jour :** 2025-11-01

---

## 🗺️ Plan du site documentation

```
.claude/Documentation/
├── README.md (vous êtes ici)
│
├── Architecture/
│   ├── PROJECT_SUMMARY.md
│   └── DESIGN_GUIDE.md
│
├── Guides/
│   ├── GETTING_STARTED.md
│   ├── COMMANDS.md
│   └── ROADMAP.md
│
├── Dashboard/
│   ├── README.md (doc technique)
│   └── GUIDE_UTILISATION.md (guide utilisateur)
│
├── Planification/
│   ├── README.md (doc technique)
│   └── GUIDE_UTILISATION.md (guide utilisateur)
│
└── Rapports/
    ├── README.md (doc technique)
    └── GUIDE_UTILISATION.md (guide utilisateur)
```

---

**🏛️ OlympusMDT** - Excellence en traçabilité des dispositifs médicaux
