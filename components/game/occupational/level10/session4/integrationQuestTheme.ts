/**
 * OT Level 10 · Session 4 · Game 5 — Integration Quest · "Crystal Integration Quest"
 *
 * Cosmic gold + violet quest palette — session capstone.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import type { ReachHand } from '@/components/game/occupational/level10/session4/balanceReachTheme';

export const QUEST_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  statLabel: '#FDE68A',
  statValue: '#FAF5FF',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(167,139,250,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#A78BFA',
  glassBorder: 'rgba(167,139,250,0.35)',
  academyLabel: 'INTEGRATION QUEST',
  gather: '#94A3B8',
  integrate: '#FBBF24',
  complete: '#A78BFA',
} as const;

export type QuestPhaseKind = 'gather' | 'integrate' | 'complete';

export type IntegrationQuestRound = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  hand: ReachHand;
  gather: Point & { radius: number };
  balance: Point & { radius: number };
  integrate: Point & { radius: number };
  complete: Point & { radius: number };
  voiceGather: string;
  voiceIntegrate: string;
  voiceComplete: string;
  integrateCue: string;
  completeCue: string;
};

export const INTEGRATION_QUEST_THEME = {
  title: 'Integration Quest',
  subtitle: 'Gather at the quest node — integrate balance and reach — then complete the crystal finale!',
  emoji: '🏆',
  hero: '💎',
  accent: '#A78BFA',
  accentGold: '#FBBF24',
  glow: 'rgba(167,139,250,0.5)',
  bgGradient: ['#0F172A', '#312E81', '#713F12', '#4C1D95'] as [string, string, string, string],
  decor: ['🏆', '💎', '✨', '🌟', '🔮', '⚡', '🎯', '🧭'],
  hintText: 'Three quest steps: gather, integrate balance + reach, then complete!',
  positionCue: 'Show your full body and hands — we track your integration quest.',
  gatherLabel: 'GATHER!',
  integrateLabel: 'INTEGRATE!',
  completeLabel: 'COMPLETE!',
  holdGatherLabel: 'QUEST NODE!',
  holdIntegrateLabel: 'BALANCE + REACH!',
  holdCompleteLabel: 'QUEST DONE!',
  voiceIntro:
    'Welcome to the Crystal Integration Quest! This is the ultimate sensory-motor adventure. Gather at each node, integrate your balance and reach together, then complete the crystal finale.',
  voiceComplete: 'Quest champion! You integrated every crystal challenge — sensory-motor mastery achieved!',
  congrats: 'Integration Champion!',
  skillTags: [
    'sensory-integration',
    'motor-planning',
    'self-regulation',
    'adaptive-responses',
    'functional-participation',
  ],
} as const;

const qr = (
  id: string,
  title: string,
  emoji: string,
  color: string,
  hand: ReachHand,
  gather: Point,
  balance: Point,
  integrate: Point,
  complete: Point,
  voiceGather: string,
  voiceIntegrate: string,
  voiceComplete: string,
  integrateCue: string,
  completeCue: string,
): IntegrationQuestRound => ({
  id,
  title,
  emoji,
  color,
  hand,
  gather: { ...gather, radius: 0.1 },
  balance: { ...balance, radius: 0.1 },
  integrate: { ...integrate, radius: 0.095 },
  complete: { ...complete, radius: 0.105 },
  voiceGather,
  voiceIntegrate,
  voiceComplete,
  integrateCue,
  completeCue,
});

export const INTEGRATION_QUEST_ROUNDS: IntegrationQuestRound[] = [
  qr(
    'quest-1',
    'Star Gate',
    '⭐',
    '#FBBF24',
    'left',
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.54 },
    { x: 0.22, y: 0.38 },
    { x: 0.78, y: 0.42 },
    'Quest 1: GATHER at the center star node!',
    'INTEGRATE — stay centered and reach LEFT with your hand!',
    'COMPLETE — move to the right crystal finale!',
    'Balance center + left hand reach!',
    'Glide right to the finale crystal!',
  ),
  qr(
    'quest-2',
    'Moon Bridge',
    '🌙',
    '#818CF8',
    'right',
    { x: 0.22, y: 0.48 },
    { x: 0.5, y: 0.52 },
    { x: 0.78, y: 0.45 },
    { x: 0.5, y: 0.24 },
    'GATHER at the left moon node!',
    'INTEGRATE — hold center balance and reach RIGHT!',
    'COMPLETE — rise to the top crystal!',
    'Stay steady — right hand to the orb!',
    'Reach up to complete the quest!',
  ),
  qr(
    'quest-3',
    'Sun Spire',
    '☀️',
    '#FB923C',
    'left',
    { x: 0.78, y: 0.4 },
    { x: 0.5, y: 0.5 },
    { x: 0.24, y: 0.58 },
    { x: 0.5, y: 0.74 },
    'GATHER at the right sun node!',
    'INTEGRATE — balance and reach LEFT low!',
    'COMPLETE — lower to the bottom crystal!',
    'Center steady + left reach down!',
    'Drop to the finale crystal!',
  ),
  qr(
    'quest-4',
    'Crystal Path',
    '💎',
    '#22D3EE',
    'right',
    { x: 0.5, y: 0.26 },
    { x: 0.48, y: 0.5 },
    { x: 0.76, y: 0.55 },
    { x: 0.24, y: 0.48 },
    'GATHER at the top crystal node!',
    'INTEGRATE — balance and reach RIGHT!',
    'COMPLETE — sweep left to the finale!',
    'Hold center + right hand reach!',
    'Glide left — quest almost done!',
  ),
  qr(
    'quest-5',
    'Champion Crown',
    '👑',
    '#E879F9',
    'left',
    { x: 0.35, y: 0.68 },
    { x: 0.5, y: 0.48 },
    { x: 0.68, y: 0.32 },
    { x: 0.5, y: 0.5 },
    'Final quest — GATHER at the lower node!',
    'INTEGRATE — balance center + LEFT reach high!',
    'COMPLETE — return to the crown crystal center!',
    'Final integrate — left reach up!',
    'Center crown — hold to win!',
  ),
];
