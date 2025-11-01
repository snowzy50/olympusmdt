# Guide d'utilisation - Planification

## Introduction

Le module Planification vous permet de gérer efficacement les cycles de stérilisation de votre établissement. Organisez, suivez et optimisez vos opérations de stérilisation en quelques clics.

## Accès au module

1. Depuis le Dashboard, cliquez sur **Planification** dans le menu latéral
2. Vous arrivez sur la vue calendrier par défaut

## Vue Calendrier

### Modes d'affichage

Le calendrier propose trois modes de visualisation :

#### 📅 Vue Jour
- Affiche le planning horaire d'une journée (7h-19h)
- Idéal pour le suivi quotidien détaillé
- Créneaux de 30 minutes
- **Raccourci :** `D`

#### 📅 Vue Semaine
- Planning sur 7 jours
- Vue d'ensemble de la semaine en cours
- **Raccourci :** `W`

#### 📅 Vue Mois
- Aperçu mensuel
- Indicateurs de charge par jour
- **Raccourci :** `M`

### Navigation

| Action | Comment faire |
|--------|---------------|
| Jour suivant | Flèche droite `→` ou bouton `>` |
| Jour précédent | Flèche gauche `←` ou bouton `<` |
| Aujourd'hui | Bouton `Aujourd'hui` ou `T` |
| Date spécifique | Clic sur le calendrier en haut à droite |

## Créer un cycle de stérilisation

### Méthode rapide

1. **Double-cliquez** sur un créneau vide dans le calendrier
2. Le formulaire s'ouvre avec l'heure pré-remplie
3. Complétez les informations requises
4. Cliquez sur **Créer**

### Méthode détaillée

1. Cliquez sur le bouton **+ Nouveau cycle** en haut à droite
2. Remplissez le formulaire :

#### Informations générales
- **Titre** : Nom descriptif du cycle (ex: "Cycle Standard - Bloc 1")
- **Date et heure** : Quand débuter le cycle
- **Durée** : Estimation en minutes

#### Ressources
- **Autoclave** : Sélectionnez dans la liste des autoclaves disponibles
  - Une pastille verte indique la disponibilité
  - Une pastille rouge = non disponible sur ce créneau
- **Opérateur** : Technicien responsable du cycle

#### Type de cycle
Choisissez selon les dispositifs à stériliser :

| Type | Température | Durée | Usage |
|------|-------------|-------|-------|
| **Standard** | 134°C | 60-90 min | Instruments chirurgicaux classiques |
| **Prion** | 134°C | 18 min + 6 cycles | Instruments neurochirurgie |
| **Textiles** | 121°C | 30 min | Linges, blouses |
| **Flash** | 134°C | 3-10 min | Urgence uniquement |

#### Dispositifs
1. Cliquez sur **Ajouter des dispositifs**
2. Recherchez par code-barres, nom ou unité
3. Sélectionnez les dispositifs (max selon capacité autoclave)
4. Validez la sélection

La capacité restante s'affiche en temps réel :
```
Capacité utilisée: 45L / 120L (37%)
✅ Encore 75L disponibles
```

#### Notes (optionnel)
Ajoutez des observations particulières :
- Contrôles spécifiques requis
- Particularités des dispositifs
- Instructions pour l'opérateur

3. Cliquez sur **Créer le cycle**

### Validation automatique

Le système vérifie automatiquement :
- ✅ Disponibilité de l'autoclave
- ✅ Disponibilité de l'opérateur
- ✅ Capacité suffisante
- ✅ Pas de chevauchement

Si une erreur est détectée, un message vous guide pour la corriger.

## Gérer les cycles existants

### Voir les détails

**Méthode 1 :** Cliquez sur un cycle dans le calendrier
**Méthode 2 :** Depuis la liste, cliquez sur la ligne du cycle

Une fenêtre modale affiche :
- Toutes les informations du cycle
- Liste des dispositifs assignés
- Historique des événements
- Actions disponibles

### Modifier un cycle

1. Ouvrez les détails du cycle
2. Cliquez sur **Modifier** (icône crayon ✏️)
3. Effectuez vos modifications
4. **Enregistrer** ou **Annuler**

⚠️ **Attention :**
- Les cycles en cours ne peuvent pas être modifiés
- Les cycles terminés ne peuvent pas être modifiés

### Annuler un cycle

1. Ouvrez les détails du cycle
2. Cliquez sur **Annuler** (❌)
3. Confirmez l'annulation
4. Ajoutez une raison (optionnel mais recommandé)

Les dispositifs assignés redeviennent disponibles automatiquement.

### Démarrer un cycle

Quand l'heure du cycle arrive :

1. Ouvrez les détails du cycle
2. Cliquez sur **Démarrer** (▶️)
3. Confirmez que :
   - Tous les dispositifs sont chargés
   - L'autoclave est prêt
   - Les paramètres sont corrects
4. Le cycle démarre

Le statut passe à **En cours** 🟡

### Terminer un cycle

À la fin du cycle :

1. Ouvrez les détails du cycle
2. Cliquez sur **Terminer** (✅)
3. Renseignez les paramètres finaux :
   - Température atteinte
   - Pression
   - Résultat des contrôles
4. Validez

Le statut passe à **Terminé** 🟢

Si des anomalies sont détectées, le cycle peut être marqué **Échec** 🔴

## Liste des cycles

### Accéder à la liste

Cliquez sur l'onglet **Liste** en haut du module.

### Filtrer les cycles

Utilisez les filtres en haut de la liste :

| Filtre | Options |
|--------|---------|
| **Statut** | Tous, Planifié, En cours, Terminé, Échec, Annulé |
| **Date** | Aujourd'hui, Cette semaine, Ce mois, Personnalisé |
| **Autoclave** | Tous, AC-01, AC-02, etc. |
| **Opérateur** | Tous, Nom des opérateurs |

### Trier les cycles

Cliquez sur les en-têtes de colonnes pour trier :
- Date (ascendant/descendant)
- Statut
- Opérateur
- Autoclave

### Recherche

Utilisez la barre de recherche pour trouver rapidement :
- Par titre de cycle
- Par dispositif (code)
- Par opérateur

**Exemple :** Tapez "DM-12345" pour trouver tous les cycles contenant ce dispositif.

### Exporter

1. Sélectionnez les cycles à exporter (cochez les cases)
2. Cliquez sur **Exporter** 📥
3. Choisissez le format :
   - **Excel** (.xlsx) - pour analyse
   - **PDF** - pour impression
   - **CSV** - pour import ailleurs

## Statistiques et rapports

### Vue d'ensemble

En haut du module, un bandeau affiche :
- **Cycles aujourd'hui** : 8
- **En cours** : 2
- **Taux de réussite** : 98%
- **Temps moyen** : 87 min

### Rapport de planification

1. Cliquez sur **Rapports** dans le menu
2. Sélectionnez "Rapport de planification"
3. Choisissez la période
4. Générez le rapport

Le rapport inclut :
- Nombre total de cycles
- Répartition par type
- Taux d'utilisation des autoclaves
- Performance par opérateur
- Graphiques et tendances

## Gestion des conflits

### Détection automatique

Le système détecte et vous alerte en cas de :

#### 🔴 Conflit majeur (bloquant)
- Autoclave déjà réservé sur le créneau
- Opérateur déjà assigné
- Capacité dépassée

**Action :** Vous devez modifier le cycle

#### 🟡 Alerte (non bloquant)
- Opérateur avec trop de cycles ce jour
- Autoclave en fin de période avant maintenance
- Charge inhabituelle

**Action :** Vous pouvez continuer ou ajuster

### Résoudre un conflit

Le système propose automatiquement des alternatives :

```
❌ Impossible de créer le cycle

Conflit: Autoclave AC-01 déjà utilisé de 10h à 11h30

Suggestions :
1. ✅ Créneaum 12h-13h30 avec AC-01
2. ✅ Créneau 10h-11h30 avec AC-02
3. ✅ Créneau 14h-15h30 avec AC-01
```

Cliquez sur une suggestion pour l'appliquer directement.

## Notifications

### Types de notifications

Vous recevez des notifications pour :

| Événement | Quand |
|-----------|-------|
| **Cycle à démarrer** | 15 min avant l'heure prévue |
| **Cycle terminé** | Dès la fin du cycle |
| **Conflit détecté** | Lors de modifications |
| **Maintenance approche** | 3 jours avant |

### Gérer les notifications

1. Cliquez sur l'icône 🔔 en haut à droite
2. Consultez vos notifications
3. Cliquez pour voir le détail
4. Marquez comme lu ou snooze

**Paramètres :**
- Profil → Notifications → Planification
- Activez/désactivez par type
- Choisissez les canaux (app, email, SMS)

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `N` | Nouveau cycle |
| `D` | Vue Jour |
| `W` | Vue Semaine |
| `M` | Vue Mois |
| `T` | Aujourd'hui |
| `L` | Basculer vers Liste |
| `C` | Basculer vers Calendrier |
| `F` | Focus sur recherche |
| `Ctrl + S` | Enregistrer (formulaire) |
| `Esc` | Fermer modal/annuler |

## Bonnes pratiques

### ✅ À faire

1. **Planifier à l'avance**
   - Créez les cycles 24-48h avant
   - Anticipez les pics d'activité

2. **Optimiser les ressources**
   - Regroupez les dispositifs similaires
   - Utilisez la capacité maximale des autoclaves

3. **Documenter**
   - Ajoutez des notes pertinentes
   - Renseignez la raison des annulations

4. **Vérifier**
   - Contrôlez les conflits
   - Validez la disponibilité des opérateurs

### ❌ À éviter

1. **Ne pas surcharger**
   - Évitez trop de cycles consécutifs
   - Laissez du temps pour les imprévus

2. **Ne pas ignorer les alertes**
   - Les alertes de maintenance
   - Les avertissements de capacité

3. **Ne pas planifier sans disponibilité**
   - Vérifiez que les ressources sont libres
   - Confirmez avec les opérateurs

## Résolution de problèmes

### "Impossible de créer le cycle"

**Causes possibles :**
- Autoclave non disponible → Choisir un autre ou modifier l'heure
- Capacité dépassée → Réduire le nombre de dispositifs
- Opérateur déjà occupé → Choisir un autre opérateur

### "Le cycle ne démarre pas"

**Vérifications :**
1. L'heure de début est-elle passée ?
2. L'autoclave est-il disponible et prêt ?
3. Avez-vous les permissions ?

### "Les dispositifs n'apparaissent pas"

**Solutions :**
- Rafraîchir la page (F5)
- Vérifier qu'ils ne sont pas déjà assignés
- Vérifier leur statut (doivent être "prêts")

## Support

Besoin d'aide ?
- 📖 Consultez la documentation technique
- 📧 Contactez le support : support@olympusmdt.com
- ☎️ Appelez : +33 1 XX XX XX XX
- 💬 Chat en direct (coin inférieur droit)

---

**Créé par :** Snowzy
**Version :** 1.0.0
**Dernière mise à jour :** 2025-11-01
