/**
 * Superhero Training Academy — OT Level 3 Session 9 theme tokens.
 */

export const HERO_CHARACTERS = {
  captain: { id: 'captain', name: 'Captain Motion', emoji: '🦸', color: '#3B82F6' },
  flash: { id: 'flash', name: 'Flash Kid', emoji: '⚡', color: '#EAB308' },
  heroBot: { id: 'heroBot', name: 'Hero Bot', emoji: '🛡️', color: '#22C55E' },
  star: { id: 'star', name: 'Star Ranger', emoji: '🌟', color: '#A855F7' },
  master: { id: 'master', name: 'Master Trainer', emoji: '🎯', color: '#EF4444' },
} as const;

export const HERO_GRADIENT: [string, string, string, string] = [
  '#EFF6FF',
  '#DBEAFE',
  '#60A5FA',
  '#1D4ED8',
];

export const HERO_SHELL = {
  gradient: HERO_GRADIENT,
  backText: '#1E3A8A',
  backBorder: 'rgba(37,99,235,0.25)',
  titleColor: '#1E3A8A',
  subtitleColor: '#2563EB',
  statLabel: '#3B82F6',
  statValue: '#1E3A8A',
  statBorder: 'rgba(59,130,246,0.2)',
  playBorder: 'rgba(59,130,246,0.28)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#60A5FA',
  accent: '#3B82F6',
  accentDark: '#1D4ED8',
  confirmBg: '#2563EB',
  coinColor: '#F59E0B',
};

export const GAME_THEMES = {
  copyPose: {
    title: 'Pose Match',
    subtitle: 'Watch the superhero pose and copy it!',
    emoji: '👤',
    voiceIntro: 'Watch Captain Motion, then copy each superhero pose!',
    voiceComplete: 'Super pose matching! Motion hero!',
    congrats: 'Pose Match Star!',
    hintText: '🦸 Copy the pose!',
  },
  handMirror: {
    title: 'Flip Hand',
    subtitle: 'Raise the opposite hand from the trainer!',
    emoji: '👋',
    voiceIntro: 'When the trainer raises one hand, you raise the opposite!',
    voiceComplete: 'Amazing mirror hand control!',
    congrats: 'Flip Hand Pro!',
    hintText: '🪞 Opposite hand!',
  },
  patternCopy: {
    title: 'Move Chain',
    subtitle: 'Remember and repeat the movement chain!',
    emoji: '🔄',
    voiceIntro: 'Watch the move chain, then repeat it from memory!',
    voiceComplete: 'Move chain master!',
    congrats: 'Move Chain Champion!',
    hintText: '🔄 Repeat the chain!',
  },
  delayedMirror: {
    title: 'Wait Copy',
    subtitle: 'Watch, wait, then copy from memory!',
    emoji: '⏱️',
    voiceIntro: 'Watch the pose, wait, then copy it from memory!',
    voiceComplete: 'Delayed recall champion!',
    congrats: 'Wait Copy Hero!',
    hintText: '⏱️ Remember & copy!',
  },
  fastCopy: {
    title: 'Speed Pose',
    subtitle: 'Copy poses quickly before time runs out!',
    emoji: '⚡',
    voiceIntro: 'Copy each pose as fast as you can!',
    voiceComplete: 'Speed pose superstar!',
    congrats: 'Speed Pose Ranger!',
    hintText: '⚡ Copy fast!',
  },
} as const;
