# Guide d'Utilisation - Calendrier des Événements

**Date**: 2025-11-01  
**Créé par**: Snowzy  
**Version**: 1.0

## Table des matières

1. [Accéder au calendrier](#accéder-au-calendrier)
2. [Créer un événement](#créer-un-événement)
3. [Modifier un événement](#modifier-un-événement)
4. [Supprimer un événement](#supprimer-un-événement)
5. [Filtrer et rechercher](#filtrer-et-rechercher)
6. [Affichage calendrier](#affichage-calendrier)
7. [FAQ](#faq)

---

## Accéder au calendrier

### URLs disponibles

Chaque agence a son propre calendrier:

**Police d'État (SASP)**:
```
https://votre-domaine.com/dashboard/sasp/events
```

**Services Médicaux (SAMC)**:
```
https://votre-domaine.com/dashboard/samc/events
```

**Pompiers (SAFD)**:
```
https://votre-domaine.com/dashboard/safd/events
```

**Immobilier (Dynasty 8)**:
```
https://votre-domaine.com/dashboard/dynasty8/events
```

**Justice (DOJ)**:
```
https://votre-domaine.com/dashboard/doj/events
```

**Vue globale** (tous les événements):
```
https://votre-domaine.com/dashboard/events
```

---

## Créer un événement

### Étape 1: Ouvrir le formulaire

1. Cliquez sur le bouton **"Nouvel Événement"** en haut à droite
2. Une modale s'ouvre avec le formulaire de création

### Étape 2: Remplir les informations obligatoires

**Titre** (requis):
- Entrez un titre court et descriptif
- Ex: "Briefing matinal", "Formation tir", "Réunion supervision"

**Catégorie** (requis):
- Choisissez une catégorie dans la liste déroulante:
  - **Patrouille** (Patrouilles régulières)
  - **Formation** (Formations et entraînements)
  - **Réunion** (Réunions de coordination)
  - **Opération** (Opérations spéciales)
  - **Maintenance** (Entretien du matériel)
  - **Tribunal** (Comparutions judiciaires)
  - **Personnel** (Événements personnels)
  - **Autre** (Catégorie par défaut)

**Date de début** (requis):
- Cliquez sur le champ et sélectionnez la date
- Format: YYYY-MM-DD

**Date de fin** (requis):
- Pour les événements multijournal, sélectionnez la date finale
- Par défaut: même jour que le début

### Étape 3: Remplir les informations optionnelles

**Description**:
- Détails supplémentaires sur l'événement
- Ex: "Recyclage annuel", "Audit technique"

**Lieu**:
- Endroit où se déroulera l'événement
- Ex: "Salle de briefing", "Stand de tir", "Palais de justice"

**Heure de début** et **Heure de fin**:
- Si non coché "Événement sur toute la journée"
- Format: HH:MM (24 heures)

**Événement sur toute la journée**:
- Cochez cette option pour les événements sans heure spécifique
- Exemples: congés, jours fériés, formations à la journée

### Étape 4: Valider

Cliquez sur **"Créer l'événement"** pour sauvegarder.

La modale se ferme et le calendrier est mis à jour automatiquement.

---

## Modifier un événement

### Méthode 1: Via le calendrier

1. Cliquez sur un événement dans le calendrier
2. La modale de détails s'ouvre
3. Cliquez sur le bouton **"Modifier"**
4. Le formulaire se remplit avec les données existantes
5. Modifiez les informations
6. Cliquez sur **"Modifier l'événement"**

### Méthode 2: Via la liste des événements à venir

1. Dans la section "Événements à venir", cliquez sur l'événement
2. La modale de détails s'ouvre
3. Procédez comme ci-dessus

### Champs modifiables

Tous les champs sont modifiables:
- Titre
- Description
- Catégorie
- Dates et heures
- Lieu
- Type "toute la journée"

Les modifications sont sauvegardées instantanément.

---

## Supprimer un événement

### Procédure

1. Cliquez sur un événement (calendrier ou liste)
2. La modale de détails s'ouvre
3. Cliquez sur le bouton **"Supprimer"** (rouge)
4. Une confirmation est demandée
5. Cliquez sur **"OK"** pour confirmer

L'événement est supprimé instantanément du calendrier.

---

## Filtrer et rechercher

### Filtrer par catégorie

1. Utilisez la liste déroulante **"Toutes catégories"** en haut du calendrier
2. Sélectionnez une catégorie pour afficher uniquement les événements de cette catégorie
3. Le calendrier se met à jour instantanément

### Rechercher par mot-clé

1. Utilisez le champ **"Rechercher..."** à droite du filtre de catégorie
2. Entrez un mot-clé (titre, description, lieu)
3. Seuls les événements correspondants sont affichés

### Combinaison filtres + recherche

Vous pouvez combiner les deux:
- Sélectionnez une catégorie
- Tapez un mot-clé dans la recherche
- Seuls les événements correspondant aux DEUX critères s'affichent

### Réinitialiser les filtres

- Vider la recherche (champ vide)
- Sélectionner "Toutes catégories" dans le dropdown

---

## Affichage calendrier

### Structure du calendrier

**En-têtes**: 
- Dim, Lun, Mar, Mer, Jeu, Ven, Sam

**Navigation**:
- Bouton **"<"** pour le mois précédent
- Bouton **"Aujourd'hui"** pour revenir à la date actuelle
- Bouton **">"** pour le mois suivant
- Le nom du mois et l'année s'affichent au centre

### Affichage des événements

**Sur chaque jour**:
- Le numéro du jour (en bleu si c'est aujourd'hui)
- Liste des événements (max 3 affichés)
- Un texte "+N de plus" si plus de 3 événements
- Heure de début ou symbole "🌐" pour "toute la journée"

### Couleurs par catégorie

| Catégorie | Couleur |
|-----------|---------|
| Patrouille | Bleu |
| Formation | Vert |
| Réunion | Violet |
| Opération | Rouge |
| Maintenance | Jaune |
| Tribunal | Indigo |
| Personnel | Rose |
| Autre | Gris |

### Légende

Une légende complète des couleurs s'affiche en bas du toolbar.

### Événements à venir

Sous le calendrier, une section **"Événements à venir"** affiche:
- Les 5 prochains événements
- Triés par date croissante
- Avec heure, lieu, et catégorie
- Cliquez sur un événement pour voir ses détails

---

## Comportement et synchronisation

### Sauvegarde automatique

- Les événements sont sauvegardés automatiquement dans votre navigateur
- Pas d'action "Enregistrer" nécessaire
- Les données persistent même après fermeture du navigateur

### Synchronisation multi-onglet

- Si vous ouvrez le calendrier dans plusieurs onglets
- Les modifications dans un onglet se reflètent dans les autres
- Rafraîchissement instantané

### Données de test

- Au premier accès, 4 événements de test sont créés
- Ces événements ont des dates futures
- Vous pouvez les modifier ou supprimer

---

## Informations stockées

### Ce qui est sauvegardé pour chaque événement

```typescript
{
  id: "EVE-2025-001",        // ID unique généré automatiquement
  title: "Briefing matinal",
  description: "Réunion quotidienne",
  startDate: "2025-11-01",
  endDate: "2025-11-01",
  startTime: "08:00",
  endTime: "08:30",
  category: "meeting",
  location: "Salle de briefing",
  attendees: ["Tous les agents"],
  createdBy: "Capitaine Johnson",
  isAllDay: false,
  recurrence: "none",
  createdAt: "2025-11-01T10:30:00Z",
  updatedAt: "2025-11-01T10:30:00Z"
}
```

### Limitations actuelles

- Maximum 3 événements affichés par jour (les autres sont comptés)
- Pas de récurrence automatique (champ présent mais non fonctionnel)
- Pas de notifications (fonctionnalité future)
- Pas d'intégration calendrier externe (iCal, Google Calendar) actuellement

---

## FAQ

### Q: Les données des événements sont-elles sauvegardées sur le serveur?

**R**: Non, actuellement les événements sont sauvegardés localement dans votre navigateur (localStorage). Cette implémentation permet de tester facilement sans serveur. Une intégration future avec Supabase permettra la persistence serveur et la synchronisation en temps réel.

### Q: Puis-je partager les événements avec d'autres utilisateurs?

**R**: Actuellement non, car les événements sont locaux au navigateur. Chaque navigateur/appareil a ses propres événements. Après migration vers Supabase, les événements pourront être partagés entre utilisateurs de la même agence.

### Q: Que se passe-t-il si j'efface les données de mon navigateur?

**R**: Tous les événements seront perdus car ils sont stockés en localStorage. Nous vous recommandons de ne pas vider le cache tant que les événements ne sont pas synchronisés avec Supabase.

### Q: Puis-je créer des événements récurrents?

**R**: Le champ existe mais la fonctionnalité n'est pas encore implémentée. Actuellement, créez les événements manuellement pour chaque occurrence.

### Q: Quel est le nombre maximum d'événements?

**R**: Théoriquement illimité, mais les performances peuvent se dégrader avec plus de 1000 événements. Pour une meilleure expérience, utilisez les filtres pour limiter l'affichage.

### Q: Les événements passés restent-ils visibles?

**R**: Oui, les événements passés restent dans le calendrier. Pour mieux gérer cela, utilisez la recherche et le filtrage.

### Q: Comment exporter les événements?

**R**: L'export n'est pas encore disponible. Fonctionnalité prévue: export en CSV, PDF, ou iCal.

### Q: Puis-je créer des événements sur d'autres agences?

**R**: Chaque calendrier est isolé par agence. Pour voir/créer des événements pour une autre agence, visitez son calendrier respectif.

### Q: Comment revenir au mois courant?

**R**: Cliquez sur le bouton **"Aujourd'hui"** dans le toolbar du calendrier.

### Q: Puis-je afficher une vue semaine ou jour?

**R**: Pas actuellement. La vue mensuelle est la seule disponible dans cette version. Les vues week et day sont en développement.

---

## Conseils d'utilisation

1. **Soyez spécifique**: Utilisez des titres clairs et une description détaillée
2. **Utilisez les catégories**: Aidez les autres à classifier rapidement les événements
3. **Indiquez le lieu**: Important pour les coordinations et les planifications
4. **Mettez à jour régulièrement**: Si les plans changent, modifiez l'événement
5. **Utilisez les filtres**: Pour trouver rapidement les événements pertinents
6. **Vérifiez les dates**: Les fuseaux horaires en localStorage ne sont pas gérés

---

## Support

Pour plus d'informations ou pour signaler des bugs:
- Consultez la documentation technique: `ARCHITECTURE-TECHNIQUE.md`
- Vérifiez les chemins des fichiers pour comprendre l'implémentation
- Ouvrez une issue sur le repository du projet

