/**
 * OT Level 10 · Session 9 · Game 5 — Community Explorer · "Neighborhood Quest"
 *
 * Violet + teal community palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const COMMUNITY_SHELL = {
  backText: '#DDD6FE',
  backBorder: 'rgba(221,214,254,0.35)',
  statLabel: '#5EEAD4',
  statValue: '#FAF5FF',
  statBorder: 'rgba(94,234,212,0.45)',
  stageBorder: 'rgba(139,92,246,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#A78BFA',
  warn: '#FB7185',
  gold: '#5EEAD4',
  sparkleColor: '#8B5CF6',
  glassBorder: 'rgba(139,92,246,0.35)',
  academyLabel: 'REAL-LIFE LAB',
  visit: '#94A3B8',
  join: '#14B8A6',
} as const;

export type CommunityPlace = 'library' | 'garden' | 'townhall' | 'market' | 'neighborhood';

export type CommunityExplorerRound = {
  id: string;
  place: CommunityPlace;
  label: string;
  emoji: string;
  color: string;
  visit: Point & { radius: number };
  join: Point & { radius: number };
  voiceVisit: string;
  voiceJoin: string;
  joinCue: string;
};

export const COMMUNITY_EXPLORER_THEME = {
  title: 'Community Explorer',
  subtitle: 'Visit each community place — then join in with calm posture, attention and a steady hold!',
  emoji: '🏘️',
  hero: '🤝',
  accent: '#8B5CF6',
  accentTeal: '#14B8A6',
  glow: 'rgba(139,92,246,0.5)',
  bgGradient: ['#0F172A', '#4C1D95', '#134E4A', '#1E3A8A'] as [string, string, string, string],
  decor: ['🏘️', '📚', '🌻', '🏛️', '🥕', '🤝', '⭐', '🌳'],
  hintText: 'Visit each place — then join in with steady body and attention!',
  positionCue: 'Face the camera so we can track your community adventure.',
  visitLabel: 'VISIT!',
  joinLabel: 'JOIN IN!',
  holdVisitLabel: 'PLACE FOUND!',
  holdJoinLabel: 'GREAT JOIN!',
  voiceIntro:
    'Welcome to Community Explorer! Each round you visit a community place — then join in with calm posture and steady attention.',
  voiceComplete: 'Community explorer complete! You joined every place like a real-life sensory champion!',
  congrats: 'Community Explorer Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const ce = (
  id: string,
  place: CommunityPlace,
  label: string,
  emoji: string,
  color: string,
  visit: Point,
  join: Point,
  voiceVisit: string,
  voiceJoin: string,
  joinCue: string,
): CommunityExplorerRound => ({
  id,
  place,
  label,
  emoji,
  color,
  visit: { ...visit, radius: 0.105 },
  join: { ...join, radius: 0.1 },
  voiceVisit,
  voiceJoin,
  joinCue,
});

export const COMMUNITY_EXPLORER_ROUNDS: CommunityExplorerRound[] = [
  ce(
    'library',
    'library',
    'Library',
    '📚',
    '#38BDF8',
    { x: 0.26, y: 0.4 },
    { x: 0.5, y: 0.5 },
    'VISIT LEFT — find the library!',
    'JOIN hold! Calm reading time!',
    'Library visit — wonderful focus!',
  ),
  ce(
    'garden',
    'garden',
    'Community Garden',
    '🌻',
    '#FBBF24',
    { x: 0.74, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'VISIT RIGHT — reach the community garden!',
    'JOIN hold! Steady garden fun!',
    'Garden joined — great participation!',
  ),
  ce(
    'townhall',
    'townhall',
    'Town Hall',
    '🏛️',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — visit the town hall!',
    'JOIN hold! Calm community spirit!',
    'Town hall — smart community join!',
  ),
  ce(
    'market',
    'market',
    'Farmers Market',
    '🥕',
    '#F97316',
    { x: 0.3, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'VISIT the farmers market below!',
    'JOIN hold! Calm market fun!',
    'Market calm — steady body!',
  ),
  ce(
    'neighborhood',
    'neighborhood',
    'Neighborhood',
    '⭐',
    '#14B8A6',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final place — visit your neighborhood!',
    'JOIN hold! Champion community star!',
    'Neighborhood joined — explorer complete!',
  ),
];
