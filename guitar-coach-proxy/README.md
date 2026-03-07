# Guitar Coach Proxy

Mini serveur proxy pour cacher la clé API Anthropic.

## Déploiement sur Render.com (gratuit)

### Étape 1 — Mettre ce dossier sur GitHub
1. Va sur github.com → New repository → nom: `guitar-coach-proxy`
2. Crée le repo (public ou privé, les deux marchent)
3. Upload les 3 fichiers : `server.js`, `package.json`, `README.md`
   - Clique "uploading an existing file" dans GitHub
   - Glisse les 3 fichiers
   - Clique "Commit changes"

### Étape 2 — Déployer sur Render
1. Va sur **render.com** → Sign up (gratuit, avec ton compte GitHub)
2. "New +" → "Web Service"
3. Connecte ton repo GitHub `guitar-coach-proxy`
4. Paramètres :
   - **Name** : guitar-coach-proxy
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : Free
5. Clique **"Create Web Service"**

### Étape 3 — Ajouter ta clé API
1. Dans ton service Render, va dans **"Environment"**
2. Ajoute une variable :
   - **Key** : `ANTHROPIC_API_KEY`
   - **Value** : `sk-ant-api03-XXXXXXXXXX` (ta clé Anthropic)
3. Clique **"Save Changes"** → le serveur redémarre

### Étape 4 — Récupérer ton URL
Render te donne une URL comme :
`https://guitar-coach-proxy.onrender.com`

→ Donne cette URL et je l'intègre dans l'app Guitar Coach.

## Notes
- Le plan gratuit Render "spin down" après 15 min d'inactivité
  → premier appel peut prendre 30-50 secondes (warm-up)
  → ensuite tout est rapide
- Pour éviter ça : Render propose un plan $7/mois (optionnel)
