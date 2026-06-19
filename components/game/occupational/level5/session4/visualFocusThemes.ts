import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { VisualFocusGameId } from '@/components/game/occupational/level5/session4/session4Pacing';

export type VisualFocusBackdropId = 'starry' | 'nebula' | 'spotlight' | 'detective' | 'prism';

export type VisualFocusCopy = {
  id: VisualFocusGameId;
  backdrop: VisualFocusBackdropId;
  gameTitle: string;
  emoji: string;
  tagline: string;
  introBody: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  congrats: string;
  scoreLabel: string;
  rootBg: string;
  logType: string;
  skillTags: readonly string[];
};

export const FIND_STAR_THEME: Session2ThemeTokens = {
  sky: ['#0C1445', '#1E3A8A', '#312E81', '#4C1D95'],
  title: '#FDE68A',
  subtitle: '#FCD34D',
  accent: '#FBBF24',
  accentDark: '#D97706',
  hudGlass: 'rgba(15,23,42,0.82)',
  hudBorder: 'rgba(251,191,36,0.35)',
  cue: '#FEF3C7',
};

export const FIND_STAR_COPY: VisualFocusCopy = {
  id: 'find-the-star',
  backdrop: 'starry',
  gameTitle: 'Star Safari',
  emoji: '⭐',
  tagline: 'Night Sky · Visual Scanning',
  introBody: 'Stars are hiding among colorful objects in the night sky. Find every star before moving on!',
  chips: ['👀 Scan', '⭐ Find', '🔍 Search'],
  startLabel: 'Start Safari',
  startGradient: ['#FBBF24', '#F59E0B', '#D97706'],
  congrats: 'Star Hunter!',
  scoreLabel: 'ROUNDS',
  rootBg: '#1E1B4B',
  logType: 'find-the-star',
  skillTags: ['visual-scanning', 'attention', 'object-recognition'],
};

export const MEMORY_FLASH_THEME: Session2ThemeTokens = {
  sky: ['#1E1B4B', '#312E81', '#4C1D95', '#6B21A8'],
  title: '#E9D5FF',
  subtitle: '#C4B5FD',
  accent: '#A78BFA',
  accentDark: '#8B5CF6',
  hudGlass: 'rgba(30,27,75,0.85)',
  hudBorder: 'rgba(167,139,250,0.4)',
  cue: '#EDE9FE',
};

export const MEMORY_FLASH_COPY: VisualFocusCopy = {
  id: 'memory-flash',
  backdrop: 'nebula',
  gameTitle: 'Memory Flash',
  emoji: '💫',
  tagline: 'Nebula Recall · Visual Memory',
  introBody: 'All objects appear together. Watch which one flashes bright, then tap it from memory!',
  chips: ['👁️ Watch', '✨ Flash', '🧠 Recall'],
  startLabel: 'Begin Recall',
  startGradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
  congrats: 'Memory Master!',
  scoreLabel: 'HITS',
  rootBg: '#312E81',
  logType: 'memory-flash',
  skillTags: ['visual-memory', 'attention', 'recall'],
};

export const MATCH_SHADOW_THEME: Session2ThemeTokens = {
  sky: ['#1F2937', '#374151', '#4B5563', '#6B7280'],
  title: '#F9FAFB',
  subtitle: '#D1D5DB',
  accent: '#F472B6',
  accentDark: '#EC4899',
  hudGlass: 'rgba(31,41,55,0.88)',
  hudBorder: 'rgba(244,114,182,0.35)',
  cue: '#FBCFE8',
};

export const MATCH_SHADOW_COPY: VisualFocusCopy = {
  id: 'match-shadow',
  backdrop: 'spotlight',
  gameTitle: 'Shadow Stage',
  emoji: '🕳️',
  tagline: 'Spotlight Theater · Depth Match',
  introBody: 'On the shadow stage, tap the animal then tap its matching shadow silhouette!',
  chips: ['🎭 Match', '🕳️ Shadow', '👆 Tap'],
  startLabel: 'Curtain Up',
  startGradient: ['#F472B6', '#EC4899', '#DB2777'],
  congrats: 'Shadow Star!',
  scoreLabel: 'MATCHES',
  rootBg: '#1F2937',
  logType: 'match-shadow',
  skillTags: ['depth-perception', 'visual-matching', 'spatial-awareness'],
};

export const WHAT_MOVED_THEME: Session2ThemeTokens = {
  sky: ['#422006', '#78350F', '#92400E', '#B45309'],
  title: '#FEF3C7',
  subtitle: '#FDE68A',
  accent: '#FACC15',
  accentDark: '#EAB308',
  hudGlass: 'rgba(66,32,6,0.85)',
  hudBorder: 'rgba(250,204,21,0.35)',
  cue: '#FEF9C3',
};

export const WHAT_MOVED_COPY: VisualFocusCopy = {
  id: 'what-moved',
  backdrop: 'detective',
  gameTitle: 'What Moved?',
  emoji: '🔍',
  tagline: 'Detective Desk · Change Detection',
  introBody: 'Memorize where everything sits. When the scene shifts, tap the object that moved!',
  chips: ['👀 Watch', '🔍 Spot', '⚡ Change'],
  startLabel: 'Open Case',
  startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Super Sleuth!',
  scoreLabel: 'CASES',
  rootBg: '#78350F',
  logType: 'what-moved',
  skillTags: ['attention-control', 'visual-tracking', 'change-detection'],
};

export const SPOT_COLOR_THEME: Session2ThemeTokens = {
  sky: ['#FDF4FF', '#FAE8FF', '#F3E8FF', '#EDE9FE'],
  title: '#5B21B6',
  subtitle: '#7C3AED',
  accent: '#EC4899',
  accentDark: '#DB2777',
  hudGlass: 'rgba(255,255,255,0.88)',
  hudBorder: 'rgba(236,72,153,0.35)',
  cue: '#6D28D9',
};

export const SPOT_COLOR_COPY: VisualFocusCopy = {
  id: 'spot-the-color',
  backdrop: 'prism',
  gameTitle: 'Color Hunt',
  emoji: '🎨',
  tagline: 'Prism Lab · Selective Focus',
  introBody: 'A rainbow of dots fills the lab. Tap every dot of the target color to clear the round!',
  chips: ['🎨 Color', '👆 Tap All', '🎯 Focus'],
  startLabel: 'Enter Lab',
  startGradient: ['#EC4899', '#DB2777', '#BE185D'],
  congrats: 'Color Expert!',
  scoreLabel: 'ROUNDS',
  rootBg: '#F3E8FF',
  logType: 'spot-the-color',
  skillTags: ['selective-focus', 'color-recognition', 'attention'],
};
