/**
 * Shared helpers for session intro: clickable game cards and "Start = next game".
 * Used by all special-education session components (Farm, Ocean, Graduate, etc.).
 */
import { advanceTherapyProgress, fetchTherapyProgress } from '@/utils/api';

const THERAPY = 'special-education';

/**
 * Returns the number of games completed (1..gameCount) for the given section/session.
 * 0 = none completed (first-time user).
 */
export async function getLastCompletedGameIndex(
  sectionNumber: number,
  sessionNumber: number,
  gameCount: number
): Promise<number> {
  try {
    const { therapies } = await fetchTherapyProgress();
    const se = therapies?.find((t: { therapy: string }) => t.therapy === THERAPY);
    const section = se?.sections?.find((s: { sectionNumber: number }) => s.sectionNumber === sectionNumber);
    const session = section?.sessions?.find((s: { sessionNumber: number }) => s.sessionNumber === sessionNumber);
    const games = session?.games ?? [];
    let last = 0;
    for (let i = 0; i < gameCount; i++) {
      const g = games.find((x: { gameNumber: number }) => x.gameNumber === i + 1);
      if (g?.completed) last = i + 1;
      else break;
    }
    return last;
  } catch {
    return 0;
  }
}

/**
 * Mark a game as completed in therapy progress (so next time intro shows correct unlocks).
 */
export async function markSessionGameComplete(
  sectionNumber: number,
  sessionNumber: number,
  gameNumber: number
): Promise<void> {
  try {
    await advanceTherapyProgress({
      therapy: THERAPY,
      sectionNumber,
      sessionNumberSE: sessionNumber,
      gameNumber,
      markCompleted: true,
    });
  } catch (_) {}
}
