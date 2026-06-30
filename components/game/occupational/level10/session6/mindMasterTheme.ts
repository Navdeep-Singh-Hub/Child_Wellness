/**
 * OT Level 10 · Session 6 · Game 5 — Mind Master · "Mind Mastery Quest"
 *
 * Royal purple + gold capstone palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const MIND_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  statLabel: '#FDE68A',
  statValue: '#FAF5FF',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(139,92,246,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#8B5CF6',
  glassBorder: 'rgba(139,92,246,0.35)',
  academyLabel: 'MIND MASTERY',
  focus: '#38BDF8',
  regulate: '#14B8A6',
  master: '#FBBF24',
} as const;

export type MindPhaseKind = 'focus' | 'regulate' | 'master';

export type MindMasterRound = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  focus: Point & { radius: number };
  regulate: Point & { radius: number };
  master: Point & { radius: number };
  voiceFocus: string;
  voiceRegulate: string;
  voiceMaster: string;
  regulateCue: string;
  masterCue: string;
};

export const MIND_MASTER_THEME = {
  title: 'Mind Master',
  subtitle: 'Focus, regulate, then master each mind challenge — the ultimate attention adventure!',
  emoji: '🧠',
  hero: '👑',
  accent: '#8B5CF6',
  accentGold: '#FBBF24',
  glow: 'rgba(139,92,246,0.5)',
  bgGradient: ['#0F172A', '#4C1D95', '#312E81', '#713F12'] as [string, string, string, string],
  decor: ['🧠', '👑', '✨', '🌟', '🔮', '⏸️', '👀', '🗺️'],
  hintText: 'Three mind steps: focus, regulate calm, then master the finale!',
  positionCue: 'Face the camera — we track your mind mastery adventure.',
  focusLabel: 'FOCUS!',
  regulateLabel: 'REGULATE!',
  masterLabel: 'MASTER!',
  holdFocusLabel: 'FOCUS NODE!',
  holdRegulateLabel: 'CALM HOLD!',
  holdMasterLabel: 'MIND MASTER!',
  voiceIntro:
    'Welcome to Mind Master! This is the ultimate attention adventure. Focus at each node, regulate with calm stillness, then master the finale with steady attention.',
  voiceComplete: 'Mind Master champion! You completed every focus, regulate and master challenge!',
  congrats: 'Mind Master Champion!',
  skillTags: [
    'attention-regulation',
    'self-regulation',
    'sensory-integration',
    'motor-planning',
    'adaptive-responses',
  ],
} as const;

const mr = (
  id: string,
  title: string,
  emoji: string,
  color: string,
  focus: Point,
  regulate: Point,
  master: Point,
  voiceFocus: string,
  voiceRegulate: string,
  voiceMaster: string,
  regulateCue: string,
  masterCue: string,
): MindMasterRound => ({
  id,
  title,
  emoji,
  color,
  focus: { ...focus, radius: 0.1 },
  regulate: { ...regulate, radius: 0.1 },
  master: { ...master, radius: 0.095 },
  voiceFocus,
  voiceRegulate,
  voiceMaster,
  regulateCue,
  masterCue,
});

export const MIND_MASTER_ROUNDS: MindMasterRound[] = [
  mr(
    'gate',
    'Focus Gate',
    '🧠',
    '#8B5CF6',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.52 },
    'Step 1: FOCUS — go to the mind gate on the left!',
    'Step 2: REGULATE — stop and calm your body!',
    'Step 3: MASTER — lock your mind focus!',
    'Calm body — regulate hold!',
    'Focus gate mastered!',
  ),
  mr(
    'bridge',
    'Calm Bridge',
    '🌉',
    '#14B8A6',
    { x: 0.76, y: 0.38 },
    { x: 0.48, y: 0.5 },
    { x: 0.52, y: 0.46 },
    'FOCUS right — reach the calm bridge!',
    'REGULATE — still body on the bridge!',
    'MASTER — hold mind focus on the bridge!',
    'Bridge calm — steady!',
    'Bridge mastered!',
  ),
  mr(
    'summit',
    'Quest Summit',
    '⛰️',
    '#F59E0B',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.5 },
    'FOCUS up — climb to the quest summit!',
    'REGULATE — pause at the summit!',
    'MASTER the summit challenge!',
    'Summit calm — hold!',
    'Summit conquered!',
  ),
  mr(
    'tower',
    'Watch Tower',
    '👁️',
    '#38BDF8',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    { x: 0.48, y: 0.52 },
    'FOCUS — go to the watch tower!',
    'REGULATE — observe with calm stillness!',
    'MASTER the watch tower!',
    'Tower watch — quiet body!',
    'Tower mastered!',
  ),
  mr(
    'crown',
    'Mind Crown',
    '👑',
    '#FBBF24',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.48 },
    'Final FOCUS — reach the mind crown!',
    'REGULATE — calm before mastery!',
    'MIND MASTER finale — hold champion focus!',
    'Crown calm — almost there!',
    'You are a Mind Master!',
  ),
];
