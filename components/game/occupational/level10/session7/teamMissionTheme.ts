/**
 * OT Level 10 · Session 7 · Game 3 — Team Mission · "Squad Adventure"
 *
 * Bold blue + gold cooperative team palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const TEAM_SHELL = {
  backText: '#93C5FD',
  backBorder: 'rgba(147,197,253,0.35)',
  statLabel: '#86EFAC',
  statValue: '#EFF6FF',
  statBorder: 'rgba(134,239,172,0.45)',
  stageBorder: 'rgba(59,130,246,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#3B82F6',
  glassBorder: 'rgba(59,130,246,0.35)',
  academyLabel: 'SOCIAL SENSORY LAB',
  rally: '#94A3B8',
  mission: '#22C55E',
} as const;

export type TeamRole = 'soccer' | 'space' | 'rescue' | 'band' | 'explorer';

export type TeamMissionRound = {
  id: string;
  role: TeamRole;
  label: string;
  emoji: string;
  color: string;
  rally: Point & { radius: number };
  mission: Point & { radius: number };
  voiceRally: string;
  voiceMission: string;
  missionCue: string;
};

export const TEAM_MISSION_THEME = {
  title: 'Team Mission',
  subtitle: 'Rally with your squad at each team point — then complete the mission with calm posture and steady attention!',
  emoji: '🤝',
  hero: '🏆',
  accent: '#3B82F6',
  accentGreen: '#22C55E',
  glow: 'rgba(59,130,246,0.5)',
  bgGradient: ['#0F172A', '#1E3A8A', '#14532D', '#713F12'] as [string, string, string, string],
  decor: ['🤝', '🏆', '⚽', '🚀', '🚒', '🎵', '🧭', '⭐'],
  hintText: 'Rally with your team — then complete each mission with steady body and attention!',
  positionCue: 'Face the camera so we can track your team mission adventure.',
  rallyLabel: 'RALLY UP!',
  missionLabel: 'MISSION!',
  holdRallyLabel: 'TEAM RALLY!',
  holdMissionLabel: 'MISSION HOLD!',
  voiceIntro:
    'Welcome to Team Mission! Each round you rally with your squad — then complete the team mission with calm posture and steady attention.',
  voiceComplete: 'Mission accomplished! You completed every team challenge like a social sensory champion!',
  congrats: 'Team Mission Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const tm = (
  id: string,
  role: TeamRole,
  label: string,
  emoji: string,
  color: string,
  rally: Point,
  mission: Point,
  voiceRally: string,
  voiceMission: string,
  missionCue: string,
): TeamMissionRound => ({
  id,
  role,
  label,
  emoji,
  color,
  rally: { ...rally, radius: 0.105 },
  mission: { ...mission, radius: 0.1 },
  voiceRally,
  voiceMission,
  missionCue,
});

export const TEAM_MISSION_ROUNDS: TeamMissionRound[] = [
  tm(
    'soccer',
    'soccer',
    'Soccer Squad',
    '⚽',
    '#22C55E',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Rally LEFT — join the soccer squad!',
    'Mission hold! Team goal with calm body!',
    'Goal scored — great teamwork!',
  ),
  tm(
    'space',
    'space',
    'Space Crew',
    '🚀',
    '#38BDF8',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'Rally RIGHT — join the space crew!',
    'Mission hold! Steady crew attention!',
    'Launch ready — squad united!',
  ),
  tm(
    'rescue',
    'rescue',
    'Rescue Squad',
    '🚒',
    '#EF4444',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — rally the rescue squad!',
    'Mission hold! Brave and steady!',
    'Rescue complete — team hero!',
  ),
  tm(
    'band',
    'band',
    'Music Band',
    '🎵',
    '#A78BFA',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Rally the music band below!',
    'Mission hold! Play together with focus!',
    'Harmony hit — wonderful team!',
  ),
  tm(
    'explorer',
    'explorer',
    'Explorer Team',
    '🧭',
    '#FBBF24',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final squad — rally the explorer team!',
    'Mission hold! Champion team finish!',
    'Explorer mission — complete!',
  ),
];
