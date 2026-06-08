/**
 * When true, all therapy modules, levels, sessions, and games are unlocked
 * without requiring prior completion or subscription free-access status.
 */
export const UNLOCK_ALL_THERAPY_CONTENT = true;

export function isTherapyContentUnlocked(): boolean {
  return UNLOCK_ALL_THERAPY_CONTENT;
}

export function isSequentialGameUnlocked(
  gameIndex: number,
  lastCompletedGameIndex: number,
): boolean {
  return UNLOCK_ALL_THERAPY_CONTENT || lastCompletedGameIndex >= gameIndex;
}
