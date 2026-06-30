import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export type GauntletBackdropId = 'comet' | 'fortress' | 'canyon' | 'storm' | 'crown';

export type GauntletChallenge =
  | 'movingTap'
  | 'flashTap'
  | 'goStop'
  | 'distractTap'
  | 'nearFar'
  | 'speedMatch';

export interface GauntletConfig {
  logType: string;
  skillTags: string[];
  challenges: GauntletChallenge[];
  randomPool?: boolean;
}

export type GauntletCopy = {
  gameTitle: string;
  emoji: string;
  tagline: string;
  introBody: string;
  chips: readonly string[];
  startLabel: string;
  startGradient: readonly string[];
  congrats: string;
  scoreLabel: string;
  rootBg: string;
  backdrop: GauntletBackdropId;
};

export type GauntletThemeBundle = { theme: Session2ThemeTokens; copy: GauntletCopy };

export const CHALLENGE_HINTS: Record<GauntletChallenge, string> = {
  movingTap: 'Tap the moving orb!',
  flashTap: 'Tap the flash fast!',
  goStop: 'Green tap — red hold back!',
  distractTap: 'Tap the starred target!',
  nearFar: 'Tap near or far as called!',
  speedMatch: 'Match the called speed!',
};

export const CHALLENGE_TTS: Record<GauntletChallenge, string> = {
  movingTap: 'Chase and tap!',
  flashTap: 'Flash tap!',
  goStop: 'Go or stop!',
  distractTap: 'Find the target!',
  nearFar: 'Near or far!',
  speedMatch: 'Match the speed!',
};
