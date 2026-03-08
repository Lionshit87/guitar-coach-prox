# Guitar Coach Proxy

Mini serveur proxy pour cacher les clés API.

## Déploiement sur Render.com (gratuit)

### Étape 1 — Mettre ce dossier sur GitHub
1. Va sur github.com → New repository → nom: `guitar-coach-proxy`
2. Upload les 3 fichiers : `server.js`, `package.json`, `README.md`
3. Clique "Commit changes"

### Étape 2 — Déployer sur Render
1. render.com → "New +" → "Web Service"
2. Connecte ton repo GitHub `guitar-coach-proxy`
3. Paramètres :
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : Free
4. Clique **"Create Web Service"**

### Étape 3 — Ajouter les clés API (Environment)

| Variable | Où la trouver | Requis |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | ✅ |
| `GEMINI_API_KEY` | aistudio.google.com/apikey | ✅ |
| `ELEVENLABS_API_KEY` | elevenlabs.io | ❌ optionnel |

→ Render → Environment → Add chaque variable → Save Changes

### Étape 4 — Vérifier
Ouvre `https://ton-service.onrender.com/` dans le navigateur.
Tu dois voir :
```json
{ "anthropic": "✅ configured", "gemini": "✅ configured", ... }
```

### Routes disponibles
| Route | Usage |
|---|---|
| `GET /` | Health check |
| `POST /api/claude` | Programme + tablatures |
| `POST /api/gemini` | Chat coach, welcome, suivi session |
| `POST /api/speak` | Voix ElevenLabs (optionnel) |

## Notes
- Le plan gratuit Render "spin down" après 15 min d'inactivité
  → premier appel peut prendre 30-50 secondes
  → ensuite tout est rapide
