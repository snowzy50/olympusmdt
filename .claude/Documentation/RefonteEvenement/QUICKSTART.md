# ⚡ Quick Start - RefonteEvenement

> **Pour démarrer rapidement après avoir basculé sur la branche**

---

## 🚀 Démarrage en 5 minutes

### 1️⃣ Exécuter les migrations SQL

**Ouvrir Supabase Dashboard** → SQL Editor

**Copier-coller et exécuter dans l'ordre :**

```sql
-- ÉTAPE 1 : Créer la table events
-- Fichier: /supabase/migrations/create_events_table.sql
```

Puis :

```sql
-- ÉTAPE 2 : Configurer RLS
-- Fichier: /supabase/migrations/create_events_rls.sql
```

### 2️⃣ Vérifier que Realtime est activé

```sql
-- Dans Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

### 3️⃣ Installer et démarrer

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm run dev
```

### 4️⃣ Tester

1. Aller sur http://localhost:3000
2. Se connecter
3. Cliquer sur **📅 Événements**
4. Cliquer sur **Nouvel événement**
5. Créer un événement de test
6. ✅ Vérifier qu'il apparaît dans le calendrier

---

## 🎯 Test Realtime (Important !)

1. **Navigateur A** : Connecté avec User 1
2. **Navigateur B** : Connecté avec User 2 (même agence)
3. Dans **Navigateur A** : Créer un événement
4. ✅ **L'événement doit apparaître instantanément dans Navigateur B**

Si ça fonctionne → Realtime est OK ! 🎉

---

## 📖 Documentation complète

- **[README.md](./README.md)** - Architecture technique
- **[INSTALLATION.md](./INSTALLATION.md)** - Guide installation détaillé
- **[GUIDE-UTILISATEUR.md](./GUIDE-UTILISATEUR.md)** - Guide pour utilisateurs finaux
- **[SYNTHESE.md](./SYNTHESE.md)** - Synthèse complète du projet

---

## ⚠️ Avant la production

- [ ] Remplacer `created_by: 'current-user'` par l'ID utilisateur réel
- [ ] Tester sur tous les navigateurs (Chrome, Firefox, Safari)
- [ ] Tester responsive (Desktop, Tablette, Mobile)
- [ ] Vérifier que toutes les migrations sont exécutées
- [ ] Former les utilisateurs

---

## 🆘 Problème ?

**Événements ne s'affichent pas** → Vérifier que les migrations SQL sont exécutées

**Realtime ne marche pas** → Vérifier que `ALTER PUBLICATION` a été exécuté

**Erreur RLS** → Vérifier que votre utilisateur a un `agency_id` dans la table `agents`

**Autres** → Consulter [INSTALLATION.md](./INSTALLATION.md) section "Résolution de problèmes"

---

## 💡 Ce qui a été fait

✅ **15 fichiers créés** (~4,900 lignes)
✅ **Service Realtime** complet
✅ **4 composants UI** modernes
✅ **Hook React** personnalisé
✅ **Table + RLS** Supabase
✅ **Documentation** exhaustive

---

**Prêt à tester !** 🚀
