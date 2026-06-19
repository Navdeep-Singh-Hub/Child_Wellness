/**
 * OT Level 8 — shared movement primitives for the Motor Planning sessions.
 *
 * A "step" is one body action the child must perform. Steps are either TARGETED
 * (reach/touch/pick/place a screen anchor) or GESTURES (clap, jump, turn, freeze,
 * launch, catch). evaluateAction() turns the current pose frame into a per-step
 * detection result the game engines use to confirm a planned movement.
 */
import {
  centerOfMass,
  frameMotionFull,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

export type Anchor = { x: number; y: number };

export type ActionKind =
  | 'reach'
  | 'touch'
  | 'pick'
  | 'place'
  | 'clap'
  | 'jump'
  | 'turn'
  | 'freeze'
  | 'launch'
  | 'catch';

export type Step = {
  kind: ActionKind;
  label: string;
  icon: string;
  targeted: boolean;
  anchor?: Anchor | null;
  /** Optional accent override (e.g. rainbow targets). */
  color?: string;
};

export type StepEval = {
  ok: boolean;
  approach: number; // 0..1 visual progress toward meeting the condition
  transient: boolean; // true = momentary (no hold), e.g. jump
  holdMs: number;
  probe: Anchor | null; // on-screen point of the tracked hand/body (for cursor)
  dist: number;
};

export type ActionThresholds = {
  reachRadius: number;
  reachHoldMs: number;
  clapDist: number;
  clapHoldMs: number;
  clapMinY: number;
  clapMaxY: number;
  jumpRise: number;
  turnShrinkRatio: number;
  turnHoldMs: number;
  freezeHoldMs: number;
  freezeMotionMax: number;
  launchY: number;
  launchHoldMs: number;
  catchDist: number;
  catchMinY: number;
  catchMaxY: number;
  catchHoldMs: number;
};

export const DEFAULT_THRESHOLDS: ActionThresholds = {
  reachRadius: 0.17,
  reachHoldMs: 300,
  clapDist: 0.16,
  clapHoldMs: 200,
  clapMinY: 0.32,
  clapMaxY: 0.7,
  jumpRise: 0.05,
  turnShrinkRatio: 0.74,
  turnHoldMs: 260,
  freezeHoldMs: 1000,
  freezeMotionMax: 0.05,
  launchY: 0.32,
  launchHoldMs: 220,
  catchDist: 0.18,
  catchMinY: 0.4,
  catchMaxY: 0.66,
  catchHoldMs: 200,
};

export const DEFAULT_LABELS: Record<ActionKind, { label: string; icon: string }> = {
  reach: { label: 'Reach', icon: '⭐' },
  touch: { label: 'Touch', icon: '🎯' },
  pick: { label: 'Pick', icon: '📦' },
  place: { label: 'Place', icon: '📥' },
  clap: { label: 'Clap', icon: '👏' },
  jump: { label: 'Jump', icon: '🦘' },
  turn: { label: 'Turn', icon: '🌀' },
  freeze: { label: 'Freeze', icon: '🧊' },
  launch: { label: 'Launch', icon: '🙌' },
  catch: { label: 'Catch', icon: '🧤' },
};

const TARGETED_KINDS: ActionKind[] = ['reach', 'touch', 'pick', 'place'];
export const isTargeted = (kind: ActionKind): boolean => TARGETED_KINDS.includes(kind);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const dist = (a: Anchor, b: Anchor) => Math.hypot(a.x - b.x, a.y - b.y);

/** Mirror wrist x to match the selfie preview the child sees. */
export const wristScreens = (m: PostureMetrics): Anchor[] => {
  const out: Anchor[] = [];
  if (m.leftWrist) out.push({ x: 1 - m.leftWrist.x, y: m.leftWrist.y });
  if (m.rightWrist) out.push({ x: 1 - m.rightWrist.x, y: m.rightWrist.y });
  return out;
};

/** Build a Step from a kind + optional anchor/label override/color. */
export function makeStep(
  kind: ActionKind,
  anchor?: Anchor | null,
  override?: { label?: string; icon?: string },
  color?: string,
): Step {
  const base = DEFAULT_LABELS[kind];
  return {
    kind,
    label: override?.label ?? base.label,
    icon: override?.icon ?? base.icon,
    targeted: isTargeted(kind),
    anchor: anchor ?? null,
    color,
  };
}

/** Per-frame detection of one step. */
export function evaluateAction(
  step: Step,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  anchor: Anchor | null,
  th: ActionThresholds = DEFAULT_THRESHOLDS,
): StepEval {
  const ws = wristScreens(m);
  switch (step.kind) {
    case 'reach':
    case 'touch':
    case 'pick':
    case 'place': {
      let probe: Anchor | null = null;
      let d = 1;
      if (anchor) {
        for (const w of ws) {
          const wd = dist(w, anchor);
          if (wd < d) {
            d = wd;
            probe = w;
          }
        }
      }
      return {
        ok: probe !== null && d <= th.reachRadius,
        approach: clamp01(1 - d / (th.reachRadius * 1.6)),
        transient: false,
        holdMs: th.reachHoldMs,
        probe,
        dist: d,
      };
    }
    case 'clap': {
      if (!m.leftWrist || !m.rightWrist)
        return { ok: false, approach: 0, transient: false, holdMs: th.clapHoldMs, probe: null, dist: 1 };
      const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
      const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
      const wd = dist(lw, rw);
      const cy = (lw.y + rw.y) / 2;
      return {
        ok: wd <= th.clapDist && cy >= th.clapMinY && cy <= th.clapMaxY,
        approach: clamp01(1 - (wd - th.clapDist) / 0.25),
        transient: false,
        holdMs: th.clapHoldMs,
        probe: null,
        dist: wd,
      };
    }
    case 'jump': {
      const com = centerOfMass(m);
      const rise = base.comY - com.y;
      return {
        ok: rise >= th.jumpRise,
        approach: clamp01(rise / th.jumpRise),
        transient: true,
        holdMs: 0,
        probe: null,
        dist: 1,
      };
    }
    case 'turn': {
      const ratio = m.shoulderWidth / Math.max(0.08, base.shoulderWidthBase);
      return {
        ok: ratio <= th.turnShrinkRatio,
        approach: clamp01((1 - ratio) / (1 - th.turnShrinkRatio)),
        transient: false,
        holdMs: th.turnHoldMs,
        probe: null,
        dist: 1,
      };
    }
    case 'freeze': {
      const motion = frameMotionFull(prev, m, true);
      return {
        ok: m.present && motion <= th.freezeMotionMax,
        approach: clamp01(1 - motion / (th.freezeMotionMax * 2)),
        transient: false,
        holdMs: th.freezeHoldMs,
        probe: null,
        dist: 1,
      };
    }
    case 'launch': {
      if (!m.leftWrist || !m.rightWrist)
        return { ok: false, approach: 0, transient: false, holdMs: th.launchHoldMs, probe: null, dist: 1 };
      const ly = m.leftWrist.y;
      const ry = m.rightWrist.y;
      return {
        ok: ly <= th.launchY && ry <= th.launchY,
        approach: clamp01(1 - (Math.max(ly, ry) - th.launchY) / 0.4),
        transient: false,
        holdMs: th.launchHoldMs,
        probe: null,
        dist: 1,
      };
    }
    case 'catch': {
      if (!m.leftWrist || !m.rightWrist)
        return { ok: false, approach: 0, transient: false, holdMs: th.catchHoldMs, probe: null, dist: 1 };
      const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
      const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
      const wd = dist(lw, rw);
      const cy = (lw.y + rw.y) / 2;
      return {
        ok: wd <= th.catchDist && cy >= th.catchMinY && cy <= th.catchMaxY,
        approach: clamp01(1 - (wd - th.catchDist) / 0.25),
        transient: false,
        holdMs: th.catchHoldMs,
        probe: null,
        dist: wd,
      };
    }
    default:
      return { ok: false, approach: 0, transient: false, holdMs: th.reachHoldMs, probe: null, dist: 1 };
  }
}
