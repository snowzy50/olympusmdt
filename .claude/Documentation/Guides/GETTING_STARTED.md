# 🚀 Guide de démarrage - OlympusMDT

## Bienvenue !

Vous avez maintenant une interface MDT premium avec un design glassmorphism/neomorphism moderne. Ce guide vous aidera à démarrer.

## ✅ Installation

Le projet est déjà configuré ! Les dépendances sont installées et le serveur de développement est prêt.

## 🎯 Lancer l'application

```bash
npm run dev
```

Puis ouvrez votre navigateur à l'adresse : **http://localhost:3000**

## 📱 Pages disponibles

### 1. Dashboard (/)
**URL** : http://localhost:3000

Le tableau de bord principal avec :
- ✨ Message de bienvenue personnalisé
- 📊 4 cartes de statistiques animées
- ⚡ 6 actions rapides avec effets au survol
- 📋 Activité récente
- 🚓 Unités actives
- 📈 Aperçu des performances

### 2. Rapports (/rapports)
**URL** : http://localhost:3000/rapports

Page de gestion des rapports avec :
- 📊 Statistiques des rapports (total, en attente, approuvés, rejetés)
- 🔍 Barre de recherche
- 🏷️ Filtres par statut
- 📄 Liste de rapports avec priorités colorées
- 🎨 Cards animées avec effets de survol

### 3. Planification (/planification)
**URL** : http://localhost:3000/planification

Système de planification avec :
- 📅 Calendrier hebdomadaire interactif
- 📊 Statistiques (shifts, officiers, heures)
- 🔄 Navigation semaine précédente/suivante
- 📋 Liste des shifts à venir avec filtres
- 👤 Mon planning personnel

## 🎨 Fonctionnalités du design

### Effets glassmorphism
- Fond flou avec `backdrop-blur`
- Transparence élégante
- Bordures subtiles
- Visible sur tous les conteneurs principaux

### Effets neomorphism
- Ombres doubles (internes/externes)
- Effet de relief 3D
- Utilisé pour les boutons et certains éléments

### Animations
- ✨ Fade-in au chargement des pages
- 🎯 Transformations au survol des cards
- 💫 Pulsation sur les badges de notification
- 🌟 Effets de glow sur les éléments actifs

### Interactivité
- 🎯 Sidebar collapsible (cliquer sur la flèche)
- 👤 Menu utilisateur déroulant (cliquer sur le profil)
- 📅 Navigation calendrier
- 🏷️ Filtres cliquables

## 🎨 Palette de couleurs

### Thème principal
- **Police Blue** (#2563eb) : Navigation, actions principales
- **Purple** (#8b5cf6) : Surveillance, formation
- **Cyan** (#06b6d4) : Informations
- **Green** (#10b981) : Succès, validations
- **Red** (#ef4444) : Alertes, dangers
- **Orange** (#f59e0b) : Avertissements

### Fonds sombres
- **Background** : Très sombre (#020617)
- **Cards** : Glassmorphism avec transparence
- **Texte** : Blanc/gris clair pour contraste

## 🧪 Tester les fonctionnalités

### Sidebar
1. Cliquez sur l'icône de flèche en haut à droite de la sidebar
2. La sidebar se collapse, affichant uniquement les icônes
3. Cliquez sur la flèche inverse pour la réouvrir

### Navigation
1. Cliquez sur "Rapports" dans la sidebar
2. Observez l'effet de transition
3. La page des rapports s'affiche
4. Notez l'élément actif en bleu dans la sidebar

### Survol des cards
1. Passez votre souris sur une card de statistique
2. La card se soulève légèrement
3. Une ombre bleue apparaît
4. Transition fluide

### Menu utilisateur
1. Cliquez sur votre profil en haut à droite
2. Menu déroulant avec options
3. Badge "En service" vert
4. Options de profil et déconnexion

### Actions rapides
1. Passez la souris sur une action rapide
2. L'icône s'agrandit
3. Fond coloré apparaît subtilement
4. Animation fluide

## 📂 Structure du code

```
app/
├── page.tsx              # Dashboard principal
├── rapports/
│   └── page.tsx          # Page des rapports
├── planification/
│   └── page.tsx          # Page de planification
├── layout.tsx            # Layout racine
└── globals.css           # Styles globaux

components/
├── layout/
│   ├── MainLayout.tsx    # Layout avec sidebar + header
│   ├── Sidebar.tsx       # Navigation latérale
│   └── Header.tsx        # En-tête avec recherche
├── ui/
│   ├── StatCard.tsx      # Card de statistique
│   └── Button.tsx        # Bouton réutilisable
├── dashboard/
│   ├── QuickActions.tsx
│   ├── RecentActivity.tsx
│   └── ActiveUnits.tsx
├── reports/
│   └── ReportCard.tsx
└── planning/
    └── ShiftCard.tsx
```

## 🎓 Personnalisation

### Changer les couleurs

Éditez `tailwind.config.ts` :

```typescript
colors: {
  police: {
    blue: '#VOTRE_COULEUR',
  },
}
```

### Ajouter une nouvelle page

1. Créez `app/nouvelle-page/page.tsx`
2. Ajoutez l'entrée dans `components/layout/Sidebar.tsx`
3. Importez `MainLayout` dans votre page

### Créer un nouveau composant

1. Créez le fichier dans `components/`
2. Utilisez les classes `glass` ou `neo` pour le style
3. Ajoutez des animations avec `framer-motion`

## 🐛 Debugging

### Le serveur ne démarre pas
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreurs TypeScript
```bash
# Vérifier les types
npm run build
```

### Styles ne s'appliquent pas
```bash
# Vérifier que Tailwind compile
# Redémarrer le serveur
```

## 📝 Prochaines étapes

1. **Backend** : Implémenter une API (voir ROADMAP.md)
2. **Auth** : Ajouter un système de connexion
3. **Base de données** : Connecter une DB pour données réelles
4. **Pages supplémentaires** : Personnel, Recherche, etc.

## 🆘 Besoin d'aide ?

### Documentation
- `README.md` : Vue d'ensemble du projet
- `DESIGN_GUIDE.md` : Guide de style et composants
- `ROADMAP.md` : Fonctionnalités futures

### Technologies
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## 💡 Conseils

1. **Explorez le code** : Chaque composant est bien commenté
2. **Testez les animations** : Passez la souris partout !
3. **Adaptez à vos besoins** : Modifiez les données mockées
4. **Gardez la cohérence** : Suivez le DESIGN_GUIDE.md

## 🎉 Amusez-vous bien !

Vous avez maintenant une base solide pour créer un MDT premium. Le design est moderne, professionnel et entièrement personnalisable.

**Bon développement ! 🚔**

---

Pour toute question, consultez la documentation ou examinez les composants existants pour voir comment ils sont construits.
