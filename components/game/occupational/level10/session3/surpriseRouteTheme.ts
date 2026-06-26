/**
 * OT Level 10 · Session 3 · Game 5 — Surprise Route · "Trail Fork Adventure"
 *
 * Forest emerald + violet mist + golden surprise palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const ROUTE_SHELL = {
  backText: '#D9F99D',
  backBorder: 'rgba(217,249,157,0.35)',
  statLabel: '#C4B5FD',
  statValue: '#F7FEE7',
  statBorder: 'rgba(196,181,253,0.45)',
  stageBorder: 'rgba(52,211,153,0.55)',
  stageBg: 'rgba(20,33,28,0.8)',
  good: '#34D399',
  warn: '#F472B6',
  gold: '#FDE68A',
  sparkleColor: '#A78BFA',
  glassBorder: 'rgba(52,211,153,0.35)',
  academyLabel: 'SURPRISE ADAPT LAB',
  routeA: '#78716C',
  routeB: '#A78BFA',
} as const;

export type TrailKind = 'meadow' | 'creek' | 'ridge' | 'grove' | 'clearing';

export type TrailMarker = Point & {
  kind: TrailKind;
  label: string;
  emoji: string;
  radius: number;
  color: string;
};

export type SurpriseRouteRound = {
  id: string;
  routeA: TrailMarker;
  routeB: TrailMarker;
  voiceRouteA: string;
  voiceSurprise: string;
  voiceRouteB: string;
  adaptCue: string;
};

export const SURPRISE_ROUTE_THEME = {
  title: 'Surprise Route',
  subtitle: 'Follow the planned trail — then adapt when a surprise fork appears and take the new path!',
  emoji: '🌿',
  hero: '🦋',
  accent: '#34D399',
  accentViolet: '#A78BFA',
  accentPink: '#F472B6',
  glow: 'rgba(52,211,153,0.5)',
  bgGradient: ['#14532D', '#1E1B4B', '#134E4A', '#4C1D95'] as [string, string, string, string],
  decor: ['🌿', '🦋', '🌸', '🪨', '🌈', '🍃', '🌲', '✨'],
  hintText: 'Walk the planned route — when a SURPRISE fork appears, adapt and take the new trail!',
  positionCue: 'Face the camera so we can track your trail movement.',
  routeLabel: 'PLANNED ROUTE',
  surpriseLabel: 'SURPRISE ROUTE!',
  adaptLabel: 'NEW PATH!',
  holdLabel: 'TRAIL HOLD!',
  voiceIntro:
    'Welcome to Trail Fork Adventure! Each hike starts on the planned route — but surprise forks can appear! Adapt your movement and reach the new trail marker.',
  voiceComplete: 'Amazing! You adapted every surprise route like a true trail explorer!',
  congrats: 'Trail Adapter!',
  skillTags: [
    'adaptive-responses',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'functional-participation',
  ],
} as const;

const marker = (
  kind: TrailKind,
  label: string,
  emoji: string,
  x: number,
  y: number,
  color: string,
): TrailMarker => ({
  kind,
  label,
  emoji,
  x,
  y,
  radius: 0.105,
  color,
});

export const SURPRISE_ROUTE_ROUNDS: SurpriseRouteRound[] = [
  {
    id: 'meadow-grove',
    routeA: marker('meadow', 'Meadow Path', '🌸', 0.18, 0.48, ROUTE_SHELL.routeA),
    routeB: marker('grove', 'Secret Grove', '🌲', 0.82, 0.48, ROUTE_SHELL.routeB),
    voiceRouteA: 'Planned route: walk LEFT to Meadow Path!',
    voiceSurprise: 'Surprise fork! The new path is Secret Grove on the right!',
    voiceRouteB: 'Adapt right — take the grove trail!',
    adaptCue: 'Steer right to Secret Grove!',
  },
  {
    id: 'ridge-creek',
    routeA: marker('ridge', 'Ridge Trail', '⛰️', 0.5, 0.2, ROUTE_SHELL.routeA),
    routeB: marker('creek', 'Creek Bend', '🌊', 0.5, 0.76, ROUTE_SHELL.routeB),
    voiceRouteA: 'Planned route: climb UP to Ridge Trail!',
    voiceSurprise: 'Surprise route! Creek Bend is the new path below!',
    voiceRouteB: 'Adapt down — follow Creek Bend!',
    adaptCue: 'Lower your path to Creek Bend!',
  },
  {
    id: 'clearing-meadow',
    routeA: marker('clearing', 'Sun Clearing', '☀️', 0.78, 0.38, ROUTE_SHELL.routeA),
    routeB: marker('meadow', 'Butterfly Meadow', '🦋', 0.22, 0.58, ROUTE_SHELL.routeB),
    voiceRouteA: 'Planned route: head to Sun Clearing!',
    voiceSurprise: 'Fork surprise! Butterfly Meadow is left!',
    voiceRouteB: 'Adapt left — reach Butterfly Meadow!',
    adaptCue: 'Quick — walk left to the meadow!',
  },
  {
    id: 'grove-ridge',
    routeA: marker('grove', 'Pine Grove', '🌲', 0.84, 0.55, ROUTE_SHELL.routeA),
    routeB: marker('ridge', 'Rainbow Ridge', '🌈', 0.5, 0.22, ROUTE_SHELL.routeB),
    voiceRouteA: 'Planned route: walk RIGHT to Pine Grove!',
    voiceSurprise: 'Surprise fork! Rainbow Ridge is up ahead!',
    voiceRouteB: 'New path up — reach Rainbow Ridge!',
    adaptCue: 'Rise to Rainbow Ridge!',
  },
  {
    id: 'creek-clearing',
    routeA: marker('creek', 'Moss Creek', '🪨', 0.5, 0.74, ROUTE_SHELL.routeA),
    routeB: marker('clearing', 'Star Clearing', '✨', 0.72, 0.42, ROUTE_SHELL.routeB),
    voiceRouteA: 'Planned route: descend to Moss Creek!',
    voiceSurprise: 'Surprise route! Star Clearing is the new fork!',
    voiceRouteB: 'Adapt northeast — reach Star Clearing!',
    adaptCue: 'Steer to Star Clearing and hold!',
  },
];
