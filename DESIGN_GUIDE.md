# 🎨 Guide de Design - OlympusMDT

## Philosophie de design

OlympusMDT suit une approche de design moderne combinant **glassmorphism** et **neomorphism** pour créer une interface premium et professionnelle adaptée aux forces de l'ordre.

## 🌈 Palette de couleurs

### Couleurs principales

```css
/* Backgrounds */
--dark-950: #020617     /* Background principal */
--dark-900: #0f172a     /* Background secondaire */
--dark-850: #172033     /* Éléments néomorphiques */
--dark-800: #1e293b
--dark-700: #334155

/* Police Blue - Couleur d'autorité */
--police-blue: #2563eb
--police-blue-light: #3b82f6
--police-blue-dark: #1e40af

/* Accents */
--accent-purple: #8b5cf6   /* Surveillance, formation */
--accent-cyan: #06b6d4     /* Information, données */
--accent-green: #10b981    /* Succès, validation */
--accent-red: #ef4444      /* Alertes, danger */
--accent-orange: #f59e0b   /* Attention, warning */
```

### Utilisation des couleurs

- **Police Blue** : Actions principales, navigation active, éléments interactifs
- **Purple** : Surveillance, formation, statistiques spéciales
- **Cyan** : Informations secondaires, données
- **Green** : Statuts positifs, confirmations, succès
- **Red** : Alertes, dangers, suppressions
- **Orange** : Avertissements, en attente

## 💎 Effets de verre (Glassmorphism)

### Classes disponibles

```css
.glass {
  backdrop-filter: blur(12px);
  background: linear-gradient(rgba(255,255,255,0.07), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.1);
}

.glass-strong {
  backdrop-filter: blur(24px);
  background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  border: 1px solid rgba(255,255,255,0.2);
}
```

### Quand utiliser

- **glass** : Cards, conteneurs secondaires, éléments flottants
- **glass-strong** : Sidebar, header, modales, éléments principaux

## 🔘 Effets néomorphiques (Neomorphism)

### Classes disponibles

```css
.neo {
  background: #172033;
  box-shadow: 10px 10px 20px rgba(0,0,0,0.5),
              -10px -10px 20px rgba(255,255,255,0.03);
}

.neo-inset {
  background: #172033;
  box-shadow: inset 5px 5px 10px rgba(0,0,0,0.5),
              inset -5px -5px 10px rgba(255,255,255,0.03);
}
```

### Quand utiliser

- **neo** : Boutons, inputs désactivés, éléments en relief
- **neo-inset** : Inputs actifs, zones de texte, éléments enfoncés

## ✨ Animations

### Transitions standards

```css
transition-all duration-200 ease-in-out
```

### Animations disponibles

```css
.animate-fade-in         /* Apparition douce */
.animate-slide-in        /* Glissement vers le haut */
.animate-pulse-slow      /* Pulsation lente */
.animate-glow            /* Effet de lueur */
```

### Hover effects

```css
.card-hover {
  /* Transform + shadow au survol */
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
```

## 📐 Espacement et bordures

### Arrondis

- **Cards/Containers** : `rounded-xl` (12px) ou `rounded-2xl` (16px)
- **Boutons** : `rounded-xl` (12px)
- **Badges** : `rounded-lg` (8px) ou `rounded-full`
- **Inputs** : `rounded-xl` (12px)

### Padding

- **Cards** : `p-6` (24px)
- **Sections** : `p-8` (32px)
- **Boutons** : `px-6 py-3` (24px horizontal, 12px vertical)

### Gaps

- **Grilles** : `gap-6` (24px) ou `gap-4` (16px)
- **Flex items** : `gap-3` (12px) ou `gap-2` (8px)

## 🔤 Typographie

### Hiérarchie

```css
h1: text-3xl font-bold       /* Titres de page */
h2: text-xl font-bold        /* Titres de section */
h3: text-lg font-semibold    /* Sous-titres */
p:  text-sm text-dark-400    /* Texte secondaire */
```

### Couleurs de texte

- **Primaire** : `text-white`
- **Secondaire** : `text-dark-300`
- **Tertiaire** : `text-dark-400` / `text-dark-500`
- **Gradient** : `text-gradient-blue` ou `text-gradient-purple`

## 🎯 Composants

### Boutons

```tsx
// Primaire
<button className="px-6 py-3 rounded-xl bg-gradient-to-r from-police-blue to-police-blue-light">

// Secondaire
<button className="px-6 py-3 rounded-xl glass-strong hover:glass">

// Danger
<button className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-red to-accent-orange">
```

### Cards

```tsx
<div className="glass rounded-2xl p-6 card-hover">
  {/* Contenu */}
</div>
```

### Badges de statut

```tsx
// Succès
<span className="px-3 py-1 rounded-lg bg-accent-green/20 text-accent-green">

// Warning
<span className="px-3 py-1 rounded-lg bg-accent-orange/20 text-accent-orange">

// Danger
<span className="px-3 py-1 rounded-lg bg-accent-red/20 text-accent-red">
```

### Inputs

```tsx
<input
  className="w-full px-4 py-3 bg-dark-900/50 border border-white/10 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-police-blue/50 focus:border-police-blue"
/>
```

## 🌟 Bonnes pratiques

### Cohérence

1. Utilisez toujours les classes personnalisées (`glass`, `neo`, etc.)
2. Respectez la palette de couleurs définie
3. Maintenez l'espacement cohérent
4. Utilisez les mêmes arrondis pour les éléments similaires

### Performance

1. Limitez les `backdrop-blur` aux éléments visibles
2. Utilisez `transform` plutôt que `position` pour les animations
3. Préférez `transition-all` pour la simplicité

### Accessibilité

1. Contraste minimum de 4.5:1 pour le texte
2. États de focus visibles
3. Tailles tactiles minimales de 44x44px

### Responsive

1. Mobile-first approach
2. Grid responsive avec `md:` et `lg:` breakpoints
3. Testez sur différentes tailles d'écran

## 📱 Breakpoints

```css
sm: 640px   /* Petits téléphones */
md: 768px   /* Tablettes */
lg: 1024px  /* Ordinateurs portables */
xl: 1280px  /* Grands écrans */
2xl: 1536px /* Très grands écrans */
```

## 🎭 États interactifs

### Hover

```css
hover:glass
hover:bg-white/5
hover:text-white
hover:shadow-lg
```

### Focus

```css
focus:outline-none
focus:ring-2
focus:ring-police-blue/50
focus:border-police-blue
```

### Disabled

```css
disabled:opacity-50
disabled:cursor-not-allowed
```

## 💡 Exemples de patterns

### Card avec icône et gradient

```tsx
<div className="glass rounded-xl p-6 card-hover">
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-police-blue to-accent-purple flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <h3 className="text-2xl font-bold text-white">24</h3>
  <p className="text-sm text-dark-400">Rapports aujourd'hui</p>
</div>
```

### Section avec header

```tsx
<div className="glass rounded-2xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-white">Titre</h2>
    <button className="text-sm text-police-blue hover:text-police-blue-light">
      Voir tout
    </button>
  </div>
  {/* Contenu */}
</div>
```

---

**Note** : Ce guide évoluera avec le projet. Référez-vous toujours à ce document lors de l'ajout de nouveaux composants.
