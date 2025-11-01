# Tests Unitaires - OlympusMDT

**Créé par:** Snowzy
**Date:** 2025-11-01
**Framework:** Next.js 14 + Jest + React Testing Library

---

## 📋 Structure des Tests

Les tests sont organisés par feature dans des sous-dossiers numérotés :

```
.claude/TestUnitaire/
├── README.md                          # Ce fichier
├── 01-Login/                          # Tests de la page de connexion
├── 02-AgencySelection/                # Tests de sélection d'agence
├── 03-Dashboard/                      # Tests du dashboard
├── 04-ComposantsUI/                   # Tests des composants UI
└── 05-Navigation/                     # Tests de navigation et sidebar
```

---

## 🎯 Stratégie de Tests

### Principe
Chaque feature doit avoir ses tests unitaires **validés et passants** avant de passer à la suivante.

### Workflow
1. ✅ Créer les tests pour une feature
2. ✅ Exécuter les tests
3. ✅ Corriger jusqu'à ce que tous les tests passent
4. ✅ Documenter les résultats
5. ➡️ Passer à la feature suivante

---

## 🛠️ Technologies Utilisées

- **Jest** - Framework de tests
- **React Testing Library** - Tests de composants React
- **@testing-library/user-event** - Simulation d'interactions utilisateur
- **@testing-library/jest-dom** - Matchers personnalisés pour le DOM

---

## 📝 Conventions de Nommage

### Fichiers de tests
- `ComponentName.test.tsx` - Tests de composants
- `utils.test.ts` - Tests de fonctions utilitaires
- `hooks.test.ts` - Tests de hooks personnalisés

### Structure d'un test
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      // Test
    });
  });

  describe('Interactions', () => {
    it('should handle click events', () => {
      // Test
    });
  });

  describe('State Management', () => {
    it('should update state correctly', () => {
      // Test
    });
  });
});
```

---

## ✅ Checklist par Feature

### 01-Login
- [ ] Rendu de la page
- [ ] Bouton Discord présent
- [ ] Lien Admin présent
- [ ] Loading state lors du clic
- [ ] Redirection après connexion

### 02-AgencySelection
- [ ] Rendu des 5 agences
- [ ] Hover effects par couleur
- [ ] Sélection d'une agence
- [ ] Bordures colorées au hover
- [ ] Bouton "Accéder au Dashboard" après sélection

### 03-Dashboard
- [ ] Rendu du layout
- [ ] Header avec titre
- [ ] Stats affichées
- [ ] Navigation sidebar présente

### 04-ComposantsUI
- [ ] DashboardCard - toutes variantes
- [ ] StatusIndicator - tous types
- [ ] Button - toutes variantes
- [ ] Card - toutes variantes
- [ ] Badge - toutes couleurs

### 05-Navigation
- [ ] Sidebar collapsible
- [ ] Navigation items cliquables
- [ ] Active state sur route actuelle
- [ ] Badges de notification

---

## 🚀 Commandes

```bash
# Installer les dépendances de test (si nécessaire)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm test -- --watch

# Exécuter les tests d'une feature spécifique
npm test -- 01-Login

# Générer le rapport de couverture
npm test -- --coverage
```

---

## 📊 Résultats des Tests

### 01-Login
- **Status:** ✅ Validé
- **Tests:** 13/13 ✓
- **Couverture:** 100%
- **Détails:** Tous les tests passent (rendering, interactions, visual elements, accessibility)

### 02-AgencySelection
- **Status:** ✅ Validé
- **Tests:** 25/25 ✓
- **Couverture:** 100%
- **Détails:** Tous les tests passent (rendering, sélection, hover effects, states, accessibility)

### 03-Dashboard
- **Status:** ✅ Validé
- **Tests:** 27/27 ✓
- **Couverture:** 100%
- **Détails:** Tous les tests passent (rendering, cards, stats, cases, notifications, quick actions, layout, accessibility)

### 04-ComposantsUI
- **Status:** ⏳ En attente
- **Tests:** 0/15
- **Couverture:** N/A

### 05-Navigation
- **Status:** ⏳ En attente
- **Tests:** 0/8
- **Couverture:** N/A

---

**Créé par Snowzy - OlympusMDT v2.0**
