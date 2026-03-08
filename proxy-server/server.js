// ══════════════════════════════════════════════════════════════
// Guitar Coach — Proxy Server
// Déployer sur Render (Node.js Web Service)
// Variables d'env : ANTHROPIC_API_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY
// ══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '8mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/', (_, res) => res.json({ ok: true, service: 'guitar-coach-proxy' }));

// ══════════════════════════════════════════════════════════════
// ANTHROPIC  — Programme, tablatures, exercices
// POST /claude   { system, messages, max_tokens? }
// ══════════════════════════════════════════════════════════════
app.post('/claude', async (req, res) => {
  try {
    const { system = '', messages = [], max_tokens = 4096, model } = req.body;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      model || 'claude-opus-4-5',
        max_tokens,
        system,
        messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    res.json(data);

  } catch (e) {
    console.error('[/claude]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GEMINI  — Chat coach, biblio, welcome screen, suivi session
// POST /gemini   { contents, systemInstruction?, generationConfig? }
// ══════════════════════════════════════════════════════════════
app.post('/gemini', async (req, res) => {
  try {
    const {
      contents = [],
      systemInstruction,
      generationConfig = { temperature: 0.85, maxOutputTokens: 1024 },
      model = 'gemini-1.5-flash-latest',
    } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = { contents, generationConfig };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    res.json(data);

  } catch (e) {
    console.error('[/gemini]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Variante /gemini/chat — messages au format {role, content}[]  (comme OpenAI)
// Convertit automatiquement vers le format Gemini contents[]
app.post('/gemini/chat', async (req, res) => {
  try {
    const { messages = [], system = '', model = 'gemini-1.5-flash-latest', maxTokens = 1024 } = req.body;

    // Convert OpenAI-style messages → Gemini contents
    const contents = messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
      contents,
      generationConfig: { temperature: 0.85, maxOutputTokens: maxTokens },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });

    // Normalise la réponse → { reply: "..." }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    res.json({ reply: text, raw: data });

  } catch (e) {
    console.error('[/gemini/chat]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
// ELEVENLABS  — Voix réelles du coach (optionnel)
// POST /tts   { text, voiceId?, modelId? }
// Retourne l'audio en base64
// ══════════════════════════════════════════════════════════════
app.post('/tts', async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: 'ElevenLabs not configured' });

  try {
    const {
      text,
      voiceId  = 'EXAVITQu4vr4xnSDxMaL', // Sarah — voix neutre par défaut
      modelId  = 'eleven_multilingual_v2',
    } = req.body;

    if (!text) return res.status(400).json({ error: 'text required' });

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key':   key,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { stability: 0.45, similarity_boost: 0.85 },
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: err });
    }

    const audioBuffer = await r.arrayBuffer();
    const base64      = Buffer.from(audioBuffer).toString('base64');
    res.json({ audio: base64, contentType: 'audio/mpeg' });

  } catch (e) {
    console.error('[/tts]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
app.listen(PORT, () =>
  console.log(`🎸 Guitar Coach proxy → port ${PORT}`)
);
