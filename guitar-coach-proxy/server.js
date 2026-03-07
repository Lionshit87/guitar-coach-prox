const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Guitar Coach Proxy OK',
    anthropic: ANTHROPIC_KEY ? '✅ configured' : '❌ missing',
    elevenlabs: ELEVENLABS_KEY ? '✅ configured' : '⚠️ missing (TTS fallback mode)',
    time: new Date().toISOString()
  });
});

// ── CLAUDE API ────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Claude proxy error: ' + err.message });
  }
});

// ── ELEVENLABS TTS ────────────────────────────────────────
// Returns audio/mpeg directly
app.post('/api/speak', async (req, res) => {
  const { text, voiceId, stability = 0.5, similarity = 0.75 } = req.body;
  if (!text || !voiceId) return res.status(400).json({ error: 'text and voiceId required' });

  // Fallback: no ElevenLabs key → return 204 so app uses browser TTS
  if (!ELEVENLABS_KEY) return res.status(204).end();

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability, similarity_boost: similarity },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', err);
      return res.status(204).end(); // fallback silently
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error('TTS error:', err.message);
    res.status(204).end(); // fallback silently
  }
});

app.listen(PORT, () => {
  console.log(`Guitar Coach Proxy on port ${PORT}`);
  console.log(`Anthropic: ${ANTHROPIC_KEY ? 'OK' : 'MISSING'}`);
  console.log(`ElevenLabs: ${ELEVENLABS_KEY ? 'OK' : 'not set (browser TTS fallback)'}`);
});
