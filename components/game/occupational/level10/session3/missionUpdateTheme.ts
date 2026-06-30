/**
 * OT Level 10 · Session 3 · Game 4 — Mission Update · "Command Beacon Relay"
 *
 * Deep space indigo + cyan HUD + amber alert palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const MISSION_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.35)',
  statLabel: '#C4B5FD',
  statValue: '#F0F9FF',
  statBorder: 'rgba(196,181,253,0.45)',
  stageBorder: 'rgba(56,189,248,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#34D399',
  warn: '#F59E0B',
  gold: '#FDE68A',
  sparkleColor: '#38BDF8',
  glassBorder: 'rgba(56,189,248,0.35)',
  academyLabel: 'MISSION ADAPT LAB',
  missionA: '#64748B',
  missionB: '#38BDF8',
} as const;

export type BeaconKind = 'relay' | 'satellite' | 'depot' | 'scanner' | 'portal';

export type MissionBeacon = Point & {
  kind: BeaconKind;
  label: string;
  icon: string;
  radius: number;
  color: string;
};

export type MissionUpdateRound = {
  id: string;
  missionA: MissionBeacon;
  missionB: MissionBeacon;
  voiceMissionA: string;
  voiceUpdate: string;
  voiceMissionB: string;
  adaptCue: string;
};

export const MISSION_UPDATE_THEME = {
  title: 'Mission Update',
  subtitle: 'Complete Mission A — then adapt fast when command sends a mission update to Beacon B!',
  emoji: '📡',
  hero: '🛰️',
  accent: '#38BDF8',
  accentIndigo: '#6366F1',
  accentAlert: '#F59E0B',
  glow: 'rgba(56,189,248,0.5)',
  bgGradient: ['#0F172A', '#1E1B4B', '#0C4A6E', '#312E81'] as [string, string, string, string],
  decor: ['📡', '🛰️', '🚀', '✨', '🌌', '⚡', '🔭', '🎯'],
  hintText: 'Follow the mission brief — when command sends an UPDATE, redirect to the new beacon!',
  positionCue: 'Face the camera so we can track your mission movement.',
  missionLabel: 'MISSION A',
  updateLabel: 'MISSION UPDATE!',
  adaptLabel: 'NEW OBJECTIVE!',
  holdLabel: 'LOCK ON!',
  voiceIntro:
    'Welcome to Command Beacon Relay! Each round starts with Mission A — but command may send a live update. Adapt your movement and reach the new beacon.',
  voiceComplete: 'Outstanding! You adapted every mission update like a true space commander!',
  congrats: 'Mission Adapter!',
  skillTags: [
    'adaptive-responses',
    'motor-planning',
    'sensory-integration',
    'attention',
    'functional-participation',
  ],
} as const;

const beacon = (
  kind: BeaconKind,
  label: string,
  icon: string,
  x: number,
  y: number,
  color: string,
): MissionBeacon => ({
  kind,
  label,
  icon,
  x,
  y,
  radius: 0.105,
  color,
});

export const MISSION_UPDATE_ROUNDS: MissionUpdateRound[] = [
  {
    id: 'relay-satellite',
    missionA: beacon('relay', 'Relay Alpha', '📡', 0.18, 0.48, MISSION_SHELL.missionA),
    missionB: beacon('satellite', 'Sat Beta', '🛰️', 0.82, 0.48, MISSION_SHELL.missionB),
    voiceMissionA: 'Mission A: move to RELAY ALPHA on the left!',
    voiceUpdate: 'Mission update! New target — SAT BETA on the right!',
    voiceMissionB: 'Adapt right — reach Satellite Beta!',
    adaptCue: 'Redirect right to the new beacon!',
  },
  {
    id: 'scanner-depot',
    missionA: beacon('scanner', 'Scan Point', '🔭', 0.5, 0.2, MISSION_SHELL.missionA),
    missionB: beacon('depot', 'Supply Depot', '📦', 0.5, 0.76, MISSION_SHELL.missionB),
    voiceMissionA: 'Mission A: reach SCAN POINT up top!',
    voiceUpdate: 'Update received! Head to SUPPLY DEPOT below!',
    voiceMissionB: 'Adapt down — sail to the depot beacon!',
    adaptCue: 'Lower your course to Supply Depot!',
  },
  {
    id: 'portal-relay',
    missionA: beacon('portal', 'Portal Gate', '🌀', 0.78, 0.38, MISSION_SHELL.missionA),
    missionB: beacon('relay', 'Relay Gamma', '📡', 0.22, 0.58, MISSION_SHELL.missionB),
    voiceMissionA: 'Mission A: approach PORTAL GATE!',
    voiceUpdate: 'Emergency update! Relay Gamma is the new target!',
    voiceMissionB: 'Adapt left — lock on Relay Gamma!',
    adaptCue: 'Quick — move left to Relay Gamma!',
  },
  {
    id: 'depot-portal',
    missionA: beacon('depot', 'Cargo Bay', '📦', 0.84, 0.55, MISSION_SHELL.missionA),
    missionB: beacon('portal', 'Star Portal', '✨', 0.5, 0.22, MISSION_SHELL.missionB),
    voiceMissionA: 'Mission A: move RIGHT to Cargo Bay!',
    voiceUpdate: 'Mission update! Star Portal is active — go UP!',
    voiceMissionB: 'New objective up — reach Star Portal!',
    adaptCue: 'Rise to the Star Portal beacon!',
  },
  {
    id: 'satellite-scanner',
    missionA: beacon('satellite', 'Orbit Node', '🛰️', 0.5, 0.74, MISSION_SHELL.missionA),
    missionB: beacon('scanner', 'Deep Scan', '🔭', 0.72, 0.42, MISSION_SHELL.missionB),
    voiceMissionA: 'Mission A: descend to ORBIT NODE!',
    voiceUpdate: 'Intel update! Deep Scan beacon is live!',
    voiceMissionB: 'Adapt northeast — reach Deep Scan!',
    adaptCue: 'Steer to Deep Scan and lock on!',
  },
];
