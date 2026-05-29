/**
 * Level 6 — unified mouth-target detection hook.
 *
 * One camera, one frame processor, many targets. The active `target` decides which
 * existing Level-5 detection engine drives the matchLevel:
 *   - aaa / open       -> jaw open ratio (Math.max(0.08, j.ratio))
 *   - ooo / round      -> LipRoundnessEngine (height/width ratio)
 *   - eee / spread / smile -> LipSpreadEngine (width/height + smile)
 *   - mm / closed      -> LipDetectionEngine (closed lip gap)
 *   - ma / pa / ba     -> 1 close->open pulse within ~1500 ms
 *   - mama / papa / baba -> 2 close->open pulses within ~2500 ms
 *   - oo-ee / ee-oo    -> LipTransitionEngine ordered pose sequence
 *   - face_present     -> face detected only
 *
 * Output is intentionally minimal so Level 6 game UIs only need to read
 * `matchLevel`, `score`, `holdMs`, `pulses` + the standard camera fields.
 */

import { LipDetectionEngine } from '@/components/game/speech/lip-closure/modules/LipDetectionEngine';
import { LipRoundnessEngine } from '@/components/game/speech/lip-closure/modules/LipRoundnessEngine';
import { LipSpreadEngine } from '@/components/game/speech/lip-closure/modules/LipSpreadEngine';
import {
  LipTransitionEngine,
  TransitionSequenceTracker,
} from '@/components/game/speech/lip-closure/modules/LipTransitionEngine';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useNativeLipPoll } from '@/hooks/useNativeLipPoll';
import { getLevel6Calibration, type Level6Calibration } from '@/utils/level6Settings';
import { recordLevel6Match, recordLevel6Partial } from '@/utils/level6Telemetry';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type Level6Target =
  | 'face_present'
  | 'aaa'
  | 'ooo'
  | 'eee'
  | 'mm'
  | 'open'
  | 'closed'
  | 'smile'
  | 'neutral'
  | 'ma'
  | 'pa'
  | 'ba'
  | 'mama'
  | 'papa'
  | 'baba'
  | 'oo-ee'
  | 'ee-oo';

export type Level6MatchLevel = 'none' | 'partial' | 'match';

export interface Level6Snapshot {
  matchLevel: Level6MatchLevel;
  score: number;
  holdMs: number;
  pulses: number;
  unstable: boolean;
  isDetecting: boolean;
  hasCamera: boolean;
  faceTrackingAvailable: boolean;
  useCamera: boolean;
  device: unknown;
  frameProcessor: unknown;
  error?: string;
  previewContainerId?: string;
  /** Raw jaw open ratio from useJawDetection, exposed for calibration only. */
  rawRatio: number;
}

export interface Level6MouthSense extends Level6Snapshot {
  resetTarget: () => void;
}

const AAA_OPEN_RATIO = 0.22;
const AAA_PARTIAL_RATIO = 0.16;
const NEUTRAL_BASELINE = 0.08;
const SMILE_MATCH = 0.45;
const SMILE_PARTIAL = 0.25;
const PULSE_GAP_MS = 1500;
const MULTI_PULSE_WINDOW_MS = 2500;

type PulseTracker = {
  pulses: number;
  lastClosedAt: number | null;
  lastPulseAt: number | null;
  startedAt: number | null;
  prevClosed: boolean;
};

function makeTracker(): PulseTracker {
  return {
    pulses: 0,
    lastClosedAt: null,
    lastPulseAt: null,
    startedAt: null,
    prevClosed: false,
  };
}

const IDLE: Level6Snapshot = {
  matchLevel: 'none',
  score: 0,
  holdMs: 0,
  pulses: 0,
  unstable: true,
  isDetecting: false,
  hasCamera: false,
  faceTrackingAvailable: false,
  useCamera: false,
  device: null,
  frameProcessor: null,
  rawRatio: 0,
};

export function useLevel6MouthTarget(
  enabled: boolean,
  target: Level6Target,
): Level6MouthSense {
  const jaw = useJawDetection(enabled);

  const roundRef = useRef(new LipRoundnessEngine());
  const spreadRef = useRef(new LipSpreadEngine());
  const closedRef = useRef(new LipDetectionEngine());
  const transitionRef = useRef(new LipTransitionEngine());
  const sequenceRef = useRef<TransitionSequenceTracker | null>(null);
  const pulseRef = useRef<PulseTracker>(makeTracker());
  const calibrationRef = useRef<Level6Calibration | null>(null);
  const lastMatchLevelRef = useRef<Level6MatchLevel>('none');

  const [snap, setSnap] = useState<Level6Snapshot>(IDLE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getLevel6Calibration();
      if (!cancelled) calibrationRef.current = cal;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const requiredPulses = useMemo(() => {
    switch (target) {
      case 'ma':
      case 'pa':
      case 'ba':
        return 1;
      case 'mama':
      case 'papa':
      case 'baba':
        return 2;
      default:
        return 0;
    }
  }, [target]);

  const sequenceFor = useMemo(() => {
    if (target === 'oo-ee') return ['ROUNDED', 'SPREAD'] as const;
    if (target === 'ee-oo') return ['SPREAD', 'ROUNDED'] as const;
    return null;
  }, [target]);

  const resetEngines = useCallback(() => {
    roundRef.current.reset();
    spreadRef.current.reset();
    closedRef.current.reset();
    transitionRef.current.reset();
    pulseRef.current = makeTracker();
    if (sequenceFor) {
      sequenceRef.current = new TransitionSequenceTracker([...sequenceFor]);
    } else {
      sequenceRef.current = null;
    }
  }, [sequenceFor]);

  useEffect(() => {
    resetEngines();
  }, [resetEngines, target]);

  useEffect(() => {
    if (!enabled) resetEngines();
  }, [enabled, resetEngines]);

  const jawRef = useRef(jaw);
  jawRef.current = jaw;

  useNativeLipPoll(enabled, jaw.isDetecting, () => {
    const j = jawRef.current;
    const now = Date.now();
    const next = computeSnapshot(
      target,
      j,
      {
        round: roundRef.current,
        spread: spreadRef.current,
        closed: closedRef.current,
        transition: transitionRef.current,
        sequence: sequenceRef.current,
        pulses: pulseRef.current,
      },
      requiredPulses,
      now,
      calibrationRef.current?.baseline ?? NEUTRAL_BASELINE,
    );
    if (
      next.matchLevel !== lastMatchLevelRef.current &&
      target !== 'face_present'
    ) {
      if (next.matchLevel === 'match') recordLevel6Match(target);
      else if (next.matchLevel === 'partial' && lastMatchLevelRef.current === 'none') {
        recordLevel6Partial(target);
      }
    }
    lastMatchLevelRef.current = next.matchLevel;
    setSnap(next);
  });

  useEffect(() => {
    lastMatchLevelRef.current = 'none';
  }, [target]);

  const faceTrackingAvailable = Boolean(jaw.hasCamera);
  const useCamera =
    enabled &&
    faceTrackingAvailable &&
    (jaw.isDetecting || (Platform.OS === 'web' && jaw.hasCamera));

  return {
    ...snap,
    isDetecting: jaw.isDetecting,
    hasCamera: jaw.hasCamera,
    faceTrackingAvailable,
    useCamera,
    device: jaw.device,
    frameProcessor: jaw.frameProcessor,
    error: jaw.error,
    previewContainerId: jaw.previewContainerId,
    resetTarget: resetEngines,
  };
}

type EngineSet = {
  round: LipRoundnessEngine;
  spread: LipSpreadEngine;
  closed: LipDetectionEngine;
  transition: LipTransitionEngine;
  sequence: TransitionSequenceTracker | null;
  pulses: PulseTracker;
};

function computeSnapshot(
  target: Level6Target,
  j: ReturnType<typeof useJawDetection>,
  engines: EngineSet,
  requiredPulses: number,
  now: number,
  neutralBaseline: number = NEUTRAL_BASELINE,
): Level6Snapshot {
  const baseUnstable = !Number.isFinite(j.ratio);
  const ratio = Number.isFinite(j.ratio) ? j.ratio : 0;
  const baseline = Math.max(0.05, Math.min(0.16, neutralBaseline));
  const baselineShift = baseline - NEUTRAL_BASELINE;
  const openThresh = AAA_OPEN_RATIO + baselineShift;
  const partialThresh = AAA_PARTIAL_RATIO + baselineShift;
  const mar = Math.max(baseline, ratio);
  const smile = j.smileAmount ?? 0;

  const roundSnap = engines.round.processRatio(ratio, now);
  const spreadSnap = engines.spread.processSpread(1 / mar + smile * 1.5, now);
  const closedSnap = engines.closed.processGap(ratio * 1000, now);

  switch (target) {
    case 'face_present':
      return {
        matchLevel: j.isDetecting ? 'match' : 'none',
        score: j.isDetecting ? 1 : 0,
        holdMs: 0,
        pulses: 0,
        unstable: baseUnstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };

    case 'aaa':
    case 'open': {
      const score = Math.min(1, Math.max(0, (ratio - baseline) / (openThresh - baseline)));
      let matchLevel: Level6MatchLevel = 'none';
      if (ratio >= openThresh) matchLevel = 'match';
      else if (ratio >= partialThresh) matchLevel = 'partial';
      return {
        matchLevel,
        score,
        holdMs: 0,
        pulses: 0,
        unstable: baseUnstable || closedSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'ooo':
    case 'round': {
      let matchLevel: Level6MatchLevel = 'none';
      if (roundSnap.confirmedRounded) matchLevel = 'match';
      else if (roundSnap.roundnessScore >= 0.45 || roundSnap.roundedLips) matchLevel = 'partial';
      return {
        matchLevel,
        score: roundSnap.roundnessScore,
        holdMs: roundSnap.holdDuration,
        pulses: 0,
        unstable: roundSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'eee':
    case 'spread': {
      let matchLevel: Level6MatchLevel = 'none';
      if (spreadSnap.confirmedSpread) matchLevel = 'match';
      else if (spreadSnap.spreadScore >= 0.5 || spreadSnap.lipsSpread) matchLevel = 'partial';
      return {
        matchLevel,
        score: spreadSnap.spreadScore,
        holdMs: spreadSnap.holdDuration,
        pulses: 0,
        unstable: spreadSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'smile': {
      let matchLevel: Level6MatchLevel = 'none';
      if (smile >= SMILE_MATCH || spreadSnap.confirmedSpread) matchLevel = 'match';
      else if (smile >= SMILE_PARTIAL || spreadSnap.spreadScore >= 0.4) matchLevel = 'partial';
      return {
        matchLevel,
        score: Math.max(smile, spreadSnap.spreadScore),
        holdMs: spreadSnap.holdDuration,
        pulses: 0,
        unstable: spreadSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'mm':
    case 'closed': {
      let matchLevel: Level6MatchLevel = 'none';
      if (closedSnap.lipsClosed && closedSnap.holdDuration >= 500) matchLevel = 'match';
      else if (closedSnap.lipsClosed) matchLevel = 'partial';
      return {
        matchLevel,
        score: Math.min(1, closedSnap.holdDuration / 800),
        holdMs: closedSnap.holdDuration,
        pulses: 0,
        unstable: closedSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'neutral': {
      const neutralOK = !j.isOpen && !closedSnap.lipsClosed && smile < 0.35;
      const partial = smile < 0.5;
      return {
        matchLevel: neutralOK ? 'match' : partial ? 'partial' : 'none',
        score: neutralOK ? 1 : partial ? 0.5 : 0,
        holdMs: 0,
        pulses: 0,
        unstable: baseUnstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'ma':
    case 'pa':
    case 'ba':
    case 'mama':
    case 'papa':
    case 'baba': {
      const tracker = engines.pulses;
      const isClosed = closedSnap.lipsClosed;

      if (isClosed && !tracker.prevClosed) {
        tracker.lastClosedAt = now;
        if (tracker.startedAt == null) tracker.startedAt = now;
      } else if (!isClosed && tracker.prevClosed) {
        if (tracker.lastClosedAt != null && now - tracker.lastClosedAt < PULSE_GAP_MS) {
          if (
            tracker.lastPulseAt == null ||
            now - tracker.lastPulseAt > 250
          ) {
            tracker.pulses += 1;
            tracker.lastPulseAt = now;
          }
        }
      }

      if (tracker.startedAt != null && now - tracker.startedAt > MULTI_PULSE_WINDOW_MS) {
        if (tracker.pulses < requiredPulses) {
          tracker.pulses = 0;
          tracker.lastClosedAt = null;
          tracker.lastPulseAt = null;
          tracker.startedAt = null;
        }
      }

      tracker.prevClosed = isClosed;

      const need = Math.max(1, requiredPulses);
      const score = Math.min(1, tracker.pulses / need);
      let matchLevel: Level6MatchLevel = 'none';
      if (tracker.pulses >= need) matchLevel = 'match';
      else if (tracker.pulses >= Math.max(1, need - 1) || isClosed) matchLevel = 'partial';

      return {
        matchLevel,
        score,
        holdMs: closedSnap.holdDuration,
        pulses: tracker.pulses,
        unstable: closedSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }

    case 'oo-ee':
    case 'ee-oo': {
      const transSnap = engines.transition.processRatios(
        ratio,
        1 / mar + smile * 1.5,
        now,
      );
      const tracker = engines.sequence;
      if (tracker && transSnap.confirmedPose) {
        tracker.tryAdvance(transSnap.lipPose, transSnap.confirmedPose, now);
      }
      const progress = tracker ? tracker.progress : 0;
      let matchLevel: Level6MatchLevel = 'none';
      if (tracker?.complete) matchLevel = 'match';
      else if (progress > 0) matchLevel = 'partial';
      return {
        matchLevel,
        score: progress,
        holdMs: transSnap.poseHoldDuration,
        pulses: 0,
        unstable: transSnap.unstable,
        isDetecting: j.isDetecting,
        hasCamera: j.hasCamera,
        faceTrackingAvailable: j.hasCamera,
        useCamera: false,
        device: j.device,
        frameProcessor: j.frameProcessor,
        rawRatio: ratio,
      };
    }
  }
}
