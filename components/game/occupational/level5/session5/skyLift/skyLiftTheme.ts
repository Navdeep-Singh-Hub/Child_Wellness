/** Design tokens — OT Level 5 Session 5 · Game 2 · Sky Lift */
export const SKY_LIFT_THEME = {
  sky: ['#042F2E', '#134E4A', '#0F766E', '#14B8A6'] as const,
  shaft: 'rgba(0,0,0,0.2)',
  shaftBorder: 'rgba(45,212,191,0.4)',
  cable: 'rgba(255,255,255,0.15)',
  floor: 'rgba(255,255,255,0.1)',
  floorLabel: '#99F6E4',
  cabin: 'rgba(45,212,191,0.15)',
  dot: '#2DD4BF',
  dotCore: '#CCFBF1',
  dotGlow: 'rgba(45,212,191,0.5)',
  arrow: '#5EEAD4',
  hudGlass: 'rgba(19,78,74,0.9)',
  hudBorder: 'rgba(45,212,191,0.4)',
  title: '#CCFBF1',
  subtitle: '#99F6E4',
  accent: '#2DD4BF',
  accentDark: '#0D9488',
} as const;

export const SKY_LIFT_COPY = {
  title: 'Sky Lift',
  emoji: '⬆️',
  subtitle: 'Vertical Track · Line Shifting',
  introDescription:
    'The glowing cabin light rides the sky lift up and down. Lock your eyes on it as it shifts between floors!',
  ttsIntro: 'Welcome to Sky Lift! Follow the dot up and down with your eyes!',
  ttsCue: 'Watch carefully! Track the dot up and down.',
  ttsTrack: 'Follow the dot up and down!',
  ttsComplete: 'Wonderful! You mastered vertical eye tracking!',
  congratsMessage: 'Lift Master!',
  logType: 'up-down-track',
  skillTags: ['line-shifting', 'eye-tracking', 'vertical-tracking'],
} as const;
