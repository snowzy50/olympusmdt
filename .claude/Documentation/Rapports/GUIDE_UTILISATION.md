# Guide d'utilisation - Rapports

## Introduction

Le module Rapports vous permet de générer, consulter et exporter des rapports de traçabilité et de conformité pour répondre aux exigences réglementaires et faciliter les audits.

## Accès au module

1. Depuis le Dashboard, cliquez sur **Rapports** dans le menu latéral
2. Vous arrivez sur la liste de vos rapports

## Types de rapports disponibles

### 📋 Traçabilité Dispositif

**Quand l'utiliser :**
- Besoin de l'historique complet d'un dispositif
- Audit ou inspection
- Enquête sur un incident

**Ce qu'il contient :**
- Fiche d'identité du dispositif
- Tous les cycles de stérilisation
- Résultats des contrôles
- Maintenance et réparations
- Déplacements entre unités
- Alertes et incidents

**Durée de génération :** 30 secondes - 2 minutes

### ✅ Conformité Cycle

**Quand l'utiliser :**
- Certification d'un cycle de stérilisation
- Validation pour libération des dispositifs
- Documentation réglementaire

**Ce qu'il contient :**
- Paramètres du cycle (température, pression, durée)
- Courbes graphiques
- Liste des dispositifs traités
- Résultats des contrôles
- Certificat de conformité signé

**Durée de génération :** 20-40 secondes

### 📊 Synthèse Mensuelle

**Quand l'utiliser :**
- Rapport de routine mensuel
- Présentation à la direction
- Suivi des indicateurs

**Ce qu'il contient :**
- Statistiques du mois
- Nombre de cycles par type
- Taux de conformité
- Performance des équipements
- Incidents et actions correctives
- Graphiques et tendances

**Durée de génération :** 1-3 minutes

### 🔍 Audit Complet

**Quand l'utiliser :**
- Préparation audit externe
- Inspection réglementaire
- Revue qualité annuelle

**Ce qu'il contient :**
- Conformité réglementaire complète
- Traçabilité de tous les dispositifs
- Documentation des équipements
- Formation des opérateurs
- Non-conformités et CAPA

**Durée de génération :** 5-15 minutes

### 🎨 Rapport Personnalisé

**Quand l'utiliser :**
- Besoin spécifique non couvert par les autres types
- Analyse particulière
- Export de données personnalisé

**Ce qu'il contient :**
- Sections que vous choisissez
- Filtres personnalisés
- Format adapté à vos besoins

**Durée de génération :** Variable

## Générer un rapport

### Méthode guidée (recommandée)

1. Cliquez sur **+ Nouveau rapport** en haut à droite
2. Choisissez le type de rapport dans les cards affichées
3. Suivez l'assistant pas à pas :

#### Étape 1 : Sélection du type
Cliquez sur le type souhaité. Une description détaillée s'affiche.

#### Étape 2 : Configuration

**Pour un rapport de Traçabilité Dispositif :**
- **Dispositif** : Sélectionnez ou scannez le code-barres
- **Période** : Choisissez la plage de dates
  - Dernière semaine
  - Dernier mois
  - Dernière année
  - Personnalisé
- **Options avancées** :
  - ☑️ Inclure les images
  - ☑️ Inclure les opérateurs
  - ☑️ Détail des contrôles

**Pour un rapport de Conformité Cycle :**
- **Cycle** : Recherchez par date ou ID
- **Type de certificat** :
  - Standard (1 page)
  - Détaillé (avec courbes et détails)
- **Options** :
  - ☑️ Inclure les graphiques
  - ☑️ Détail des dispositifs

**Pour une Synthèse Mensuelle :**
- **Mois et année** : Sélectionnez dans le calendrier
- **Unités** : Toutes ou sélection spécifique
- **Options** :
  - ☑️ Inclure les graphiques
  - ☑️ Statistiques par opérateur
  - ☑️ Comparaison avec mois précédent

**Pour un Audit :**
- **Période d'audit** : Date de début et fin
- **Type d'audit** :
  - Interne
  - Externe
  - Réglementaire
- **Périmètre** : Cochez les domaines à auditer
  - Dispositifs médicaux
  - Cycles de stérilisation
  - Maintenance équipements
  - Formation personnel
  - Non-conformités
- **Norme de référence** :
  - ISO 13485
  - ISO 17665
  - EN 285

#### Étape 3 : Format et options

**Format de sortie :**
- 📄 **PDF** : Pour impression et envoi (recommandé)
- 📊 **Excel** : Pour analyse et traitement
- 📋 **CSV** : Pour export vers d'autres systèmes

**Options de personnalisation :**
- Logo personnalisé
- En-tête/pied de page
- Langue (FR/EN)
- Niveau de détail

#### Étape 4 : Génération

1. Vérifiez le résumé de votre configuration
2. Cliquez sur **Générer le rapport**
3. Une barre de progression s'affiche
4. Vous recevez une notification à la fin

**Pendant la génération :**
- Vous pouvez continuer à travailler
- L'icône 🔔 affiche l'avancement
- Possibilité d'annuler

### Méthode rapide

Pour les utilisateurs expérimentés :

1. Depuis la liste des rapports, cliquez sur **Rapide**
2. Choisissez un template pré-configuré
3. Ajustez les dates si nécessaire
4. Générez immédiatement

## Consulter les rapports

### Liste des rapports

La liste affiche tous vos rapports avec :

| Colonne | Description |
|---------|-------------|
| **Titre** | Nom du rapport |
| **Type** | Badge coloré du type |
| **Créé le** | Date et heure de création |
| **Par** | Qui a généré le rapport |
| **Statut** | 🟢 Prêt / 🟡 En cours / 🔴 Erreur |
| **Format** | PDF, Excel ou CSV |
| **Taille** | Taille du fichier |
| **Actions** | Télécharger, Supprimer, etc. |

### Filtrer les rapports

Utilisez les filtres en haut de la liste :

**Filtre rapide :**
- Mes rapports
- Rapports récents (7 jours)
- Par type

**Filtres avancés :**
```
Type : [Tous] [Traçabilité] [Conformité] [Synthèse] [Audit] [Personnalisé]
Période : [Tous] [Aujourd'hui] [Cette semaine] [Ce mois] [Personnalisé]
Statut : [Tous] [Prêt] [En cours] [Erreur]
Format : [Tous] [PDF] [Excel] [CSV]
```

### Rechercher

Utilisez la barre de recherche pour trouver :
- Par titre de rapport
- Par dispositif (code)
- Par créateur
- Par contenu (recherche full-text)

**Exemple :** "DM-12345" trouve tous les rapports mentionnant ce dispositif.

### Trier

Cliquez sur les en-têtes de colonnes :
- Date (plus récent / plus ancien)
- Titre (A-Z / Z-A)
- Type
- Taille

## Actions sur les rapports

### 📥 Télécharger

**Méthode 1 :** Cliquez sur l'icône de téléchargement
**Méthode 2 :** Clic droit sur le rapport → Télécharger

Le fichier se télécharge dans votre dossier Téléchargements avec un nom descriptif :
```
OlympusMDT_Tracabilite_DM-12345_2025-11-01.pdf
```

### 👁️ Prévisualiser (PDF uniquement)

1. Cliquez sur l'icône œil 👁️
2. Le rapport s'ouvre dans une fenêtre modale
3. Naviguez dans le document :
   - Pagination en bas
   - Zoom : `+` / `-`
   - Rotation : icône rotation
   - Recherche : `Ctrl + F`
4. Téléchargez depuis la prévisualisation si souhaité

### 🔄 Régénérer

Utile si les données ont été mises à jour depuis :

1. Cliquez sur l'icône régénération 🔄
2. Confirmez l'action
3. Le rapport est recréé avec les données actuelles
4. L'ancien rapport est archivé

### 📤 Partager

1. Cliquez sur l'icône partage 📤
2. Choisissez le mode :

**Lien de téléchargement :**
- Génère un lien sécurisé
- Valide 7 jours
- Nécessite authentification

**Email :**
- Entrez les destinataires
- Ajoutez un message (optionnel)
- Le rapport est envoyé en pièce jointe

**Interne :**
- Partagez avec des utilisateurs OlympusMDT
- Ils reçoivent une notification

### 🗑️ Supprimer

⚠️ **Attention : action irréversible**

1. Cliquez sur l'icône poubelle 🗑️
2. Confirmez la suppression
3. Le rapport est définitivement supprimé

## Utiliser un template

Les templates sont des configurations prédéfinies pour générer rapidement des rapports récurrents.

### Créer un template

1. Générez un rapport avec votre configuration
2. Avant de générer, cochez ☑️ **Enregistrer comme template**
3. Donnez un nom : "Synthèse hebdomadaire Bloc Op"
4. Générez le rapport

Le template est sauvegardé et réutilisable.

### Utiliser un template

1. Cliquez sur **Templates** en haut
2. Sélectionnez le template souhaité
3. Ajustez les dates si nécessaire
4. Générez

### Partager un template

Les templates peuvent être :
- **Privés** : Seulement vous
- **Partagés** : Avec des utilisateurs spécifiques
- **Publics** : Toute l'organisation

## Exports multiples

### Télécharger plusieurs rapports

1. Cochez les rapports souhaités (cases à gauche)
2. Cliquez sur **Actions groupées** → **Télécharger**
3. Les rapports sont compressés dans un fichier ZIP
4. Le ZIP se télécharge automatiquement

### Supprimer plusieurs rapports

1. Sélectionnez les rapports
2. **Actions groupées** → **Supprimer**
3. Confirmez la suppression en masse

## Planifier des rapports

### Créer une planification

Pour générer automatiquement des rapports récurrents :

1. Allez dans **Paramètres** → **Planification des rapports**
2. Cliquez sur **+ Nouvelle planification**
3. Configurez :

**Rapport à générer :**
- Type ou template

**Fréquence :**
- Quotidien : à quelle heure
- Hebdomadaire : quel jour et heure
- Mensuel : quel jour du mois et heure

**Destinataires :**
- Vous (par défaut)
- Autres utilisateurs
- Emails externes

**Format :**
- PDF, Excel ou CSV

4. Activez la planification

### Gérer les planifications

- **Activer/Désactiver** : Toggle à gauche
- **Modifier** : Cliquez sur la planification
- **Supprimer** : Icône poubelle
- **Historique** : Voir tous les rapports générés

## Notifications

Vous recevez des notifications pour :

| Événement | Quand |
|-----------|-------|
| **Rapport prêt** | Génération terminée avec succès |
| **Erreur de génération** | La génération a échoué |
| **Rapport partagé** | Quelqu'un partage un rapport avec vous |
| **Rapport expirant** | 3 jours avant l'expiration (30j) |

**Configurer les notifications :**
- Profil → Notifications → Rapports
- Choisissez les canaux (app, email)

## Résolution de problèmes

### "Génération en erreur"

**Causes possibles :**
- Données introuvables (dispositif supprimé)
- Période invalide
- Trop de données à traiter

**Solutions :**
1. Vérifiez les paramètres
2. Réduisez la période
3. Essayez de régénérer
4. Contactez le support si persistant

### "Le téléchargement échoue"

**Solutions :**
- Vérifiez votre connexion internet
- Essayez avec un autre navigateur
- Videz le cache du navigateur
- Le rapport est peut-être expiré (30j)

### "Le rapport est vide"

**Causes :**
- Aucune donnée sur la période
- Filtres trop restrictifs
- Problème de permissions

**Solutions :**
- Élargissez la période
- Vérifiez les filtres
- Vérifiez que vous avez accès aux données

### "La prévisualisation ne fonctionne pas"

**Solutions :**
- Désactivez les bloqueurs de pop-ups
- Mettez à jour votre navigateur
- Essayez de télécharger directement

## Bonnes pratiques

### ✅ À faire

1. **Nommer clairement**
   - Utilisez des titres descriptifs
   - Incluez la date dans le nom
   - Mentionnez le contexte si nécessaire

2. **Organiser avec des templates**
   - Créez des templates pour les rapports récurrents
   - Partagez les templates utiles avec l'équipe

3. **Planifier les rapports routiniers**
   - Automatisez les synthèses mensuelles
   - Programmez les rapports de conformité

4. **Nettoyer régulièrement**
   - Supprimez les anciens rapports
   - Les rapports expirent automatiquement après 30j

5. **Sauvegarder les rapports importants**
   - Téléchargez les rapports d'audit
   - Archivez localement les rapports réglementaires

### ❌ À éviter

1. **Ne pas générer trop de rapports simultanément**
   - Maximum 3 en même temps
   - Attendez la fin avant d'en créer d'autres

2. **Ne pas partager de liens publics**
   - Utilisez toujours le partage sécurisé
   - Les liens expirent automatiquement

3. **Ne pas ignorer les erreurs**
   - Vérifiez pourquoi un rapport a échoué
   - Corrigez les paramètres si nécessaire

## Conformité et audit

### Pour les audits

**Préparez-vous :**
1. Générez un rapport d'audit complet
2. Préparez les rapports de conformité des cycles récents
3. Ayez les synthèses mensuelles disponibles
4. Vérifiez la traçabilité de quelques dispositifs critiques

**Documents requis :**
- Certificats de conformité des cycles
- Traçabilité des dispositifs critiques
- Rapports de non-conformité
- Actions correctives mises en place

### Signatures électroniques

Les rapports officiels (Conformité Cycle, Audit) incluent :
- Horodatage certifié
- Signature électronique de l'émetteur
- Numéro unique de rapport
- Hash du document pour vérifier l'intégrité

### Conservation

- Rapports en ligne : 30 jours
- Après expiration : téléchargez localement
- Archivage légal : selon réglementation (5-10 ans)
- Backup automatique disponible sur demande

## Support

Besoin d'aide ?
- 📖 Documentation technique complète
- 📧 support@olympusmdt.com
- ☎️ +33 1 XX XX XX XX
- 💬 Chat en direct (coin inférieur droit)
- 🎥 Vidéos tutoriels (Centre d'aide)

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `N` | Nouveau rapport |
| `R` | Rafraîchir la liste |
| `F` | Focus sur recherche |
| `Esc` | Fermer modal |
| `Ctrl + P` | Prévisualiser sélectionné |
| `Ctrl + D` | Télécharger sélectionné |
| `Delete` | Supprimer sélectionné |

---

**Créé par :** Snowzy
**Version :** 1.0.0
**Dernière mise à jour :** 2025-11-01
