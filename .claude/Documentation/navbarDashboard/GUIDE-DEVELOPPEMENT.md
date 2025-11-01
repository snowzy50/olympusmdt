# Guide de Développement - Dashboard OlympusMDT

**Créé par:** Snowzy
**Date:** 2025-01-20

---

## 🚀 Démarrage Rapide

### Installation et Lancement

```bash
# Installation des dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev

# Le dashboard est accessible sur http://localhost:3000 (ou 3001 si port occupé)
```

---

## 📚 Structure du Projet

```
olympusmdt/
├── app/
│   ├── dashboard/           # Pages du dashboard
│   │   ├── page.tsx        # Page d'accueil ✅
│   │   ├── complaints/     # Page plaintes (à créer)
│   │   ├── equipment/      # Page équipements (à créer)
│   │   ├── summons/        # Page convocations (à créer)
│   │   ├── active-cases/   # Page dossiers actifs (à créer)
│   │   └── ...
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     # Navigation principale ✅
│   │   └── DashboardPage.tsx
│   ├── dashboard/
│   │   └── AgencyDashboard.tsx
│   └── ui/                 # Composants réutilisables
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── ...
├── services/
│   └── realtimeSync.ts     # Service de synchronisation ✅
├── hooks/
│   └── useRealtimeSync.ts  # Hooks React personnalisés ✅
└── .claude/
    └── Documentation/
        └── navbarDashboard/
            ├── IMPLEMENTATION.md      ✅
            └── GUIDE-DEVELOPPEMENT.md ✅
```

---

## 🛠️ Créer une Nouvelle Page

### Étape 1: Créer le Dossier et Fichier

```bash
# Exemple pour la page Plaintes
mkdir -p app/dashboard/complaints
touch app/dashboard/complaints/page.tsx
```

### Étape 2: Code de Base

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { AlertTriangle, Search, Plus, Filter } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'review' | 'resolved' | 'dismissed' | 'escalated';
  complainant: {
    name: string;
    id: string;
  };
  accused: {
    name: string;
    badge: string;
  };
  investigator?: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintsPage() {
  const { data: complaints, addItem, updateItem } = useRealtimeSync<Complaint>('complaints');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtrage
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complainant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.accused.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    investigating: complaints.filter(c => c.status === 'investigating').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    high: complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length,
    ia: complaints.filter(c => c.category === 'excessive_force' || c.category === 'corruption').length,
  }), [complaints]);

  return (
    <div className="flex-1 overflow-y-auto bg-dark-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Plaintes</h1>
                <p className="text-gray-400">Gestion des plaintes citoyennes</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Plainte
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={AlertTriangle} color="gray" />
          <StatCard title="En attente" value={stats.pending} icon={AlertTriangle} color="yellow" />
          <StatCard title="En enquête" value={stats.investigating} icon={AlertTriangle} color="blue" />
          <StatCard title="Résolues" value={stats.resolved} icon={AlertTriangle} color="green" />
          <StatCard title="Priorité élevée" value={stats.high} icon={AlertTriangle} color="red" />
          <StatCard title="Affaires Internes" value={stats.ia} icon={AlertTriangle} color="purple" />
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par ID, titre, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="investigating">En enquête</option>
            <option value="review">En révision</option>
            <option value="resolved">Résolue</option>
            <option value="dismissed">Classée</option>
            <option value="escalated">Escaladée</option>
          </select>
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-5 h-5" />
            <span>{filteredComplaints.length} plaintes trouvées</span>
          </div>
        </div>

        {/* Liste des plaintes */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plainte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plaignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Accusé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{complaint.id}</p>
                      <p className="text-gray-400 text-sm">{complaint.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{complaint.complainant.name}</td>
                  <td className="px-6 py-4 text-white">{complaint.accused.name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-400 hover:text-primary-300">
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Composant Stats Card
function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    gray: 'bg-gray-600',
    yellow: 'bg-yellow-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// Composant Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    investigating: 'bg-blue-500/20 text-blue-400',
    review: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
    escalated: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

// Composant Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
      {priority}
    </span>
  );
}
```

### Étape 3: Ajouter des Données de Test

```typescript
// Dans la console du navigateur ou dans un useEffect
const testData = [
  {
    title: "Usage excessif de la force",
    category: "excessive_force",
    priority: "high",
    status: "investigating",
    complainant: {
      name: "Jean Dupont",
      id: "CIT-789456"
    },
    accused: {
      name: "Officier M. Johnson",
      badge: "Badge 247"
    },
    investigator: "Lt. Rodriguez",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Utiliser addItem dans votre composant
testData.forEach(item => addItem(item));
```

---

## 🎨 Composants UI Réutilisables

### Créer un Composant Button Amélioré

```tsx
// components/ui/Button.tsx
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}
```

### Créer un Composant Modal

```tsx
// components/ui/Modal.tsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-gray-800 rounded-lg shadow-2xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Utilisation du Service RealtimeSync

### Méthodes Principales

```typescript
import realtimeSync from '@/services/realtimeSync';

// Récupérer toutes les données
const complaints = realtimeSync.getData('complaints');

// Ajouter un item
realtimeSync.addItem('complaints', {
  title: "Nouvelle plainte",
  status: "pending",
  // ... autres champs
});

// Modifier un item
realtimeSync.updateItem('complaints', 'CPL-2025-001', {
  status: "investigating"
});

// Supprimer un item
realtimeSync.deleteItem('complaints', 'CPL-2025-001');

// S'abonner aux changements
const unsubscribe = realtimeSync.subscribe('complaints', (payload) => {
  console.log('Nouvelles données:', payload.data);
});

// Se désabonner
unsubscribe();

// Statistiques
const stats = realtimeSync.stats('complaints');
console.log(stats); // { total: 15, recent: 3 }

// Debug
realtimeSync.debug(); // Affiche toutes les infos dans la console
```

### Utilisation avec React Hooks

```typescript
import { useRealtimeSync, useGlobalSync } from '@/hooks/useRealtimeSync';

function MyComponent() {
  // Hook principal avec CRUD
  const { data, isLoading, addItem, updateItem, deleteItem } = useRealtimeSync('complaints');

  // Hook stats globales
  const { total, new: newItems, modified, recent } = useGlobalSync();

  // ... votre logique
}
```

---

## 📝 Checklist pour une Nouvelle Page

- [ ] Créer le dossier `app/dashboard/[page]/`
- [ ] Créer le fichier `page.tsx`
- [ ] Définir l'interface TypeScript des données
- [ ] Utiliser `useRealtimeSync` avec le bon type
- [ ] Implémenter les filtres (search, status, etc.)
- [ ] Créer les cards de statistiques
- [ ] Créer la table/liste d'affichage
- [ ] Ajouter le modal de création
- [ ] Ajouter le modal de détails
- [ ] Implémenter les actions (modifier, supprimer, etc.)
- [ ] Ajouter des données de test
- [ ] Tester la synchronisation multi-tab
- [ ] Vérifier le responsive design
- [ ] Optimiser les performances (useMemo, useCallback)

---

## 🧪 Tests et Debug

### Console Debug

```javascript
// Dans la console du navigateur
window.mdtSync.debug()  // Voir toutes les infos
window.mdtSync.getData('complaints')  // Voir les données
window.mdtSync.clearAll()  // Nettoyer toutes les données
```

### Test Multi-Tab

1. Ouvrir l'application dans 2 onglets différents
2. Modifier une donnée dans l'onglet 1
3. Vérifier que l'onglet 2 se met à jour automatiquement

### localStorage Inspection

Chrome DevTools → Application → Storage → Local Storage → localhost

---

## 🎯 Prochaines Étapes Recommandées

1. **Créer la page Plaintes complète**
   - Formulaire de création
   - Modal de détails
   - Actions (assigner, transférer, archiver)
   - Impression/export

2. **Créer la page Équipements**
   - Inventaires par agence
   - Système de réservation
   - Suivi de condition

3. **Créer la page Convocations**
   - Formulaire juridique
   - Export PDF officiel
   - Suivi de signification

4. **Créer la page Mes Dossiers**
   - Upload de fichiers
   - Visualiseur intégré
   - Système de tâches

5. **Améliorer les composants UI**
   - Plus de variants de Button
   - Input, Select, Textarea personnalisés
   - Toast notifications

6. **Migration vers Supabase**
   - Setup Supabase project
   - Créer les tables
   - Implémenter RLS
   - Migrer realtimeSync vers Supabase Realtime

---

**Fin du guide** - Créé par Snowzy
