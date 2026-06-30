/**
 * OT Level 10 · Session 2 · Game 3 — Heavy Work Break · "Forge Break Yard"
 *
 * Warm granite + amber + rust — industrial proprioceptive palette,
 * distinct from Cloud Loft and Twilight Slow-Path.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const FORGE_SHELL = {
  backText: '#FEF3C7',
  backBorder: 'rgba(254,243,199,0.35)',
  statLabel: '#FCD34D',
  statValue: '#FFFBEB',
  statBorder: 'rgba(251,191,36,0.45)',
  stageBorder: 'rgba(234,88,12,0.5)',
  stageBg: 'rgba(28,25,23,0.72)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  sparkleColor: '#FDE68A',
  glassBorder: 'rgba(251,191,36,0.3)',
  academyLabel: 'HEAVY WORK REGULATION LAB',
} as const;

export type HeavyWorkType = 'push-down' | 'wall-push' | 'pull-apart' | 'carry' | 'press-in';

export type WorkZone = Point & { radius: number };

export type HeavyWorkStation = {
  id: string;
  type: HeavyWorkType;
  label: string;
  emoji: string;
  objectEmoji: string;
  color: string;
  voiceCue: string;
  seekCue: string;
  leftZone: WorkZone;
  rightZone: WorkZone;
  /** Optional center anchor for press-in. */
  center?: WorkZone;
};

export const HEAVY_WORK_THEME = {
  title: 'Heavy Work Break',
  subtitle: 'Take a proprioceptive break — push, pull, carry and press with strong, steady body work!',
  emoji: '🧱',
  hero: '💪',
  accent: '#F97316',
  accentAmber: '#FBBF24',
  accentStone: '#78716C',
  glow: 'rgba(249,115,22,0.5)',
  bgGradient: ['#1C1917', '#44403C', '#7C2D12', '#B45309'] as [string, string, string, string],
  decor: ['🧱', '⚒️', '🔩', '💪', '🪨', '✨', '🛠️', '🔥'],
  hintText: 'Use both hands — match each heavy work pose and hold steady.',
  positionCue: 'Show your hands, arms and upper body to the camera.',
  workLabel: 'HEAVY WORK!',
  pushLabel: 'PUSH!',
  holdLabel: 'HOLD STEADY…',
  voiceIntro:
    'Welcome to the Forge Break Yard! Heavy work helps your body feel calm. Push, pull, carry and press through each break station.',
  voiceComplete: 'Powerful work! You finished every heavy work break with great regulation!',
  congrats: 'Heavy Work Hero!',
  skillTags: [
    'proprioceptive-input',
    'self-regulation',
    'sensory-integration',
    'motor-planning',
    'functional-participation',
  ],
} as const;

export const HEAVY_WORK_STATIONS: HeavyWorkStation[] = [
  {
    id: 'push-block',
    type: 'push-down',
    label: 'Push Block',
    emoji: '👇',
    objectEmoji: '🧱',
    color: '#F97316',
    voiceCue: 'Push down on the heavy block with both hands low!',
    seekCue: 'Press both hands down on the block zones!',
    leftZone: { x: 0.3, y: 0.7, radius: 0.11 },
    rightZone: { x: 0.7, y: 0.7, radius: 0.11 },
  },
  {
    id: 'wall-push',
    type: 'wall-push',
    label: 'Wall Push',
    emoji: '🤚',
    objectEmoji: '🧱',
    color: '#FBBF24',
    voiceCue: 'Wall push! Both hands wide and strong at shoulder height!',
    seekCue: 'Push outward against the wall zones!',
    leftZone: { x: 0.14, y: 0.44, radius: 0.105 },
    rightZone: { x: 0.86, y: 0.44, radius: 0.105 },
  },
  {
    id: 'pull-band',
    type: 'pull-apart',
    label: 'Pull Band',
    emoji: '🙌',
    objectEmoji: '🎗️',
    color: '#FB923C',
    voiceCue: 'Pull the resistance band apart — hands wide and strong!',
    seekCue: 'Stretch your arms wide to pull the band!',
    leftZone: { x: 0.1, y: 0.5, radius: 0.1 },
    rightZone: { x: 0.9, y: 0.5, radius: 0.1 },
  },
  {
    id: 'carry-crate',
    type: 'carry',
    label: 'Carry Crate',
    emoji: '📦',
    objectEmoji: '📦',
    color: '#D97706',
    voiceCue: 'Carry the heavy crate — both hands together at your middle!',
    seekCue: 'Hold the crate zones with both hands close!',
    leftZone: { x: 0.38, y: 0.56, radius: 0.095 },
    rightZone: { x: 0.62, y: 0.56, radius: 0.095 },
  },
  {
    id: 'press-together',
    type: 'press-in',
    label: 'Press Together',
    emoji: '🤲',
    objectEmoji: '🪨',
    color: '#EA580C',
    voiceCue: 'Press your palms together on the heavy stone in the center!',
    seekCue: 'Bring both hands to the center stone and press!',
    leftZone: { x: 0.42, y: 0.42, radius: 0.1 },
    rightZone: { x: 0.58, y: 0.42, radius: 0.1 },
    center: { x: 0.5, y: 0.42, radius: 0.14 },
  },
];
