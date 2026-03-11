const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY    = process.env.GEMINI_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'Guitar Coach Proxy OK ✓',
    anthropic:   ANTHROPIC_KEY    ? '✅ OK' : '❌ manquant',
    gemini:      GEMINI_KEY       ? '✅ OK' : '❌ manquant',
    elevenlabs:  ELEVENLABS_KEY   ? '✅ OK' : '⚠️ absent (voix navigateur)',
    time: new Date().toISOString()
  });
});

// ── CLAUDE (Anthropic) ────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquant' });
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 28000);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      signal: ctrl.signal,
      body: JSON.stringify(req.body),
    });
    clearTimeout(t);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Claude error: ' + err.message });
  }
});

// ── GEMINI ────────────────────────────────────────────────
app.post('/api/gemini', async (req, res) => {
  if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY manquant' });
  try {
    const { contents, systemInstruction, generationConfig, model } = req.body;
    const mdl = model || 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${GEMINI_KEY}`;
    const body = {
      contents,
      generationConfig: generationConfig || { temperature: 0.75, maxOutputTokens: 2048 }
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 28000);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(t);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gemini error: ' + err.message });
  }
});

// ── ELEVENLABS Son (riff guitare) ─────────────────────────
app.post('/api/sound', async (req, res) => {
  if (!ELEVENLABS_KEY) return res.status(204).end();
  const { text = 'Electric guitar power chord riff, rock, distortion', duration = 3 } = req.body;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_KEY },
      signal: ctrl.signal,
      body: JSON.stringify({ text, duration_seconds: duration, prompt_influence: 0.4 }),
    });
    if (!response.ok) return res.status(204).end();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    res.status(204).end();
  }
});

// ── ELEVENLABS TTS (voix coach) ───────────────────────────
app.post('/api/speak', async (req, res) => {
  if (!ELEVENLABS_KEY) return res.status(204).end();
  const { text, voiceId, stability = 0.5, similarity = 0.75 } = req.body;
  if (!text || !voiceId) return res.status(400).json({ error: 'text et voiceId requis' });
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_KEY },
        signal: ctrl.signal,
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability, similarity_boost: similarity },
        }),
      }
    );
    if (!response.ok) return res.status(204).end();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    res.status(204).end();
  }
});

app.listen(PORT, () => {
  console.log(`🎸 Guitar Coach Proxy — port ${PORT}`);
  console.log(`   Anthropic  : ${ANTHROPIC_KEY  ? '✅' : '❌'}`);
  console.log(`   Gemini     : ${GEMINI_KEY     ? '✅' : '❌'}`);
  console.log(`   ElevenLabs : ${ELEVENLABS_KEY ? '✅' : '⚠️ voix navigateur'}`);
});
