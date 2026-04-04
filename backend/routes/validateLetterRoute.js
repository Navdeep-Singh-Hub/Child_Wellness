/**
 * POST /api/validate-letter — OpenAI vision: compare child drawing to expected uppercase letter (A–Z).
 * Body: { image: string (base64 or data URL), expectedLetter: string, mimeType?: string }
 */
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an expert in evaluating children's handwritten uppercase English letters.

Be STRICT but fair.

Rules:
- Only return isCorrect = true if the letter is clearly recognizable as the intended shape.
- If the drawing is random, messy, or does not resemble a real letter, return isCorrect = false.
- Do NOT guess incorrectly. If you cannot tell what letter it is, use detectedLetter "UNKNOWN" and isCorrect false.
- Prioritize accuracy over generosity.`;

function buildUserPrompt(expectedLetter) {
  return `Expected letter: ${expectedLetter}

Analyze the drawing.

Return JSON only with this exact shape:
{
  "detectedLetter": "A-Z or UNKNOWN",
  "isCorrect": true or false,
  "confidence": number from 0 to 100,
  "feedback": "short friendly message for the child"
}

If the drawing does not resemble any letter, use:
"detectedLetter": "UNKNOWN"
"isCorrect": false`;
}

const PASS_MIN_CONFIDENCE = 70;
const MIN_QUALITY_CONFIDENCE = 50;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function handleValidateLetter(req, res) {
  if (!openai) {
    return res.status(503).json({
      ok: false,
      error: 'recognition_unavailable',
      message: 'Letter recognition is not configured. Set OPENAI_API_KEY on the server.',
    });
  }

  try {
    const { image, expectedLetter: rawExpected, mimeType = 'image/png' } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'image required',
        message: 'Send JSON { image: "<base64>", expectedLetter: "A" }',
      });
    }
    if (rawExpected == null || String(rawExpected).trim() === '') {
      return res.status(400).json({
        ok: false,
        error: 'expectedLetter required',
        message: 'expectedLetter must be a single A–Z letter',
      });
    }

    let expected = String(rawExpected).toUpperCase().trim().replace(/[^A-Z]/g, '').slice(0, 1);
    if (!expected) {
      return res.status(400).json({
        ok: false,
        error: 'invalid expectedLetter',
        message: 'expectedLetter must be A–Z',
      });
    }

    const b64 = image.replace(/^data:image\/\w+;base64,/, '').trim();
    if (!b64) {
      return res.status(400).json({
        ok: false,
        error: 'invalid image',
        message: 'image must be non-empty base64 (PNG) or a data URL',
      });
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
            { type: 'text', text: buildUserPrompt(expected) },
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

    const rawDetected = String(parsed.detectedLetter ?? '').trim();
    const upperDetected = rawDetected.toUpperCase();
    let detectedLetter;
    if (upperDetected === 'UNKNOWN' || rawDetected === '' || /^UNKNOWN$/i.test(rawDetected)) {
      detectedLetter = 'UNKNOWN';
    } else {
      const letter = upperDetected.replace(/[^A-Z]/g, '').slice(0, 1);
      detectedLetter = letter || 'UNKNOWN';
    }

    let confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    const feedback = String(parsed.feedback || 'Nice try! Keep practicing.').slice(0, 220);

    const modelSaysCorrect = parsed.isCorrect === true;
    const isUnknown = detectedLetter === 'UNKNOWN';
    const lowQuality = confidence < MIN_QUALITY_CONFIDENCE;
    const isCorrect =
      !isUnknown &&
      !lowQuality &&
      detectedLetter === expected &&
      confidence >= PASS_MIN_CONFIDENCE &&
      modelSaysCorrect;

    return res.json({
      ok: true,
      detectedLetter,
      isCorrect,
      confidence,
      feedback,
      expectedLetter: expected,
    });
  } catch (e) {
    console.error('[validate-letter]', e);
    return res.status(500).json({
      ok: false,
      error: 'validation_failed',
      message: e?.message || 'Validation failed',
    });
  }
}
