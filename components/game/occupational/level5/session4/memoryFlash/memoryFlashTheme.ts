/**
 * Design tokens — OT Level 5 Session 4 · Game 2 · Memory Flash
 * Palette: deep nebula violet + supernova flash accents
 */

export const MEMORY_FLASH_THEME = {
  space: ['#1E1B4B', '#312E81', '#4C1D95', '#6B21A8'] as const,
  nebula: 'rgba(139,92,246,0.2)',
  nebulaPink: 'rgba(236,72,153,0.12)',
  nebulaBlue: 'rgba(99,102,241,0.15)',
  spark: '#E9D5FF',
  sparkDim: 'rgba(233,213,255,0.35)',
  crystal: 'rgba(255,255,255,0.88)',
  crystalBorder: 'rgba(255,255,255,0.55)',
  flash: '#A78BFA',
  flashCore: '#C4B5FD',
  flashGlow: 'rgba(167,139,250,0.55)',
  flashRing: 'rgba(196,181,253,0.4)',
  recall: '#34D399',
  recallGlow: 'rgba(52,211,153,0.35)',
  wrong: '#F87171',
  wrongGlow: 'rgba(248,113,113,0.35)',
  hudGlass: 'rgba(30,27,75,0.9)',
  hudBorder: 'rgba(167,139,250,0.4)',
  title: '#F5F3FF',
  subtitle: '#C4B5FD',
  accent: '#A78BFA',
  accentDark: '#7C3AED',
  phaseObserve: '#818CF8',
  phaseFlash: '#F0ABFC',
  phaseRecall: '#34D399',
} as const;

export const MEMORY_FLASH_COPY = {
  title: 'Memory Flash',
  emoji: '💫',
  subtitle: 'Nebula Recall · Visual Memory',
  introDescription:
    'Objects appear in the cosmic nebula. Watch carefully — one crystal will flash bright. Then tap it from memory!',
  skills: ['Visual memory', 'Attention', 'Recall', 'Pattern encoding'],
  ttsIntro: 'Welcome to Memory Flash! Watch the nebula and remember what flashes!',
  ttsShowAll: 'Look at all the objects!',
  ttsFlashing: 'Watch which one flashes!',
  ttsRecall: 'Which object flashed?',
  ttsCorrect: 'Perfect recall!',
  ttsWrong: 'Try again! Pick the one that flashed.',
  ttsComplete: 'Incredible! You mastered every memory flash!',
  congratsMessage: 'Memory Master!',
  logType: 'memory-flash',
  skillTags: ['visual-memory', 'attention', 'recall'],
  hintObserve: '👁️ Study every crystal…',
  hintFlash: '✨ Target flashing now!',
  hintRecall: '🧠 Tap the one that flashed!',
} as const;
