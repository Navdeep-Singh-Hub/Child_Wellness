import { API_BASE_URL, authHeaders } from '@/utils/api';

export interface RecognizeLetterResult {
  ok: boolean;
  letter?: string;
  confidence?: number;
  feedback?: string;
  error?: string;
  message?: string;
}

export interface ValidateLetterResult {
  ok: boolean;
  detectedLetter?: string;
  isCorrect?: boolean;
  confidence?: number;
  feedback?: string;
  expectedLetter?: string;
  error?: string;
  message?: string;
}

/** Min model confidence (0–100) to accept a letter as correct (strict but fair). */
export const LETTER_VALIDATION_PASS_MIN_CONFIDENCE = 70;

/** Below this, reject as low-quality / unclear drawing (even if model guessed a letter). */
export const LETTER_VALIDATION_MIN_QUALITY_CONFIDENCE = 50;

/**
 * Pass only when the API returns a strict success: matching letter, model agrees, confidence OK,
 * not UNKNOWN, and above minimum quality. Mirrors server `/api/validate-letter` logic.
 */
export function isLetterValidationPass(
  data: Pick<ValidateLetterResult, 'isCorrect' | 'confidence' | 'detectedLetter' | 'expectedLetter'>
): boolean {
  const c = Number(data.confidence);
  if (!Number.isFinite(c) || c < LETTER_VALIDATION_MIN_QUALITY_CONFIDENCE) return false;
  if (c < LETTER_VALIDATION_PASS_MIN_CONFIDENCE) return false;

  const det = String(data.detectedLetter ?? '').toUpperCase().trim();
  if (det === 'UNKNOWN' || det === '' || det === '?') return false;

  const exp = String(data.expectedLetter ?? '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 1);
  if (!exp || det !== exp) return false;

  return data.isCorrect === true;
}

export type LetterCheckFailure = RecognizeLetterResult | ValidateLetterResult;

/** User-visible hint when recognition fails (uses server message when present). */
export function letterRecognitionFailureHint(data: LetterCheckFailure): string {
  const msg = data.message?.trim();
  if (msg) return msg;
  const e = (data.error || '').toLowerCase();
  if (e.includes('too large') || e.includes('entity too large')) {
    return 'The drawing was too big to send. Try simpler strokes, or ask a grown-up to update the server.';
  }
  if (e === 'network_error' || e.includes('failed to fetch')) {
    return 'Could not reach the server. Check you are online and the backend is running (for example on port 4000).';
  }
  if (e === 'route not found' || e.includes('route not found')) {
    return 'This API does not have letter recognition yet. Deploy or restart the latest backend from this repo, or open the app from http://localhost:8081 with the API on port 4000.';
  }
  if (e.startsWith('http_')) {
    const code = e.slice(5);
    if (code === '404') return 'Letter check was not found on this server. Update and restart the backend, or check the API address in settings.';
    if (code === '413') return 'Drawing too large to send. Try a lighter drawing.';
    if (code.startsWith('5')) return 'The letter checker had a problem. Try again in a moment.';
  }
  if (data.error && data.error.length < 160) return data.error;
  return '';
}

/**
 * Sends a PNG (or other) image as base64 to the backend; OpenAI returns letter + confidence + feedback.
 */
export async function recognizeLetterImage(
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<RecognizeLetterResult> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE_URL}/api/recognize-letter`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = (await res.json().catch(() => ({}))) as RecognizeLetterResult;
    if (!res.ok) {
      const bodyErr = (data as { error?: string }).error;
      return {
        ok: false,
        error: bodyErr || `http_${res.status}`,
        message: (data as { message?: string }).message,
      };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { ok: false, error: 'network_error', message };
  }
}

/**
 * Validates drawing against expected letter via OpenAI vision (POST /api/validate-letter).
 * @param imageBase64 PNG base64 without data: prefix (or with prefix — server strips it)
 */
export async function validateLetterImage(
  imageBase64: string,
  expectedLetter: string,
  mimeType: string = 'image/png'
): Promise<ValidateLetterResult> {
  try {
    const headers = await authHeaders();
    const rawB64 = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();
    const res = await fetch(`${API_BASE_URL}/api/validate-letter`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: rawB64,
        expectedLetter: expectedLetter.trim(),
        mimeType,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as ValidateLetterResult;
    if (!res.ok) {
      const bodyErr = (data as { error?: string }).error;
      return {
        ok: false,
        error: bodyErr || `http_${res.status}`,
        message: (data as { message?: string }).message,
      };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { ok: false, error: 'network_error', message };
  }
}
