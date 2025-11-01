# Guide d'utilisation - Accès Admin

## Introduction

Ce guide explique comment utiliser le système d'accès admin pour Olympus MDT. L'accès admin permet de bypasser complètement l'authentification Discord et d'accéder à toutes les agences.

## Accéder à la page Admin

### Méthode 1: URL directe
1. Ouvrir votre navigateur
2. Accéder à: `http://localhost:3000/admin` (ou votre URL de production)

### Méthode 2: Depuis la page de connexion
1. Aller sur la page de connexion: `http://localhost:3000/login`
2. En bas du formulaire Discord, cliquer sur "Accès Admin"

## Se connecter

### Identifiants
- **Nom d'utilisateur**: `Admin`
- **Mot de passe**: `Admin123`

### Procédure de connexion
1. Entrer le nom d'utilisateur dans le champ "Nom d'utilisateur"
2. Entrer le mot de passe dans le champ "Mot de passe"
   - Le mot de passe est masqué par défaut (affiche `****`)
   - Cliquer sur l'icône œil pour afficher/masquer le mot de passe
3. Cliquer sur le bouton "Se connecter"
4. Vous serez automatiquement redirigé vers la page de sélection d'agence

## Après la connexion

### Sélection d'agence
Une fois connecté en tant qu'admin, vous avez accès à **toutes les agences**:
- LSPD (Los Santos Police Department)
- BCSO (Blaine County Sheriff's Office)
- SASP (San Andreas State Police)
- EMS (Emergency Medical Services)
- DOJ (Department of Justice)

### Navigation
- Cliquer sur n'importe quelle carte d'agence pour accéder à son dashboard
- Vous pouvez librement naviguer entre toutes les agences
- Aucune restriction d'accès n'est appliquée

## Interface Admin

### Page de connexion
L'interface admin se distingue de la connexion Discord:
- **Couleur thème**: Rouge/Orange (vs Bleu/Violet pour Discord)
- **Icône**: Shield (bouclier)
- **Titre**: "Admin Access"

### Champs du formulaire
1. **Nom d'utilisateur**
   - Placeholder: "Admin"
   - Type: Texte
   - Obligatoire

2. **Mot de passe**
   - Placeholder: "****"
   - Type: Password (masqué)
   - Toggle visibility disponible
   - Obligatoire

### Bouton de connexion
- Affiche "Se connecter" par défaut
- Affiche "Connexion en cours..." pendant le chargement
- Désactivé pendant la connexion

## Gestion des erreurs

### Identifiants incorrects
Si vous entrez des identifiants incorrects:
- Un message d'erreur apparaît: "Identifiants incorrects"
- Le message est affiché dans une bannière rouge
- Vérifiez vos identifiants et réessayez

### Erreur de connexion
En cas d'erreur technique:
- Message: "Une erreur s'est produite"
- Réessayez la connexion
- Si le problème persiste, vérifier la console développeur

## Retour à la connexion Discord

Si vous souhaitez vous connecter avec Discord plutôt qu'avec l'accès admin:
1. Cliquer sur "← Retour à la connexion Discord" en bas du formulaire
2. Vous serez redirigé vers la page de connexion Discord

## Déconnexion

Pour vous déconnecter:
1. Aller dans n'importe quel dashboard
2. Cliquer sur votre profil ou le menu utilisateur
3. Cliquer sur "Se déconnecter"

## Cas d'usage

### Accès rapide pour administration
L'accès admin est idéal pour:
- Tests et développement
- Administration système
- Support technique
- Accès d'urgence sans Discord

### Avantages
- ✅ Pas besoin de compte Discord
- ✅ Pas besoin de rôles spécifiques
- ✅ Accès à toutes les agences
- ✅ Connexion instantanée
- ✅ Pas de dépendance à l'API Discord

## Sécurité

### Important
⚠️ **Ne partagez jamais les identifiants admin**
⚠️ **Changez le mot de passe en production**
⚠️ **Limitez l'accès à cette page en production**

### Bonnes pratiques
- Utilisez des mots de passe forts
- Activez le HTTPS en production
- Loggez les connexions admin
- Limitez les tentatives de connexion

## Dépannage

### La page ne charge pas
1. Vérifier que le serveur est démarré: `npm run dev`
2. Vérifier l'URL: doit être `/admin`
3. Vérifier les logs serveur

### Redirection après connexion
Si vous êtes redirigé vers `/login`:
1. Vérifier que les identifiants sont corrects
2. Vérifier les cookies du navigateur
3. Vider le cache et réessayer

### Accès refusé aux dashboards
Si vous n'avez pas accès à un dashboard malgré la connexion admin:
1. Vérifier les logs middleware dans la console
2. Vérifier que `isAdmin` est bien `true` dans le token
3. Redémarrer le serveur

## Support

Pour toute question ou problème:
- Vérifier les logs dans la console développeur
- Consulter la documentation technique: `README.md`
- Contacter Snowzy

---

**Version**: 0.1.0
**Dernière mise à jour**: 2025-11-01
**Créé par**: Snowzy
