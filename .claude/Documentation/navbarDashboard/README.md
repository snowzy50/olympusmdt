# Documentation Branche navbarDashboard

**Créé par:** Snowzy
**Date:** 2025-01-20
**Version:** 0.18.6

---

## 📦 Contenu de cette Branche

Cette branche implémente la structure de base du dashboard MDT avec:

1. ✅ **Navigation Complète (Sidebar)**
   - 3 sections organisées : Navigation Principale, Patrouille, Dossiers
   - 15 liens de navigation vers toutes les pages
   - Mode collapsed/expanded
   - Footer avec indicateurs temps réel et version

2. ✅ **Service de Synchronisation Temps Réel**
   - Pattern Singleton pour gestion globale des données
   - Cache en mémoire + localStorage
   - Pub/Sub pour réactivité
   - Synchronisation multi-tab automatique
   - Support de 7 types de données

3. ✅ **Hooks React Personnalisés**
   - `useRealtimeSync` - Hook CRUD complet
   - `useGlobalSync` - Statistiques globales
   - `useRealtimeSubscription` - Abonnement simple

4. ✅ **Documentation Technique Complète**
   - Guide d'implémentation
   - Guide de développement
   - Templates et exemples de code

---

## 📂 Fichiers Créés

```
olympusmdt/
├── services/
│   └── realtimeSync.ts          ✅ Service de synchronisation
├── hooks/
│   └── useRealtimeSync.ts       ✅ Hooks React
├── components/layout/
│   └── Sidebar.tsx              ✅ Navigation mise à jour
└── .claude/Documentation/navbarDashboard/
    ├── README.md                ✅ Ce fichier
    ├── IMPLEMENTATION.md        ✅ Guide technique détaillé
    └── GUIDE-DEVELOPPEMENT.md   ✅ Guide pratique dev
```

---

## 🚀 Utilisation Rapide

### Démarrer le Projet

```bash
npm run dev
```

Ouvrir http://localhost:3000

### Créer une Nouvelle Page

1. Créer le dossier: `app/dashboard/[nom-page]/`
2. Créer le fichier: `page.tsx`
3. Copier le template depuis `GUIDE-DEVELOPPEMENT.md`
4. Adapter selon vos besoins
5. Utiliser `useRealtimeSync` pour gérer les données

### Exemple Minimal

```tsx
'use client';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function MyPage() {
  const { data, addItem, updateItem } = useRealtimeSync('myType');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white">Ma Page</h1>
      {data.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Documentation Détaillée

### Fichiers de Documentation

1. **IMPLEMENTATION.md**
   - Architecture technique du service RealtimeSync
   - Structure de la navigation
   - Liste des pages à implémenter
   - Limitations et améliorations futures
   - Références techniques

2. **GUIDE-DEVELOPPEMENT.md**
   - Guide de démarrage rapide
   - Templates de code complets
   - Exemples de composants UI
   - Checklist de développement
   - Tests et debug

---

## 🎯 Prochaines Étapes

### Pages Prioritaires à Créer

1. **Plaintes** (`/dashboard/complaints`)
   - Formulaire de création avec 4 sections
   - Filtres par statut, priorité, catégorie
   - Modal détails avec actions
   - Export CSV et impression
   - 6 cards de statistiques

2. **Équipements** (`/dashboard/equipment`)
   - Inventaires différenciés par agence
   - Système de réservation
   - Suivi de condition (0-100%)
   - Niveaux d'accès pour armes
   - Maintenance préventive

3. **Convocations** (`/dashboard/summons`)
   - Formulaire juridique complet
   - 5 types de convocations
   - Suivi de signification
   - Export PDF officiel
   - Simulation temps réel

4. **Mes Dossiers** (`/dashboard/active-cases`)
   - Upload multi-fichiers
   - Visualiseur intégré (PDF, images, vidéos, Office)
   - Système de tâches avec checkboxes
   - Calcul progression automatique
   - Gestion témoins et suspects

### Composants UI à Créer

- [ ] Modal avancé avec variantes
- [ ] Input, Select, Textarea personnalisés
- [ ] Toast/Notification system
- [ ] Table avec tri et pagination
- [ ] DatePicker et TimePicker
- [ ] FileUploader avec preview
- [ ] Tabs component
- [ ] Accordion/Collapse

### Améliorations Techniques

- [ ] Migration vers Supabase
- [ ] WebSockets pour sync multi-utilisateurs
- [ ] Authentification Discord OAuth2
- [ ] Permissions basées sur rôles
- [ ] Pagination des listes
- [ ] Upload fichiers vers Supabase Storage
- [ ] Export Excel/PDF avancé
- [ ] Mode hors-ligne avec sync

---

## 🛠️ Technologies Utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icônes modernes
- **localStorage** - Persistence côté client

---

## 🔗 Liens Utiles

### Documentation Interne

- [Guide d'implémentation](./IMPLEMENTATION.md)
- [Guide de développement](./GUIDE-DEVELOPPEMENT.md)

### Code Source Principal

- [Service RealtimeSync](../../services/realtimeSync.ts)
- [Hooks React](../../hooks/useRealtimeSync.ts)
- [Sidebar](../../components/layout/Sidebar.tsx)

### Documentation Externe

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Notes de Développement

### Conventions de Code

- **Nommage des fichiers:** PascalCase pour composants (`Button.tsx`)
- **Nommage des types:** PascalCase avec interfaces (`interface User {}`)
- **Nommage des hooks:** camelCase avec préfixe `use` (`useRealtimeSync`)
- **Nommage des services:** camelCase (`realtimeSync`)

### Structure de Données

Toutes les données gérées par RealtimeSync ont:
- `id`: string (généré automatiquement)
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)

### Patterns Recommandés

- **useMemo** pour optimiser les filtres et calculs
- **useCallback** pour les fonctions passées en props
- **Custom hooks** pour la réutilisabilité
- **Composants purs** quand possible

---

## ⚠️ Avertissements Importants

### Limitations Actuelles

1. **Pas de backend réel**
   - Toutes les données sont en localStorage
   - Perdu au clear du navigateur
   - Vulnérable à manipulation côté client

2. **Quota localStorage**
   - Limite ~5-10 MB selon navigateur
   - Pas de gestion d'overflow

3. **Pas de synchronisation multi-utilisateurs**
   - Uniquement multi-tab local
   - Nécessite backend + WebSockets pour vrai temps réel

4. **Performances**
   - Toutes les données chargées en mémoire
   - Pas de pagination
   - Dégradation si >1000 items

### Recommandations Sécurité

- Ne JAMAIS stocker de mots de passe en localStorage
- Ne JAMAIS stocker de tokens d'auth en clair
- Toujours valider les données côté serveur
- Implémenter RLS (Row Level Security) avec Supabase

---

## 🐛 Troubleshooting

### Le serveur ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur "localStorage is not defined"

C'est normal côté serveur (SSR). Toujours utiliser:

```tsx
if (typeof window !== 'undefined') {
  // Code utilisant localStorage
}
```

### Les données ne se synchronisent pas

1. Vérifier la console pour erreurs
2. Ouvrir DevTools → Application → Local Storage
3. Vérifier que les clés `mdt_*` existent
4. Essayer `window.mdtSync.debug()` dans la console

### Les icônes ne s'affichent pas

Vérifier l'import:

```tsx
import { Icon } from 'lucide-react';  // ✅ Correct
import Icon from 'lucide-react';      // ❌ Incorrect
```

---

## 📞 Support

Pour toute question ou problème:

1. Consulter la documentation technique: `IMPLEMENTATION.md`
2. Consulter le guide de dev: `GUIDE-DEVELOPPEMENT.md`
3. Vérifier les examples de code fournis
4. Utiliser `window.mdtSync.debug()` pour debug

---

## 📜 Historique des Changements

### Version 0.18.6 (2025-01-20)

- ✅ Implémentation navigation complète (Sidebar)
- ✅ Création service RealtimeSync
- ✅ Création hooks React personnalisés
- ✅ Documentation technique complète
- ✅ Guide de développement avec exemples
- ✅ Templates de code prêts à l'emploi

---

**Créé par Snowzy - 2025**
