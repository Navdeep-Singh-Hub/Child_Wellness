/**
 * OT Level 8 · Session 9 — Novel Motor Challenges.
 *
 * Unfamiliar composite body moves the child has not practised in earlier
 * sessions. evalNovel() combines multiple pose signals (arm zones, lean,
 * crouch, turn, jump, clap…) into novel challenge criteria.
 */
import {
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  DEFAULT_THRESHOLDS,
  evaluateAction,
  makeStep,
} from '@/components/game/occupational/level8/motorActions';
import { classifyArms } from '@/components/game/occupational/level8/session4/poseMatch';
import { isCrossedClap } from '@/components/game/occupational/level8/session7/bilateralPlan';

export type NovelEvalKind =
  | 'alienAntenna'
  | 'alienFloat'
  | 'alienWiggle'
  | 'robotBuild'
  | 'robotFold'
  | 'robotSpin'
  | 'islandFlamingo'
  | 'islandCrab'
  | 'islandWave'
  | 'surpriseJump'
  | 'surpriseFreeze'
  | 'surpriseCross'
  | 'questAsymmetric'
  | 'questLowTurn'
  | 'questPowerClap';

export type NovelChallenge = {
  id: string;
  name: string;
  icon: string;
  teaser: string;
  kind: NovelEvalKind;
};

export type NovelEval = {
  ok: boolean;
  score: number;
  holdMs: number;
  transient: boolean;
};

export type NovelThresholds = {
  holdMs: number;
  crouchY: number;
  leanMin: number;
};

export const DEFAULT_NOVEL_THRESHOLDS: NovelThresholds = {
  holdMs: 700,
  crouchY: 0.26,
  leanMin: 0.06,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Per-frame detection for one novel composite challenge. */
export function evalNovel(
  kind: NovelEvalKind,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th: NovelThresholds = DEFAULT_NOVEL_THRESHOLDS,
): NovelEval {
  const hold = th.holdMs;
  if (!m.present) return { ok: false, score: 0, holdMs: hold, transient: false };

  const { leftZone, rightZone, ups, outs } = classifyArms(m);
  const ws = weightShift(m, base);
  const lean = Math.abs(ws.x);

  switch (kind) {
    case 'alienAntenna': {
      const ok = ups >= 2 && lean >= th.leanMin;
      const score = clamp01(0.55 * (ups / 2) + 0.45 * clamp01(lean / th.leanMin));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'alienFloat': {
      const ok = outs >= 2 && ws.y >= th.crouchY * 0.65;
      const score = clamp01(0.5 * (outs / 2) + 0.5 * clamp01(ws.y / th.crouchY));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'alienWiggle': {
      const ok = leftZone === 'out' && rightZone === 'up';
      const score = clamp01(
        (leftZone === 'out' ? 0.5 : 0.1) + (rightZone === 'up' ? 0.5 : rightZone === 'out' ? 0.25 : 0),
      );
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'robotBuild': {
      const ev = evaluateAction(makeStep('launch'), m, prev, base, null, DEFAULT_THRESHOLDS);
      return { ok: ev.ok, score: ev.approach, holdMs: ev.holdMs || hold, transient: false };
    }
    case 'robotFold': {
      const armsLow = (leftZone === 'down' || leftZone === 'out') && (rightZone === 'down' || rightZone === 'out');
      const ok = armsLow && ws.y >= th.crouchY;
      const score = clamp01(0.55 * (armsLow ? 1 : 0.3) + 0.45 * clamp01(ws.y / th.crouchY));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'robotSpin': {
      const turn = evaluateAction(makeStep('turn'), m, prev, base, null, DEFAULT_THRESHOLDS);
      const ok = turn.ok && outs >= 1;
      const score = clamp01(0.6 * turn.approach + 0.4 * (outs / 2));
      return { ok, score, holdMs: turn.holdMs || hold, transient: false };
    }
    case 'islandFlamingo': {
      const ok =
        (leftZone === 'up' && rightZone === 'down') || (leftZone === 'down' && rightZone === 'up');
      const score = clamp01(
        0.5 * (leftZone === 'up' || leftZone === 'down' ? 0.8 : 0.2) +
          0.5 * (rightZone === 'up' || rightZone === 'down' ? 0.8 : 0.2),
      );
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'islandCrab': {
      const ok = outs >= 2 && ws.y >= th.crouchY * 0.55;
      const score = clamp01(0.5 * (outs / 2) + 0.5 * clamp01(ws.y / th.crouchY));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'islandWave': {
      const ok = ups >= 1 && outs >= 1 && lean >= th.leanMin * 0.8;
      const score = clamp01(0.4 * (ups / 2) + 0.35 * (outs / 2) + 0.25 * clamp01(lean / th.leanMin));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'surpriseJump': {
      const ev = evaluateAction(makeStep('jump'), m, prev, base, null, DEFAULT_THRESHOLDS);
      return { ok: ev.ok, score: ev.approach, holdMs: 0, transient: true };
    }
    case 'surpriseFreeze': {
      const ev = evaluateAction(makeStep('freeze'), m, prev, base, null, DEFAULT_THRESHOLDS);
      return { ok: ev.ok, score: ev.approach, holdMs: ev.holdMs || hold, transient: false };
    }
    case 'surpriseCross': {
      const clap = evaluateAction(makeStep('clap'), m, prev, base, null, DEFAULT_THRESHOLDS);
      const ok = clap.ok && isCrossedClap(m);
      return { ok, score: ok ? clap.approach : clap.approach * 0.5, holdMs: clap.holdMs || hold, transient: false };
    }
    case 'questAsymmetric': {
      const ok = leftZone === 'up' && rightZone === 'out';
      const score = clamp01((leftZone === 'up' ? 0.5 : 0.1) + (rightZone === 'out' ? 0.5 : rightZone === 'up' ? 0.25 : 0));
      return { ok, score, holdMs: hold, transient: false };
    }
    case 'questLowTurn': {
      const turn = evaluateAction(makeStep('turn'), m, prev, base, null, DEFAULT_THRESHOLDS);
      const low = leftZone === 'down' || rightZone === 'down';
      const ok = turn.ok && low;
      const score = clamp01(0.55 * turn.approach + 0.45 * (low ? 1 : 0.3));
      return { ok, score, holdMs: turn.holdMs || hold, transient: false };
    }
    case 'questPowerClap': {
      const clap = evaluateAction(makeStep('clap'), m, prev, base, null, DEFAULT_THRESHOLDS);
      const ok = clap.ok && ups >= 1;
      const score = clamp01(0.6 * clap.approach + 0.4 * (ups / 2));
      return { ok, score, holdMs: clap.holdMs || hold, transient: false };
    }
    default:
      return { ok: false, score: 0, holdMs: hold, transient: false };
  }
}
