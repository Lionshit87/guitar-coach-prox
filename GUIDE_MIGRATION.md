# 🚀 Migration Render → Railway
## Guitar Coach Proxy — Guide de déploiement

---

## Pourquoi Railway ?
- ✅ Gratuit (500h/mois, largement suffisant)
- ✅ **0 cold start** — serveur toujours actif, pas de sleep
- ✅ Déploiement automatique depuis GitHub
- ✅ Même code que Render, juste une URL différente

---

## ÉTAPE 1 — Crée un repo GitHub (si pas déjà fait)

1. Va sur **github.com** → "New repository"
2. Nom : `guitar-coach-proxy`
3. Visibilité : **Private** (tes clés sont dans les variables, pas dans le code)
4. Clique "Create repository"

Puis depuis ton ordinateur (ou GitHub web) :
- Upload les 2 fichiers de ce zip : `server.js` et `package.json`

---

## ÉTAPE 2 — Crée un compte Railway

1. Va sur **railway.app**
2. Clique "Login" → "Login with GitHub"
3. Autorise Railway à accéder à GitHub

---

## ÉTAPE 3 — Nouveau projet Railway

1. Tableau de bord Railway → **"New Project"**
2. Choisis **"Deploy from GitHub repo"**
3. Sélectionne `guitar-coach-proxy`
4. Railway détecte automatiquement Node.js et lance le build

---

## ÉTAPE 4 — Ajoute tes clés API (IMPORTANT)

Dans Railway → ton projet → onglet **"Variables"** → ajoute :

| Variable               | Valeur                          |
|------------------------|---------------------------------|
| `ANTHROPIC_API_KEY`    | ta clé Anthropic (sk-ant-...)   |
| `GEMINI_API_KEY`       | ta clé Google Gemini            |
| `ELEVENLABS_API_KEY`   | ta clé ElevenLabs (optionnel)   |

Clique **"Deploy"** après avoir ajouté les variables.

---

## ÉTAPE 5 — Récupère ton URL Railway

1. Dans Railway → ton projet → onglet **"Settings"**
2. Section **"Networking"** → **"Generate Domain"**
3. Tu obtiens une URL type : `https://guitar-coach-proxy-production.up.railway.app`

**Teste-la** en ouvrant cette URL dans ton navigateur.
Tu dois voir :
```json
{
  "status": "Guitar Coach Proxy OK ✓",
  "anthropic": "✅ OK",
  "gemini": "✅ OK"
}
```

---

## ÉTAPE 6 — Mets à jour l'app Guitar Coach

1. Ouvre Guitar Coach dans ton navigateur
2. Va dans **Réglages** (icône ⚙️)
3. Champ **"URL du serveur"** → remplace l'ancienne URL Render par ta nouvelle URL Railway
4. Clique **Sauvegarder**

C'est tout ! 🎸

---

## Vérification finale

Dans l'app Guitar Coach :
- [ ] Génération de programme fonctionne (moins de 5s)
- [ ] Voix du coach s'entend au démarrage
- [ ] Analyse après exercice fonctionne
- [ ] Chat avec le coach répond

---

## En cas de problème

**Le build échoue** → Vérifie que `package.json` est bien dans le repo

**Variables non trouvées** → Railway → Variables → vérifie l'orthographe exacte

**URL ne répond pas** → Railway → ton service → onglet "Logs" pour voir l'erreur

**Ancien Render** → Tu peux le laisser ou le supprimer, il ne sert plus à rien

---

## Coûts

Railway free tier : **500h/mois** = ~20h/jour  
Un proxy léger comme celui-ci utilise < 1h de CPU/mois.  
En pratique : **gratuit pour toujours** sur ce projet.
