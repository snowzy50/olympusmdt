# Guide d'utilisation - Design System OlympusMDT

**Créé par:** Snowzy
**Date:** 2025-11-01
**Public:** Développeurs Frontend

---

## Table des matières

1. [Démarrage rapide](#démarrage-rapide)
2. [Guide des composants](#guide-des-composants)
3. [Patterns courants](#patterns-courants)
4. [Exemples pratiques](#exemples-pratiques)
5. [Bonnes pratiques](#bonnes-pratiques)

---

## Démarrage rapide

### Installation

Le design system est déjà configuré. Pour commencer à l'utiliser :

```bash
# Lancer le serveur de développement
npm run dev

# Accéder à la page de démonstration
http://localhost:3001/demo
```

### Import des composants

```tsx
// Import groupé (recommandé)
import { Button, Card, Input, Badge } from '@/components/ui';

// Import individuel
import Button from '@/components/ui/Button';
import Sidebar from '@/components/layout/Sidebar';
```

---

## Guide des composants

### 1. Button - Bouton

#### Variantes disponibles

```tsx
// Bouton primaire - Action principale
<Button variant="primary">
  Enregistrer
</Button>

// Bouton secondaire - Action secondaire
<Button variant="secondary">
  Annuler
</Button>

// Bouton fantôme - Action légère
<Button variant="ghost">
  Modifier
</Button>

// Bouton destructif - Action dangereuse
<Button variant="destructive">
  Supprimer
</Button>
```

#### Tailles

```tsx
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>   {/* Par défaut */}
<Button size="lg">Grand</Button>
```

#### Avec icônes

```tsx
import { Plus, Save, Trash2 } from 'lucide-react';

// Icône à gauche
<Button variant="primary" icon={Plus} iconPosition="left">
  Créer
</Button>

// Icône à droite
<Button variant="primary" icon={Save} iconPosition="right">
  Enregistrer
</Button>
```

#### État loading

```tsx
<Button variant="primary" loading>
  Chargement...
</Button>
```

#### État disabled

```tsx
<Button variant="primary" disabled>
  Non disponible
</Button>
```

---

### 2. Card - Carte

#### Variantes

```tsx
// Carte standard
<Card>
  <h3>Titre</h3>
  <p>Contenu...</p>
</Card>

// Carte élevée (plus d'ombre)
<Card variant="elevated">
  <h3>Contenu important</h3>
</Card>

// Carte plate (minimaliste)
<Card variant="flat">
  <p>Liste simple</p>
</Card>

// Carte interactive (cliquable)
<Card variant="interactive" onClick={handleClick}>
  <h3>Cliquez-moi</h3>
</Card>
```

#### Avec contenu structuré

```tsx
<Card>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold text-gray-100">
      Cas #2024-001
    </h3>
    <Badge variant="warning">En attente</Badge>
  </div>

  <p className="text-gray-400 mb-4">
    Description du cas...
  </p>

  <div className="flex gap-2">
    <Button variant="ghost" size="sm">Voir</Button>
    <Button variant="ghost" size="sm">Modifier</Button>
  </div>
</Card>
```

---

### 3. Input - Champ de texte

#### Input basique

```tsx
<Input
  label="Nom de l'officier"
  placeholder="Entrez le nom..."
  helperText="Prénom et nom complet"
/>
```

#### Avec validation

```tsx
// État d'erreur
<Input
  label="Badge Number"
  placeholder="Ex: 1234"
  error="Ce champ est requis"
/>

// État de succès
<Input
  label="Email"
  type="email"
  placeholder="officer@sasp.gov"
  success="Email valide"
/>
```

#### Contrôlé avec React state

```tsx
const [name, setName] = useState('');

<Input
  label="Nom"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

### 4. Textarea - Zone de texte

```tsx
<Textarea
  label="Description du cas"
  placeholder="Entrez les détails..."
  rows={4}
  helperText="Soyez aussi détaillé que possible"
/>
```

---

### 5. Select - Menu déroulant

```tsx
<Select
  label="Agence"
  options={[
    { value: '', label: 'Sélectionner une agence...' },
    { value: 'sasp', label: 'San Andreas State Police' },
    { value: 'safd', label: 'Fire Department' },
    { value: 'samc', label: 'Medical Center' },
  ]}
  helperText="Sélectionnez votre agence"
/>
```

---

### 6. Badge - Badge de statut

#### Couleurs sémantiques

```tsx
<Badge variant="success">Approuvé</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="error">Rejeté</Badge>
<Badge variant="info">Nouveau</Badge>
<Badge variant="neutral">Inactif</Badge>
```

#### Mode outline

```tsx
<Badge variant="success" outline>Approuvé</Badge>
<Badge variant="error" outline>Critique</Badge>
```

---

## Patterns courants

### 1. Formulaire complet

```tsx
'use client';

import { useState } from 'react';
import { Button, Card, Input, Select, Badge } from '@/components/ui';

export default function CaseForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation et soumission
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Créer un nouveau cas
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre du cas"
          placeholder="Ex: Vol de véhicule"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <Textarea
          label="Description"
          placeholder="Détails de l'incident..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Select
          label="Priorité"
          options={[
            { value: '', label: 'Sélectionner...' },
            { value: 'low', label: 'Basse' },
            { value: 'medium', label: 'Moyenne' },
            { value: 'high', label: 'Haute' },
          ]}
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary">
            Créer le cas
          </Button>
          <Button type="button" variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

---

### 2. Liste avec cartes

```tsx
import { Card, Badge, Button } from '@/components/ui';
import { Eye, Edit, Trash2 } from 'lucide-react';

const cases = [
  { id: 1, title: 'Vol de véhicule', status: 'pending', date: '2024-11-01' },
  { id: 2, title: 'Accident routier', status: 'resolved', date: '2024-10-30' },
];

export default function CasesList() {
  return (
    <div className="space-y-4">
      {cases.map((case) => (
        <Card key={case.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-100">
                  {case.title}
                </h3>
                <Badge variant={case.status === 'resolved' ? 'success' : 'warning'}>
                  {case.status === 'resolved' ? 'Résolu' : 'En attente'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {case.date}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={Eye}>
                Voir
              </Button>
              <Button variant="ghost" size="sm" icon={Edit}>
                Modifier
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2}>
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

### 3. Stat Cards (Métriques)

```tsx
import { Card } from '@/components/ui';
import { TrendingUp, Users, FileText } from 'lucide-react';

export default function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-primary-100">Cas actifs</h4>
          <FileText className="w-5 h-5 text-primary-200" />
        </div>
        <p className="text-4xl font-bold text-white mb-1">27</p>
        <p className="text-xs text-primary-200">+3 cette semaine</p>
      </div>

      <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-success-50">Cas résolus</h4>
          <TrendingUp className="w-5 h-5 text-success-200" />
        </div>
        <p className="text-4xl font-bold text-white mb-1">156</p>
        <p className="text-xs text-success-200">+12 ce mois</p>
      </div>

      <div className="bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-warning-50">En attente</h4>
          <Users className="w-5 h-5 text-warning-200" />
        </div>
        <p className="text-4xl font-bold text-white mb-1">8</p>
        <p className="text-xs text-warning-200">Nécessite action</p>
      </div>
    </div>
  );
}
```

---

### 4. Page complète avec Sidebar

```tsx
import Sidebar from '@/components/layout/Sidebar';
import { Card, Button } from '@/components/ui';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-dark-200 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-dark-300 border-b border-gray-700 px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        </header>

        {/* Content */}
        <div className="px-8 py-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Bienvenue, Officier Smith
            </h2>
            <p className="text-gray-400">
              Aperçu de vos activités...
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
```

---

## Bonnes pratiques

### 1. Cohérence visuelle

✅ **BON** - Utiliser les composants du design system
```tsx
<Button variant="primary">Enregistrer</Button>
```

❌ **MAUVAIS** - Créer des boutons personnalisés
```tsx
<button className="bg-blue-500 px-4 py-2">Enregistrer</button>
```

---

### 2. Accessibilité

✅ **BON** - Utiliser les labels
```tsx
<Input
  label="Email"
  id="email-input"
  aria-describedby="email-helper"
/>
```

❌ **MAUVAIS** - Input sans label
```tsx
<input placeholder="Email" />
```

---

### 3. États de validation

✅ **BON** - Afficher les erreurs clairement
```tsx
<Input
  label="Badge Number"
  error="Le badge doit contenir 4 chiffres"
/>
```

❌ **MAUVAIS** - Pas de feedback visuel
```tsx
<Input label="Badge Number" />
{/* L'utilisateur ne sait pas ce qui ne va pas */}
```

---

### 4. Responsive design

✅ **BON** - Grilles responsive
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
</div>
```

❌ **MAUVAIS** - Largeur fixe
```tsx
<div className="w-[800px]">
  <Card>...</Card>
</div>
```

---

### 5. Gestion des états

✅ **BON** - États loading et disabled
```tsx
<Button variant="primary" loading={isSubmitting}>
  {isSubmitting ? 'Envoi...' : 'Envoyer'}
</Button>
```

❌ **MAUVAIS** - Pas de feedback
```tsx
<Button variant="primary" onClick={handleSubmit}>
  Envoyer
</Button>
```

---

## Palette de couleurs rapide

### Utilisation dans Tailwind

```tsx
// Texte
<p className="text-gray-100">Texte principal</p>
<p className="text-gray-400">Texte secondaire</p>
<p className="text-gray-500">Texte tertiaire</p>

// Arrière-plans
<div className="bg-dark-200">Fond principal</div>
<div className="bg-dark-100">Surface élevée</div>
<div className="bg-dark-300">Fond profond</div>

// Couleurs sémantiques
<div className="bg-primary-600">Primaire</div>
<div className="bg-success-600">Succès</div>
<div className="bg-warning-600">Avertissement</div>
<div className="bg-error-600">Erreur</div>
```

---

## Ressources

- **Design System complet:** `.claude/context/design-system.md`
- **Documentation technique:** `.claude/Documentation/Frontend-Implementation/01-implementation-design-system.md`
- **Page de démonstration:** `http://localhost:3001/demo`
- **Icônes:** [Lucide React](https://lucide.dev)

---

**Besoin d'aide ?**
Consultez les fichiers de composants dans `components/ui/` pour voir l'implémentation complète.

**Créé par Snowzy - 2025**
