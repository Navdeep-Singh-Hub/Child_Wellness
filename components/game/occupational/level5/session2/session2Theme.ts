import type { ReactNode } from 'react';

/**
 * Shared theme tokens for OT Level 5 Session 2 targeted tapping games.
 */
export type Session2ThemeTokens = {
  sky: readonly string[];
  title: string;
  subtitle: string;
  accent: string;
  accentDark: string;
  hudGlass: string;
  hudBorder: string;
  cue: string;
};

export type Session2Copy = {
  title: string;
  emoji: string;
  tagline: string;
  body: string;
  chips: readonly string[];
  startLabel: string;
  ttsIntro?: string;
  ttsSuccess?: string;
  ttsComplete: string;
  congrats: string;
  logType: string;
  skillTags: readonly string[];
};

export type Session2GameMeta = {
  startGradient: readonly string[];
  hudTitle: string;
  scoreLabel: string;
};

export type Session2IntroConfig = {
  theme: Session2ThemeTokens;
  emoji: string;
  title: string;
  tagline: string;
  body: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  backdrop?: ReactNode;
  floatEmoji?: string;
};
