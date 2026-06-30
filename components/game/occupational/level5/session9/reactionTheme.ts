/**
 * Shared theme tokens for OT Level 5 Session 9 visual reaction games.
 */
export type ReactionThemeTokens = {
  sky: readonly string[];
  hudGlass: string;
  hudBorder: string;
  title: string;
  subtitle: string;
  accent: string;
  accentDark: string;
  cue: string;
};

export type ReactionCopy = {
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
  logType: string;
};

export type ReactionGameMeta = {
  roundLabel?: string;
  phaseLabel?: string;
};
