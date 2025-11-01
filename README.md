# 🏛️ OlympusMDT - Plateforme de Traçabilité des Dispositifs Médicaux

Système complet de gestion et de traçabilité des dispositifs médicaux pour les établissements de santé, avec un design moderne et une architecture scalable.

## ✨ Caractéristiques

### 🎨 Design moderne et accessible
- **Interface intuitive** : Conçue pour une utilisation quotidienne efficace
- **Responsive** : Fonctionne sur desktop, tablette et mobile
- **Accessibilité** : Conforme aux standards WCAG 2.1
- **Performance** : Optimisé pour une utilisation rapide et fluide

### 📊 Modules principaux

#### 📈 Dashboard
- Surveillance en temps réel des dispositifs médicaux
- Statistiques de conformité et performance
- Indicateurs clés de performance (KPI)
- Alertes et notifications
- Actions rapides pour les opérations courantes

**[📖 Voir la documentation](/.claude/Documentation/Dashboard/)**

#### 📅 Planification
- Gestion des cycles de stérilisation
- Calendrier interactif (jour/semaine/mois)
- Affectation des autoclaves et opérateurs
- Détection automatique des conflits
- Optimisation des ressources

**[📖 Voir la documentation](/.claude/Documentation/Planification/)**

#### 📋 Rapports
- Traçabilité complète des dispositifs
- Certificats de conformité
- Synthèses mensuelles
- Rapports d'audit
- Export PDF, Excel, CSV

**[📖 Voir la documentation](/.claude/Documentation/Rapports/)**

### 🛠️ Stack technique

- **Next.js 14+** - Framework React avec App Router
- **TypeScript** - Typage statique pour la fiabilité
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Bibliothèque d'icônes moderne
- **PostgreSQL** - Base de données relationnelle (à implémenter)
- **Prisma** - ORM moderne (à implémenter)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/snowzy50/olympusmdt.git
cd olympusmdt
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditez .env avec vos configurations
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

### Scripts disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Créer un build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Vérifier le code avec ESLint
```

**📖 Guide complet :** [GETTING_STARTED.md](./.claude/Documentation/Guides/GETTING_STARTED.md)

## 📁 Structure du projet

```
olympusmdt/
├── .claude/
│   └── Documentation/           # 📚 Documentation complète
│       ├── README.md           # Index de la documentation
│       ├── Architecture/       # Docs d'architecture
│       ├── Guides/            # Guides d'utilisation
│       ├── Dashboard/         # Docs module Dashboard
│       ├── Planification/     # Docs module Planification
│       └── Rapports/          # Docs module Rapports
│
├── app/                        # Pages Next.js (App Router)
│   ├── page.tsx               # Dashboard principal
│   ├── planification/         # Module Planification
│   ├── rapports/              # Module Rapports
│   ├── layout.tsx             # Layout racine
│   └── globals.css            # Styles globaux
│
├── components/
│   ├── layout/                # Mise en page
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                    # Composants UI réutilisables
│   ├── dashboard/             # Composants Dashboard
│   ├── planning/              # Composants Planification
│   └── reports/               # Composants Rapports
│
├── lib/                       # Utilitaires et helpers
├── public/                    # Assets statiques
└── CHANGELOG.md              # Historique des versions
```

**📖 Voir la structure complète :** [PROJECT_SUMMARY.md](./.claude/Documentation/Architecture/PROJECT_SUMMARY.md)

## 📚 Documentation

La documentation complète est organisée dans `.claude/Documentation/` :

### 📖 Pour commencer
- **[README de la documentation](./.claude/Documentation/README.md)** - Index général
- **[Guide de démarrage](./.claude/Documentation/Guides/GETTING_STARTED.md)** - Installation et configuration
- **[Commandes](./.claude/Documentation/Guides/COMMANDS.md)** - Référence des commandes

### 🏗️ Architecture
- **[Vue d'ensemble](./.claude/Documentation/Architecture/PROJECT_SUMMARY.md)** - Architecture du projet
- **[Guide de design](./.claude/Documentation/Architecture/DESIGN_GUIDE.md)** - Standards UI/UX

### 📦 Modules

| Module | Doc Technique | Guide Utilisateur |
|--------|---------------|-------------------|
| **Dashboard** | [README](./.claude/Documentation/Dashboard/README.md) | [Guide](./.claude/Documentation/Dashboard/GUIDE_UTILISATION.md) |
| **Planification** | [README](./.claude/Documentation/Planification/README.md) | [Guide](./.claude/Documentation/Planification/GUIDE_UTILISATION.md) |
| **Rapports** | [README](./.claude/Documentation/Rapports/README.md) | [Guide](./.claude/Documentation/Rapports/GUIDE_UTILISATION.md) |

### 🗺️ Feuille de route
- **[ROADMAP](./.claude/Documentation/Guides/ROADMAP.md)** - Fonctionnalités planifiées
- **[CHANGELOG](./CHANGELOG.md)** - Historique des versions

## 🎯 Conformité et normes

OlympusMDT est conçu pour respecter les normes internationales :

- **ISO 13485** - Systèmes de management de la qualité (dispositifs médicaux)
- **ISO 17665** - Stérilisation des produits de santé
- **EN 285** - Stérilisation - Grands stérilisateurs à vapeur d'eau
- **RGPD** - Protection des données personnelles

## 🔮 Roadmap

### Phase 1 - MVP (Actuel)
- ✅ Interface utilisateur de base
- ✅ Dashboard avec statistiques
- ✅ Module de planification
- ✅ Module de rapports
- ✅ Documentation complète

### Phase 2 - Backend & Données
- [ ] Base de données PostgreSQL avec Prisma
- [ ] API REST sécurisée
- [ ] Système d'authentification
- [ ] Gestion des dispositifs médicaux
- [ ] Gestion des autoclaves
- [ ] Gestion des utilisateurs et permissions

### Phase 3 - Fonctionnalités avancées
- [ ] Traçabilité temps réel
- [ ] Intégration avec autoclaves (IoT)
- [ ] Notifications push
- [ ] Génération PDF des rapports
- [ ] Signatures électroniques
- [ ] Audit trail complet

### Phase 4 - Optimisation
- [ ] Dashboard personnalisable
- [ ] Analytics avancés
- [ ] Export de données
- [ ] Intégrations tierces
- [ ] Application mobile

**📖 Roadmap détaillée :** [ROADMAP.md](./.claude/Documentation/Guides/ROADMAP.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le [DESIGN_GUIDE.md](./.claude/Documentation/Architecture/DESIGN_GUIDE.md) pour les conventions de code et les standards.

## 📄 Licence

À définir - Tous droits réservés

## 👤 Auteur

**Créé par :** Snowzy

## 🆘 Support

- 📖 [Documentation complète](./.claude/Documentation/README.md)
- 🐛 [Signaler un bug](https://github.com/snowzy50/olympusmdt/issues)
- 💡 [Proposer une fonctionnalité](https://github.com/snowzy50/olympusmdt/issues)

---

**🏛️ OlympusMDT** - Excellence en traçabilité des dispositifs médicaux
