# Guitar Coach — Proxy Render

## Déploiement sur Render

### 1. Créer le service
- **New Web Service** → connecte ton repo GitHub (ou upload zip)
- **Runtime** : Node
- **Build Command** : `npm install`
- **Start Command** : `npm start`

### 2. Variables d'environnement (Render → Environment)

| Variable | Source | Requis |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | ✅ |
| `GEMINI_API_KEY` | aistudio.google.com/apikey | ✅ |
| `ELEVENLABS_API_KEY` | elevenlabs.io | ❌ optionnel |

### 3. Routes disponibles

| Route | Usage |
|---|---|
| `GET /` | Health check |
| `POST /claude` | Programme + tablatures (Anthropic) |
| `POST /gemini` | Chat coach natif Gemini |
| `POST /gemini/chat` | Chat au format messages[] simplifié |
| `POST /tts` | Voix coach (ElevenLabs) |

### 4. Dans l'app Guitar Coach
Colle l'URL Render dans **Configuration → URL serveur** :
```
https://ton-service.onrender.com
```
