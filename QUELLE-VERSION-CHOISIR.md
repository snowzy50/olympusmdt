# 🤔 Quelle version de setup choisir ?

## 📁 Fichiers disponibles

### 1. `SETUP-SIMPLE-DEV.sql` ⭐ **RECOMMANDÉ POUR COMMENCER**
**Utiliser pour :** Voir la nouvelle interface IMMÉDIATEMENT

**Avantages :**
- ✅ Pas d'erreurs RLS
- ✅ Fonctionne tout de suite
- ✅ Parfait pour le développement

**Inconvénients :**
- ⚠️ Pas de sécurité (RLS désactivé)
- ⚠️ Ne pas utiliser en production

**Quand l'utiliser :**
- Pour tester la nouvelle interface
- Pour le développement local
- Avant de configurer l'authentification

---

### 2. `SETUP-COMPLET-V2.sql` 🔒 **POUR LA PRODUCTION**
**Utiliser pour :** Déploiement en production avec sécurité

**Avantages :**
- ✅ RLS activé (sécurité)
- ✅ Isolation par agence
- ✅ Prêt pour la production

**Inconvénients :**
- ⚠️ Nécessite configuration JWT
- ⚠️ Plus complexe

**Quand l'utiliser :**
- Après avoir testé avec SETUP-SIMPLE-DEV
- Quand l'authentification est configurée
- Pour le déploiement final

---

### 3. `SETUP-COMPLET.sql` ❌ **NE PAS UTILISER**
Cette version a des erreurs, ignorez-la.

---

## 🚀 Recommandation : Démarrage rapide

### Maintenant (Développement)
1. **Exécuter** `SETUP-SIMPLE-DEV.sql`
2. **Rafraîchir** la page
3. **Profiter** de la nouvelle interface ! 🎉

### Plus tard (Production)
1. Configurer l'authentification avec `agency_id` dans le JWT
2. **Exécuter** `SETUP-COMPLET-V2.sql`
3. Activer RLS

---

## 📋 Instructions d'exécution

### Pour SETUP-SIMPLE-DEV.sql

1. Ouvrir https://supabase.com/dashboard
2. SQL Editor → New Query
3. Copier tout le contenu de `SETUP-SIMPLE-DEV.sql`
4. Coller et cliquer **Run**
5. ✅ Succès ! Rafraîchir votre app

---

**Quel fichier voulez-vous exécuter en premier ?**

Je recommande `SETUP-SIMPLE-DEV.sql` pour voir immédiatement le résultat ! 🚀
