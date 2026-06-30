/**
 * OT Level 10 · Session 7 · Game 5 — Social Explorer · "Social Adventure Capstone"
 *
 * Warm rainbow social sensory capstone palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SOCIAL_EXPLORER_SHELL = {
  backText: '#FED7AA',
  backBorder: 'rgba(254,215,170,0.35)',
  statLabel: '#A7F3D0',
  statValue: '#FFFBEB',
  statBorder: 'rgba(167,243,208,0.45)',
  stageBorder: 'rgba(251,146,60,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#FB923C',
  glassBorder: 'rgba(251,146,60,0.35)',
  academyLabel: 'SOCIAL EXPLORER',
  explore: '#38BDF8',
  connect: '#F472B6',
  social: '#FBBF24',
} as const;

export type SocialPhaseKind = 'explore' | 'connect' | 'social';

export type SocialExplorerRound = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  explore: Point & { radius: number };
  connect: Point & { radius: number };
  social: Point & { radius: number };
  voiceExplore: string;
  voiceConnect: string;
  voiceSocial: string;
  connectCue: string;
  socialCue: string;
};

export const SOCIAL_EXPLORER_THEME = {
  title: 'Social Explorer',
  subtitle: 'Explore, connect, then social master each adventure — the ultimate social sensory quest!',
  emoji: '🌍',
  hero: '🌟',
  accent: '#FB923C',
  accentGold: '#FBBF24',
  glow: 'rgba(251,146,60,0.5)',
  bgGradient: ['#0F172A', '#7C2D12', '#831843', '#134E4A'] as [string, string, string, string],
  decor: ['🌍', '🌟', '👋', '😊', '🤝', '💫', '🤗', '🗺️'],
  hintText: 'Three social steps: explore, connect calm, then social master the finale!',
  positionCue: 'Face the camera — we track your social explorer adventure.',
  exploreLabel: 'EXPLORE!',
  connectLabel: 'CONNECT!',
  socialLabel: 'SOCIAL!',
  holdExploreLabel: 'EXPLORE NODE!',
  holdConnectLabel: 'CONNECT HOLD!',
  holdSocialLabel: 'SOCIAL STAR!',
  voiceIntro:
    'Welcome to Social Explorer! This is the ultimate social sensory adventure. Explore each node, connect with calm stillness, then social master the finale with steady attention.',
  voiceComplete: 'Social Explorer champion! You completed every explore, connect and social challenge!',
  congrats: 'Social Explorer Champion!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const se = (
  id: string,
  title: string,
  emoji: string,
  color: string,
  explore: Point,
  connect: Point,
  social: Point,
  voiceExplore: string,
  voiceConnect: string,
  voiceSocial: string,
  connectCue: string,
  socialCue: string,
): SocialExplorerRound => ({
  id,
  title,
  emoji,
  color,
  explore: { ...explore, radius: 0.1 },
  connect: { ...connect, radius: 0.1 },
  social: { ...social, radius: 0.095 },
  voiceExplore,
  voiceConnect,
  voiceSocial,
  connectCue,
  socialCue,
});

export const SOCIAL_EXPLORER_ROUNDS: SocialExplorerRound[] = [
  se(
    'hello',
    'Hello Gate',
    '👋',
    '#FB923C',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.52 },
    'Step 1: EXPLORE — go to the hello gate on the left!',
    'Step 2: CONNECT — greet with calm still body!',
    'Step 3: SOCIAL — hold friendly social focus!',
    'Hello calm — connect hold!',
    'Hello gate explored!',
  ),
  se(
    'feeling',
    'Feeling Bridge',
    '😊',
    '#2DD4BF',
    { x: 0.76, y: 0.38 },
    { x: 0.48, y: 0.5 },
    { x: 0.52, y: 0.46 },
    'EXPLORE right — reach the feeling bridge!',
    'CONNECT — match emotion with calm body!',
    'SOCIAL — hold emotion social focus!',
    'Feeling bridge — steady!',
    'Feeling bridge mastered!',
  ),
  se(
    'squad',
    'Squad Circle',
    '🤝',
    '#3B82F6',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.5 },
    'EXPLORE up — find the squad circle!',
    'CONNECT — team calm at the circle!',
    'SOCIAL master the squad challenge!',
    'Squad calm — hold together!',
    'Squad circle complete!',
  ),
  se(
    'friend',
    'Friend Star',
    '💫',
    '#A78BFA',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    { x: 0.48, y: 0.52 },
    'EXPLORE — go to the friend star!',
    'CONNECT — bond with calm stillness!',
    'SOCIAL the friend star!',
    'Friend bond — quiet body!',
    'Friend star mastered!',
  ),
  se(
    'crown',
    'Social Crown',
    '🌟',
    '#FBBF24',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.48 },
    'Final EXPLORE — reach the social crown!',
    'CONNECT — calm before social mastery!',
    'SOCIAL EXPLORER finale — champion hold!',
    'Crown calm — almost there!',
    'You are a Social Explorer!',
  ),
];
