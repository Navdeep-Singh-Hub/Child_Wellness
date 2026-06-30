/**
 * OT Level 10 · Session 4 · Game 4 — Move & Match · "Harmony Match Studio"
 *
 * Rose pink + mint harmony palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const MATCH_SHELL = {
  backText: '#FBCFE8',
  backBorder: 'rgba(251,207,232,0.35)',
  statLabel: '#6EE7B7',
  statValue: '#FFF1F2',
  statBorder: 'rgba(110,231,183,0.45)',
  stageBorder: 'rgba(244,114,182,0.55)',
  stageBg: 'rgba(30,27,75,0.8)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#F472B6',
  glassBorder: 'rgba(244,114,182,0.35)',
  academyLabel: 'MATCH STUDIO LAB',
  move: '#94A3B8',
  match: '#34D399',
} as const;

export type MatchSymbol = 'heart' | 'star' | 'moon' | 'flower' | 'diamond';

export type MoveMatchRound = {
  id: string;
  symbol: MatchSymbol;
  label: string;
  emoji: string;
  color: string;
  move: Point & { radius: number };
  match: Point & { radius: number };
  voiceMove: string;
  voiceMatch: string;
  matchCue: string;
};

export const MOVE_MATCH_THEME = {
  title: 'Move & Match',
  subtitle: 'Move to the studio pad — then match your body to the twin symbol and hold!',
  emoji: '🎨',
  hero: '💠',
  accent: '#F472B6',
  accentMint: '#34D399',
  glow: 'rgba(244,114,182,0.5)',
  bgGradient: ['#1E1B4B', '#500724', '#134E4A', '#831843'] as [string, string, string, string],
  decor: ['🎨', '💠', '✨', '🌸', '💎', '🌙', '⭐', '💗'],
  hintText: 'Move to the gray pad first — then match the twin symbol with your body!',
  positionCue: 'Face the camera so we can track your move and match.',
  moveLabel: 'MOVE!',
  matchLabel: 'MATCH!',
  holdMoveLabel: 'HOLD MOVE!',
  holdMatchLabel: 'HOLD MATCH!',
  voiceIntro:
    'Welcome to the Harmony Match Studio! Each round you move to the studio pad — then slide to the matching twin symbol and hold your body in place.',
  voiceComplete: 'Beautiful matching! You moved and matched every harmony pair like a sensory-motor artist!',
  congrats: 'Match Artist!',
  skillTags: [
    'sensory-integration',
    'motor-planning',
    'attention',
    'adaptive-responses',
    'functional-participation',
  ],
} as const;

const SYMBOL_EMOJI: Record<MatchSymbol, string> = {
  heart: '💗',
  star: '⭐',
  moon: '🌙',
  flower: '🌸',
  diamond: '💎',
};

const mm = (
  id: string,
  symbol: MatchSymbol,
  label: string,
  color: string,
  move: Point,
  match: Point,
  voiceMove: string,
  voiceMatch: string,
  matchCue: string,
): MoveMatchRound => ({
  id,
  symbol,
  label,
  emoji: SYMBOL_EMOJI[symbol],
  color,
  move: { ...move, radius: 0.105 },
  match: { ...match, radius: 0.105 },
  voiceMove,
  voiceMatch,
  matchCue,
});

export const MOVE_MATCH_ROUNDS: MoveMatchRound[] = [
  mm(
    'center-left',
    'heart',
    'Heart Pair',
    '#F472B6',
    { x: 0.5, y: 0.52 },
    { x: 0.22, y: 0.48 },
    'Move to the CENTER studio pad!',
    'Match the HEART twin on the left!',
    'Slide left — match the heart!',
  ),
  mm(
    'left-right',
    'star',
    'Star Pair',
    '#FBBF24',
    { x: 0.2, y: 0.5 },
    { x: 0.8, y: 0.5 },
    'Move to the LEFT studio pad!',
    'MATCH the star twin on the right!',
    'Glide right to the star match!',
  ),
  mm(
    'up-down',
    'moon',
    'Moon Pair',
    '#A78BFA',
    { x: 0.5, y: 0.24 },
    { x: 0.5, y: 0.72 },
    'Move UP to the top studio pad!',
    'Match the MOON twin below!',
    'Lower your body to the moon!',
  ),
  mm(
    'diag-ne',
    'flower',
    'Flower Pair',
    '#FB7185',
    { x: 0.28, y: 0.68 },
    { x: 0.74, y: 0.32 },
    'Move to the lower-left studio pad!',
    'MATCH the flower twin up-right!',
    'Rise diagonal to the flower!',
  ),
  mm(
    'right-up',
    'diamond',
    'Diamond Pair',
    '#22D3EE',
    { x: 0.78, y: 0.58 },
    { x: 0.48, y: 0.22 },
    'Move RIGHT to the studio pad!',
    'Match the DIAMOND twin up center!',
    'Move up — hold the diamond match!',
  ),
];
