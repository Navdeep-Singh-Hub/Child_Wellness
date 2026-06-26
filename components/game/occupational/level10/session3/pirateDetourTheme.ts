/**
 * OT Level 10 · Session 3 · Game 3 — Pirate Detour · "Captain's Course Change"
 *
 * Navy sea + gold treasure + compass rose palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const PIRATE_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#7DD3FC',
  statValue: '#FFFBEB',
  statBorder: 'rgba(125,211,252,0.45)',
  stageBorder: 'rgba(234,179,8,0.55)',
  stageBg: 'rgba(12,25,41,0.78)',
  good: '#34D399',
  warn: '#F59E0B',
  gold: '#FDE68A',
  sparkleColor: '#FBBF24',
  glassBorder: 'rgba(234,179,8,0.35)',
  academyLabel: 'PIRATE ADAPT LAB',
  routeA: '#64748B',
  routeB: '#EAB308',
} as const;

export type WaypointKind = 'port' | 'starboard' | 'bow' | 'stern' | 'treasure';

export type PirateWaypoint = Point & {
  kind: WaypointKind;
  label: string;
  emoji: string;
  radius: number;
  color: string;
};

export type PirateDetourRound = {
  id: string;
  routeA: PirateWaypoint;
  routeB: PirateWaypoint;
  voiceRouteA: string;
  voiceDetour: string;
  voiceRouteB: string;
  adaptCue: string;
};

export const PIRATE_DETOUR_THEME = {
  title: 'Pirate Detour',
  subtitle: 'Sail the planned route — then adapt when the captain orders a detour to a new island!',
  emoji: '🏴‍☠️',
  hero: '⚓',
  accent: '#EAB308',
  accentNavy: '#1E3A5F',
  accentSea: '#0EA5E9',
  glow: 'rgba(234,179,8,0.5)',
  bgGradient: ['#0C1929', '#1E3A5F', '#0C4A6E', '#164E63'] as [string, string, string, string],
  decor: ['🏴‍☠️', '⚓', '🗺️', '💰', '🦜', '🌊', '⛵', '🧭'],
  hintText: "Follow the captain's route — when he calls DETOUR, sail fast to the new island!",
  positionCue: 'Face the camera so we can track your sailing movement.',
  routeLabel: 'PLANNED ROUTE',
  detourLabel: 'DETOUR!',
  adaptLabel: 'NEW COURSE!',
  holdLabel: 'ANCHOR HOLD!',
  voiceIntro:
    'Ahoy, matey! Each voyage starts on the planned route — but the captain may order a detour! Adapt your movement and sail to the new island.',
  voiceComplete: 'Shiver me timbers — you adapted every detour like a true pirate captain!',
  congrats: 'Detour Captain!',
  skillTags: [
    'adaptive-responses',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'functional-participation',
  ],
} as const;

const wp = (
  kind: WaypointKind,
  label: string,
  emoji: string,
  x: number,
  y: number,
  color: string,
): PirateWaypoint => ({
  kind,
  label,
  emoji,
  x,
  y,
  radius: 0.105,
  color,
});

export const PIRATE_DETOUR_ROUNDS: PirateDetourRound[] = [
  {
    id: 'port-starboard',
    routeA: wp('port', 'Port Cove', '🏝️', 0.18, 0.48, PIRATE_SHELL.routeA),
    routeB: wp('starboard', 'Skull Isle', '💀', 0.82, 0.48, PIRATE_SHELL.routeB),
    voiceRouteA: 'Planned route: sail to PORT COVE on the left!',
    voiceDetour: 'Detour! Captain says turn to SKULL ISLE!',
    voiceRouteB: 'New course — sail RIGHT to Skull Isle!',
    adaptCue: 'Steer starboard — reach the new island!',
  },
  {
    id: 'bow-stern',
    routeA: wp('bow', 'Bow Harbor', '⛵', 0.5, 0.2, PIRATE_SHELL.routeA),
    routeB: wp('stern', 'Hidden Lagoon', '🌊', 0.5, 0.76, PIRATE_SHELL.routeB),
    voiceRouteA: 'Set course for BOW HARBOR — sail up!',
    voiceDetour: 'Detour ahoy! Drop to the HIDDEN LAGOON!',
    voiceRouteB: 'Adapt down — sail to the lagoon!',
    adaptCue: 'Lower your course to the hidden lagoon!',
  },
  {
    id: 'treasure-port',
    routeA: wp('treasure', 'Gold Reef', '💰', 0.78, 0.38, PIRATE_SHELL.routeA),
    routeB: wp('port', 'Safe Port', '⚓', 0.22, 0.58, PIRATE_SHELL.routeB),
    voiceRouteA: 'Planned treasure run — sail to GOLD REEF!',
    voiceDetour: 'Storm detour! Head to SAFE PORT instead!',
    voiceRouteB: 'Adapt left — anchor at Safe Port!',
    adaptCue: 'Quick — sail left to Safe Port!',
  },
  {
    id: 'starboard-bow',
    routeA: wp('starboard', 'Windward Bay', '🌬️', 0.84, 0.55, PIRATE_SHELL.routeA),
    routeB: wp('bow', 'North Peak', '🗻', 0.5, 0.22, PIRATE_SHELL.routeB),
    voiceRouteA: 'Course set: sail RIGHT to Windward Bay!',
    voiceDetour: "Captain's detour — sail NORTH to the peak!",
    voiceRouteB: 'New heading up — reach North Peak!',
    adaptCue: 'Rise north to the peak island!',
  },
  {
    id: 'stern-treasure',
    routeA: wp('stern', 'South Shoals', '🪸', 0.5, 0.74, PIRATE_SHELL.routeA),
    routeB: wp('treasure', 'Treasure Bay', '🏆', 0.72, 0.42, PIRATE_SHELL.routeB),
    voiceRouteA: 'Planned route: sail DOWN to South Shoals!',
    voiceDetour: 'Treasure detour! Gold Bay is the new target!',
    voiceRouteB: 'Adapt northeast — sail to Treasure Bay!',
    adaptCue: 'Steer to Treasure Bay and hold!',
  },
];
