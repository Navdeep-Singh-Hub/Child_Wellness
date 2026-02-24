/**
 * Shared animation config for Therapy Progress and Session Games UI.
 * Keeps stagger delays and spring config consistent across therapies, levels, sessions, and game list.
 */

export const THERAPY_STAGGER_MS = 80;
export const LEVEL_STAGGER_MS = 70;
export const SESSION_STAGGER_MS = 60;
export const GAME_MENU_STAGGER_MS = 60;

export const SPRING_CONFIG = {
  damping: 14,
  stiffness: 200,
} as const;

export const PRESS_SCALE_AMOUNT = 0.02;
