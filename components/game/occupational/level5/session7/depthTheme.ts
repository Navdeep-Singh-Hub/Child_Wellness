/**
 * Shared theme tokens for OT Level 5 Session 7 depth & distance games.
 */
export type DepthThemeTokens = {
  sky: readonly string[];
  hudGlass: string;
  hudBorder: string;
  title: string;
  subtitle: string;
  accent: string;
  accentDark: string;
};

export type DepthCopy = {
  title: string;
  emoji: string;
  subtitle: string;
  introDescription: string;
  ttsComplete: string;
  congratsMessage: string;
  logType: string;
};

export type DepthGameMeta = {
  rootBg: string;
  chips: readonly string[];
  startLabel: string;
  startColors: readonly string[];
  gameTitle: string;
  roundLabel: string;
  scoreLabel: string;
  phaseLabel: string;
};
