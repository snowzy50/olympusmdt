# Guide d'utilisation - Dashboard

## Introduction

Le Dashboard est votre point de contrôle central pour surveiller l'ensemble de vos dispositifs médicaux et opérations de stérilisation.

## Accès au Dashboard

1. Ouvrez OlympusMDT dans votre navigateur
2. Le Dashboard s'affiche automatiquement sur la page d'accueil
3. Utilisez le menu latéral pour naviguer vers d'autres sections

## Sections du Dashboard

### 📊 Statistiques principales

En haut de la page, vous trouverez 4 cartes affichant :

#### Dispositifs actifs
- **Nombre total** de dispositifs médicaux en circulation
- Cliquez pour voir le détail

#### En stérilisation
- Nombre de dispositifs **actuellement en cours** de stérilisation
- Inclut toutes les phases du cycle

#### Conformes
- Dispositifs ayant **passé les contrôles** avec succès
- Taux de conformité affiché

#### Alertes
- Nombre d'**alertes actives** nécessitant une attention
- Code couleur selon la criticité

### 🏥 Unités actives

Cette section affiche toutes les unités médicales de votre établissement :

- **Nom de l'unité** avec code couleur
- **Statut** : Actif (vert) ou Inactif (gris)
- **Nombre de dispositifs** assignés à l'unité

**Exemple :**
```
🟢 Bloc Opératoire (24 dispositifs)
🟢 Urgences (18 dispositifs)
🟡 Réanimation (12 dispositifs)
```

### ⚡ Actions rapides

Accédez rapidement aux opérations courantes :

#### Nouveau Dispositif
- Ajouter un nouveau dispositif au système
- Enregistrer ses informations et sa traçabilité

#### Planifier Stérilisation
- Créer un nouveau cycle de stérilisation
- Assigner des dispositifs au cycle

#### Générer Rapport
- Créer un rapport de conformité
- Exporter les données

#### Voir Historique
- Consulter l'historique complet
- Filtrer par période ou unité

### 📋 Activité récente

Timeline chronologique des dernières opérations :

- **Type d'opération** (stérilisation, validation, alerte)
- **Dispositif concerné** avec son identifiant
- **Horodatage précis**
- **Statut** de l'opération

**Exemple :**
```
🔄 15:30 - Stérilisation du Dispositif #DM-12345
   Status: Terminé avec succès

✅ 14:15 - Validation du Dispositif #DM-12340
   Status: Conforme

⚠️ 13:00 - Alerte sur Dispositif #DM-12338
   Status: En attente d'intervention
```

## Navigation

### Menu latéral
- **Dashboard** : Vue d'ensemble (vous êtes ici)
- **Planification** : Gestion des cycles de stérilisation
- **Rapports** : Consultation et génération de rapports

### Menu supérieur
- **Recherche** : Trouver un dispositif ou une opération
- **Notifications** : Alertes et messages
- **Profil** : Paramètres du compte

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + K` | Recherche rapide |
| `Ctrl + N` | Nouveau dispositif |
| `Ctrl + P` | Planifier stérilisation |
| `Ctrl + R` | Rafraîchir les données |

## Mise à jour des données

Les données du Dashboard se rafraîchissent automatiquement toutes les 30 secondes. Pour forcer une mise à jour immédiate, cliquez sur l'icône de rafraîchissement en haut à droite.

## Filtres et personnalisation

### Filtrer les statistiques
1. Cliquez sur l'icône filtre 🔍
2. Sélectionnez la période (Aujourd'hui, Cette semaine, Ce mois)
3. Choisissez les unités à inclure
4. Appliquez les filtres

### Personnaliser l'affichage
1. Cliquez sur ⚙️ Paramètres
2. Section "Dashboard"
3. Activez/désactivez les widgets souhaités
4. Réorganisez par glisser-déposer

## Indicateurs visuels

### Codes couleurs des statuts
- 🟢 **Vert** : Opération réussie / Dispositif conforme
- 🟡 **Jaune** : En cours / Attention requise
- 🔴 **Rouge** : Erreur / Non conforme / Alerte critique
- ⚪ **Gris** : Inactif / Hors service

### Icônes
- ✅ Validation réussie
- ❌ Échec / Rejet
- 🔄 En cours de traitement
- ⚠️ Alerte / Attention
- 📋 Rapport généré
- 🔍 Inspection requise

## Résolution de problèmes

### Les statistiques ne se mettent pas à jour
1. Vérifiez votre connexion internet
2. Rafraîchissez la page (F5)
3. Videz le cache du navigateur

### Impossible de voir certaines unités
- Vérifiez vos permissions utilisateur
- Contactez l'administrateur si nécessaire

### Les actions rapides ne répondent pas
- Assurez-vous d'avoir les droits nécessaires
- Vérifiez qu'aucune opération n'est en cours

## Bonnes pratiques

✅ **À faire :**
- Consultez le Dashboard quotidiennement
- Traitez les alertes rapidement
- Vérifiez les statistiques de conformité
- Utilisez les actions rapides pour gagner du temps

❌ **À éviter :**
- Ne pas ignorer les alertes critiques
- Ne pas surcharger le système avec trop de filtres actifs
- Ne pas oublier de rafraîchir après une opération manuelle

## Support

Pour toute question ou problème :
- Consultez la documentation technique
- Contactez le support : support@olympusmdt.com
- Appelez le service IT : +33 1 XX XX XX XX

---

**Créé par :** Snowzy
**Version :** 1.0.0
**Dernière mise à jour :** 2025-11-01
