/**
 * OT Level 10 · Session 10 · Game 5 — ARVIT Grand Champion · "Grand Adventure Finale"
 *
 * Royal gold + adventure rainbow capstone palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const CHAMPION_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#A5F3FC',
  statValue: '#FFFBEB',
  statBorder: 'rgba(165,243,252,0.45)',
  stageBorder: 'rgba(234,179,8,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#FBBF24',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#EAB308',
  glassBorder: 'rgba(234,179,8,0.35)',
  academyLabel: 'ARVIT GRAND CHAMPION',
  explore: '#22C55E',
  integrate: '#6366F1',
  champion: '#EAB308',
} as const;

export type ChampionPhaseKind = 'explore' | 'integrate' | 'champion';

export type ArvitGrandChampionRound = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  explore: Point & { radius: number };
  integrate: Point & { radius: number };
  champion: Point & { radius: number };
  voiceExplore: string;
  voiceIntegrate: string;
  voiceChampion: string;
  integrateCue: string;
  championCue: string;
};

export const ARVIT_GRAND_CHAMPION_THEME = {
  title: 'ARVIT Grand Champion',
  subtitle: 'Explore, integrate, then champion each adventure — the ultimate sensory integration quest!',
  emoji: '👑',
  hero: '🏆',
  accent: '#EAB308',
  accentViolet: '#8B5CF6',
  glow: 'rgba(234,179,8,0.5)',
  bgGradient: ['#0F172A', '#713F12', '#312E81', '#14532D'] as [string, string, string, string],
  decor: ['👑', '🌿', '🚀', '🏴‍☠️', '🏔️', '🏆', '✨', '⭐'],
  hintText: 'Three champion steps: explore the adventure, integrate with calm body, then claim the crown!',
  positionCue: 'Face the camera — we track your grand champion adventure.',
  exploreLabel: 'EXPLORE!',
  integrateLabel: 'INTEGRATE!',
  championLabel: 'CHAMPION!',
  holdExploreLabel: 'ADVENTURE FOUND!',
  holdIntegrateLabel: 'INTEGRATE HOLD!',
  holdChampionLabel: 'CHAMPION!',
  voiceIntro:
    'Welcome to ARVIT Grand Champion! This is the ultimate sensory integration adventure. Explore each world, integrate with calm stillness, then champion the finale with steady attention.',
  voiceComplete: 'ARVIT Grand Champion! You completed every explore, integrate and champion challenge!',
  congrats: 'ARVIT Grand Champion!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const ag = (
  id: string,
  title: string,
  emoji: string,
  color: string,
  explore: Point,
  integrate: Point,
  champion: Point,
  voiceExplore: string,
  voiceIntegrate: string,
  voiceChampion: string,
  integrateCue: string,
  championCue: string,
): ArvitGrandChampionRound => ({
  id,
  title,
  emoji,
  color,
  explore: { ...explore, radius: 0.1 },
  integrate: { ...integrate, radius: 0.1 },
  champion: { ...champion, radius: 0.095 },
  voiceExplore,
  voiceIntegrate,
  voiceChampion,
  integrateCue,
  championCue,
});

export const ARVIT_GRAND_CHAMPION_ROUNDS: ArvitGrandChampionRound[] = [
  ag(
    'jungle',
    'Jungle Gateway',
    '🌿',
    '#22C55E',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.52 },
    'Step 1: EXPLORE — reach the jungle gateway on the left!',
    'Step 2: INTEGRATE — calm body in the rainforest!',
    'Step 3: CHAMPION — claim the jungle crown!',
    'Rainforest calm — integrate hold!',
    'Jungle gateway champion!',
  ),
  ag(
    'space',
    'Space Launch',
    '🚀',
    '#6366F1',
    { x: 0.76, y: 0.38 },
    { x: 0.48, y: 0.5 },
    { x: 0.52, y: 0.46 },
    'EXPLORE right — reach the space launch pad!',
    'INTEGRATE — steady body for liftoff!',
    'CHAMPION — cosmic crown!',
    'Space integrate — hold steady!',
    'Space launch champion!',
  ),
  ag(
    'pirate',
    'Pirate Cove',
    '🏴‍☠️',
    '#D97706',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.5 },
    'EXPLORE up — reach the pirate cove!',
    'INTEGRATE — pause and steady!',
    'CHAMPION the pirate quest!',
    'Cove calm — hold!',
    'Pirate cove champion!',
  ),
  ag(
    'mountain',
    'Mountain Peak',
    '🏔️',
    '#0EA5E9',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    { x: 0.48, y: 0.52 },
    'EXPLORE — go to the mountain peak!',
    'INTEGRATE — observe with calm stillness!',
    'CHAMPION the mountain rescue!',
    'Peak integrate — quiet body!',
    'Mountain peak champion!',
  ),
  ag(
    'crown',
    'ARVIT Crown',
    '👑',
    '#EAB308',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.48 },
    'Final EXPLORE — reach the ARVIT crown!',
    'INTEGRATE — calm before the finale!',
    'ARVIT GRAND CHAMPION finale — claim your crown!',
    'Crown integrate — almost there!',
    'You are an ARVIT Grand Champion!',
  ),
];
