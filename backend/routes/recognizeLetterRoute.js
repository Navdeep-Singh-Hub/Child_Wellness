/**
 * POST /api/recognize-letter — OpenAI vision: child-drawn uppercase letter (A–Z).
 * Body: { imageBase64: string, mimeType?: string }
 */
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an expert in recognizing children's handwritten uppercase English letters.

The drawings may be imperfect, shaky, incomplete, or distorted.

Your job:
1. Identify the most likely uppercase letter (A–Z)
2. Give a confidence score (0–100)
3. Be forgiving — prioritize human recognizability over perfection`;

const USER_PROMPT = `Analyze this drawing and tell which uppercase English letter it most closely represents.

Return JSON only with this exact shape:
{
  "letter": "A-Z single character",
  "confidence": number from 0 to 100,
  "feedback": "short child-friendly encouraging feedback"
}`;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function handleRecognizeLetter(req, res) {
  if (!openai) {
    return res.status(503).json({
      ok: false,
      error: 'recognition_unavailable',
      message: 'Letter recognition is not configured. Set OPENAI_API_KEY on the server.',
    });
  }

  try {
    const { imageBase64, mimeType = 'image/png' } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ ok: false, error: 'imageBase64 required' });
    }

    const b64 = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();
    if (!b64) {
      return res.status(400).json({ ok: false, error: 'invalid imageBase64' });
    }

    const dataUrl = `data:${mimeType};base64,${b64}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 220,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: USER_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'bad_model_response',
        message: 'The letter checker returned an unexpected answer. Try again.',
      });
    }

    let letter = String(parsed.letter || '').toUpperCase().trim();
    letter = letter.replace(/[^A-Z]/g, '');
    letter = letter.slice(0, 1) || '?';

    let confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    const feedback = String(parsed.feedback || 'Nice try! Keep practicing.').slice(0, 220);

    return res.json({ ok: true, letter, confidence, feedback });
  } catch (e) {
    console.error('[recognize-letter]', e);
    return res.status(500).json({
      ok: false,
      error: 'recognition_failed',
      message: e?.message || 'Recognition failed',
    });
  }
}
