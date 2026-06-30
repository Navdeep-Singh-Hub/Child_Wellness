/**
 * Enchanted Kingdom — OT Level 6 Session 2 shared standing-posture engine.
 *
 * Drives all five Standing Posture Control games from camera-derived posture
 * metrics (web) or a guided hold-timer fallback (native / no camera).
 *
 * Modes: tallTree · soldier · statueGuard · growTaller · freezeBalance
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { DistractionLayer } from '@/components/game/occupational/level6/session1/components/DistractionLayer';
import {
  averageBaseline,
  coachingCue,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  shoulderSymmetry,
  SOLDIER_COMMANDS,
  stretchScore,
  swayStillness,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { BalloonRise } from '@/components/game/occupational/level6/session2/components/BalloonRise';
import { CommandBanner } from '@/components/game/occupational/level6/session2/components/CommandBanner';
import { TreeGrowth } from '@/components/game/occupational/level6/session2/components/TreeGrowth';
import { StandIntroPanel, StandHUD } from '@/components/game/occupational/level6/session2/shared/StandUI';
import { StandBackdrop } from '@/components/game/occupational/level6/session2/shared/StandVisuals';
import { STAND_GAME_THEMES, type StandMode } from '@/components/game/occupational/level6/session2/forestTheme';
import { SESSION2_PACING } from '@/components/game/occupational/level6/session2/session2Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION2_PACING;
const VOICE_PRAISE = ['Great job!', 'Awesome!', 'Keep going!', 'You did it!', 'Super strong!'];

type Phase = 'intro' | 'calibrate' | 'play';
type FreezePhase = 'move' | 'freeze' | null;

const roundsForMode = (mode: StandMode): number => {
  switch (mode) {
    case 'tallTree':
      return P.tallTreeRounds;
    case 'soldier':
      return P.soldierRounds;
    case 'statueGuard':
      return P.statueRounds;
    case 'growTaller':
      return P.growRounds;
    case 'freezeBalance':
      return P.freezeRounds;
  }
};

export const StandingPostureGame: React.FC<{
  mode: StandMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = STAND_GAME_THEMES[mode];
  const S = T.shell;
  const totalRounds = roundsForMode(mode);

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, error, previewContainerId } = poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordFreeze,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  // ── UI state ──
  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [treeGrowth, setTreeGrowth] = useState(0);
  const [balloonHeight, setBalloonHeight] = useState(0);
  const [stillPct, setStillPct] = useState(100);
  const [commandLabel, setCommandLabel] = useState('');
  const [commandCue, setCommandCue] = useState('');
  const [bannerPulse, setBannerPulse] = useState(0);
  const [freezePhase, setFreezePhase] = useState<FreezePhase>(null);
  const [distraction, setDistraction] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  const fillRef = useRef(0); // tree growth / balloon height
  const holdStartRef = useRef<number | null>(null);
  const wasGoodRef = useRef(false);
  const safeMsRef = useRef(0);
  const totalMsRef = useRef(0);
  const stillStreakStartRef = useRef<number | null>(null);
  const freezeActiveRef = useRef(false);
  const freezeHitRef = useRef(0);
  const freezeTotalRef = useRef(0);
  const freezeOnsetRef = useRef(0);
  const freezeReactedRef = useRef<number | null>(null);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    usingCameraRef.current = usingCamera;
  }, [usingCamera]);

  // ── Helpers ──
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const praise = useCallback(() => {
    const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
    speakTTS(msg, 0.8).catch(() => {});
  }, []);

  const celebrate = useCallback(() => {
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const awardStar = useCallback(
    (earned: boolean) => {
      if (earned) {
        setScore((s) => s + 1);
        setCoins((c) => c + 1);
        celebrate();
        praise();
      }
    },
    [celebrate, praise],
  );

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const finalScore = scoreRef.current;
    const accuracy = totalRounds > 0 ? Math.round((finalScore / totalRounds) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(finalScore * 22 + snap.avgPostureQuality * 0.4 + snap.uprightPct * 0.3);
    setFinalStats({ correct: finalScore, total: totalRounds, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['standing-posture', 'core-activation', 'postural-control', 'static-balance', 'body-awareness'],
          meta: analyticsMeta(accuracy),
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalRounds]);

  // Guard so fill-completion only fires the advance once per round.
  const completedRef = useRef(false);
  const phaseGuardComplete = useCallback((fn: () => void) => {
    if (completedRef.current) return;
    completedRef.current = true;
    fn();
    setTimeout(() => {
      completedRef.current = false;
    }, P.nextRoundDelayMs + 200);
  }, []);

  // ── Round lifecycle (declared via refs to avoid ordering issues) ──
  const startRoundRef = useRef<() => void>(() => {});
  const advanceRound = useCallback(() => {
    if (doneRef.current) return;
    if (roundRef.current >= totalRounds) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRoundRef.current(), P.nextRoundDelayMs);
  }, [endGame, schedule, totalRounds]);

  const scheduleDistraction = useCallback(
    (everyMs: number) => {
      const fire = () => {
        if (doneRef.current || phaseRef.current !== 'play') return;
        setDistraction((d) => d + 1);
        schedule(fire, everyMs);
      };
      schedule(fire, everyMs);
    },
    [schedule],
  );

  const finishTimedRound = useCallback(() => {
    if (doneRef.current) return;
    const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 0;
    recordHold(safeMsRef.current);
    const earned = pct >= 55;
    awardStar(earned);
    setCoachCue(earned ? 'Statue-still! 🗿' : 'Good try — hold still next time!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  const finishCommand = useCallback(() => {
    if (doneRef.current) return;
    const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 0;
    recordHold(safeMsRef.current);
    const earned = pct >= 55;
    awardStar(earned);
    setCoachCue(earned ? 'Perfect posture, guard! 💂' : 'Steady — tall and straight!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  const runMoveFreeze = useCallback(() => {
    if (doneRef.current) return;
    freezeActiveRef.current = false;
    setFreezePhase('move');
    setCommandLabel('MOVE!');
    setCommandCue('March and move your body!');
    setBannerPulse((k) => k + 1);
    setCoachCue('Keep moving… get ready to freeze!');
    const moveMs = P.moveMsMin + Math.random() * (P.moveMsMax - P.moveMsMin);
    schedule(() => {
      if (doneRef.current) return;
      setFreezePhase('freeze');
      setCommandLabel('FREEZE!');
      setCommandCue('Stop and balance — stay still!');
      setBannerPulse((k) => k + 1);
      setCoachCue('FREEZE — balance and hold!');
      freezeActiveRef.current = true;
      freezeHitRef.current = 0;
      freezeTotalRef.current = 0;
      freezeOnsetRef.current = Date.now();
      freezeReactedRef.current = null;
      schedule(() => {
        if (doneRef.current) return;
        freezeActiveRef.current = false;
        const ratio = freezeTotalRef.current > 0 ? freezeHitRef.current / freezeTotalRef.current : usingCameraRef.current ? 0 : 1;
        const correct = ratio >= 0.5;
        const reaction = freezeReactedRef.current ? freezeReactedRef.current - freezeOnsetRef.current : undefined;
        recordFreeze(correct, reaction);
        setFreezePhase(null);
        setCommandLabel('');
        awardStar(correct);
        setCoachCue(correct ? 'Great freeze and balance!' : 'Try to freeze faster!');
        advanceRound();
      }, P.freezeWindowMs);
    }, moveMs);
  }, [advanceRound, awardStar, recordFreeze, schedule]);

  const startRound = useCallback(() => {
    safeMsRef.current = 0;
    totalMsRef.current = 0;
    stillStreakStartRef.current = null;
    holdStartRef.current = null;
    wasGoodRef.current = false;
    prevMetricsRef.current = null;

    if (mode === 'tallTree') {
      fillRef.current = 0;
      setTreeGrowth(0);
      setCoachCue('Stand up tall — grow your tree!');
    } else if (mode === 'growTaller') {
      fillRef.current = 0;
      setBalloonHeight(0);
      setCoachCue('Stretch up as tall as you can!');
    } else if (mode === 'soldier') {
      const cmd = SOLDIER_COMMANDS[(roundRef.current - 1) % SOLDIER_COMMANDS.length]!;
      setCommandLabel(cmd.label);
      setCommandCue(cmd.cue);
      setBannerPulse((k) => k + 1);
      setCoachCue(cmd.cue);
      schedule(() => finishCommand(), P.soldierCommandMs);
    } else if (mode === 'statueGuard') {
      setStillPct(100);
      setCoachCue('Freeze like a statue — even your arms!');
      scheduleDistraction(P.statueDistractionEveryMs);
      schedule(() => finishTimedRound(), P.statueRoundMs);
    } else if (mode === 'freezeBalance') {
      runMoveFreeze();
    }
  }, [mode, schedule, finishCommand, finishTimedRound, scheduleDistraction, runMoveFreeze]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  // ── Main sampling loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;
    const dtSec = dt / 1000;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    const up = cam ? uprightScore(m, base) : 0.85;
    const sym = cam ? shoulderSymmetry(m, base) : 0.85;
    const align = cam ? up * 0.6 + sym * 0.4 : 0.85;
    const stretch = cam ? stretchScore(m, base) : 0.85;
    const motion = cam ? frameMotionFull(prevMetricsRef.current, m, mode === 'statueGuard') : 0;
    const still = cam ? swayStillness(motion) : 0.85;
    prevMetricsRef.current = m;

    switch (mode) {
      case 'tallTree': {
        const good = cam ? up >= P.treeUprightThreshold : true;
        if (good) {
          fillRef.current = Math.min(100, fillRef.current + P.treeGrowthPerSec * dtSec);
          if (holdStartRef.current === null) holdStartRef.current = now;
          wasGoodRef.current = true;
        } else {
          fillRef.current = Math.max(0, fillRef.current - P.treeDrainPerSec * dtSec);
          if (wasGoodRef.current) {
            recordPostureBreak();
            if (holdStartRef.current) recordHold(now - holdStartRef.current);
            holdStartRef.current = null;
          }
          wasGoodRef.current = false;
        }
        if (!cam) fillRef.current = Math.min(100, fillRef.current + (100 / P.fallbackHoldMs) * dt);
        setTreeGrowth(fillRef.current);
        setQuality(cam ? up : 0.85);
        setCoachCue(cam ? (m.present ? coachingCue(m, base) : 'Step back so the camera sees your whole body.') : T.hintText);
        recordTick(dt, { upright: good, still: false, quality: cam ? up : 0.85 });
        if (fillRef.current >= 100) {
          if (holdStartRef.current) recordHold(now - holdStartRef.current);
          phaseGuardComplete(() => {
            awardStar(true);
            setCoachCue('Your tree grew tall! 🌳');
            advanceRound();
          });
        }
        break;
      }
      case 'growTaller': {
        const good = cam ? stretch >= P.stretchThreshold : true;
        if (good) fillRef.current = Math.min(100, fillRef.current + P.balloonRisePerSec * dtSec);
        else fillRef.current = Math.max(0, fillRef.current - P.balloonDrainPerSec * dtSec);
        if (!cam) fillRef.current = Math.min(100, fillRef.current + (100 / P.fallbackHoldMs) * dt);
        setBalloonHeight(fillRef.current);
        setQuality(cam ? stretch : 0.85);
        setCoachCue(cam ? (stretch >= P.stretchThreshold ? 'Taller! Reach for the clouds!' : 'Stretch UP — arms to the sky!') : T.hintText);
        recordTick(dt, { upright: good, still: false, quality: cam ? stretch : 0.85 });
        if (fillRef.current >= 100) {
          phaseGuardComplete(() => {
            awardStar(true);
            setCoachCue('Balloon reached the clouds! 🎈');
            advanceRound();
          });
        }
        break;
      }
      case 'soldier': {
        totalMsRef.current += dt;
        const good = cam ? align >= P.soldierAlignThreshold : true;
        if (good) safeMsRef.current += dt;
        else recordPostureBreak();
        if (!cam) safeMsRef.current = totalMsRef.current;
        setQuality(cam ? align : 0.85);
        recordTick(dt, { upright: cam ? up >= P.soldierAlignThreshold : true, still: false, quality: cam ? align : 0.85 });
        break;
      }
      case 'statueGuard': {
        totalMsRef.current += dt;
        const good = cam ? still >= P.statueStillThreshold : true;
        if (good) {
          safeMsRef.current += dt;
          if (stillStreakStartRef.current === null) stillStreakStartRef.current = now;
        } else if (stillStreakStartRef.current) {
          recordHold(now - stillStreakStartRef.current);
          stillStreakStartRef.current = null;
          recordPostureBreak();
        }
        if (!cam) safeMsRef.current = totalMsRef.current;
        const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 100;
        setStillPct(pct);
        setQuality(cam ? still : 0.85);
        recordTick(dt, { upright: cam ? up >= 0.5 : true, still: good, quality: cam ? still : 0.85 });
        break;
      }
      case 'freezeBalance': {
        if (freezeActiveRef.current) {
          freezeTotalRef.current += 1;
          const balanced = up >= P.freezeBalanceThreshold;
          const frozen = still >= P.freezeStillThreshold;
          const ok = cam ? balanced && frozen : true;
          if (ok) {
            freezeHitRef.current += 1;
            if (freezeReactedRef.current === null) freezeReactedRef.current = now;
          }
          setQuality(cam ? Math.min(up, still) : 0.85);
          recordTick(dt, { upright: balanced, still: frozen, quality: cam ? Math.min(up, still) : 0.85 });
        }
        break;
      }
    }
  }, [advanceRound, awardStar, mode, phaseGuardComplete, recordHold, recordPostureBreak, recordTick, T.hintText]);

  // ── Calibration ──
  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      resetAnalytics();
      setPhase('play');
      phaseRef.current = 'play';
      lastTickRef.current = 0;
      schedule(() => startRoundRef.current(), P.roundIntroDelayMs);
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand up nice and tall, with your whole body in view!');
    speakTTS('Stand up super tall and hold still!', 0.8).catch(() => {});
    calibSamplesRef.current = [];
    const start = Date.now();
    const sampler = setInterval(() => {
      const m = metricsRef.current;
      if (m.present) calibSamplesRef.current.push(m);
      const prog = Math.min(1, (Date.now() - start) / P.calibrationMs);
      setCalibProgress(prog);
      if (prog >= 1) {
        clearInterval(sampler);
        baselineRef.current =
          calibSamplesRef.current.length >= 4 ? averageBaseline(calibSamplesRef.current) : DEFAULT_BASELINE;
        resetAnalytics();
        setPhase('play');
        phaseRef.current = 'play';
        lastTickRef.current = 0;
        schedule(() => startRoundRef.current(), P.roundIntroDelayMs);
      }
    }, 120);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [resetAnalytics, cameraSupported, forceFallback, schedule]);

  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [phase, tick]);

  useEffect(() => {
    speakTTS(T.voiceIntro, 0.8).catch(() => {});
    return () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(() => {
    beginCalibration();
  }, [beginCalibration]);

  const handleBack = useCallback(() => {
    setActive(false);
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

  // ── Render ──
  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        message={T.congrats}
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={finalStats.accuracy}
        xpAwarded={finalStats.xp}
        onContinue={() => onComplete?.()}
        onHome={handleBack}
      />
    );
  }

  const freezeTone = freezePhase === 'freeze' ? 'freeze' : 'move';

  return (
    <View style={styles.root}>
      <StandBackdrop backdrop={T.backdrop} shell={S} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        <StandHUD theme={T} round={round} totalRounds={totalRounds} score={score} coins={coins} />

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            shell={S}
            previewContainerId={previewContainerId}
            cameraSupported={usingCamera}
            hasCamera={hasCamera}
            present={present}
            isDetecting={isDetecting}
            calibrating={phase === 'calibrate'}
            quality={quality}
            glowColor={T.glow}
            hero={T.hero}
            coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
          >
            {phase === 'play' && mode === 'tallTree' && (
              <TreeGrowth growth={treeGrowth} growing={quality >= P.treeUprightThreshold || !usingCamera} />
            )}
            {phase === 'play' && mode === 'growTaller' && (
              <BalloonRise height={balloonHeight} rising={quality >= P.stretchThreshold || !usingCamera} accent={T.accent} />
            )}
            {phase === 'play' && mode === 'soldier' && !!commandLabel && (
              <CommandBanner label={commandLabel} cue={commandCue} tone="command" pulseKey={bannerPulse} />
            )}
            {phase === 'play' && mode === 'statueGuard' && (
              <>
                <View style={styles.stillBadge} pointerEvents="none">
                  <Text style={styles.stillLabel}>STILLNESS</Text>
                  <Text style={styles.stillValue}>{Math.round(stillPct)}%</Text>
                </View>
                <DistractionLayer trigger={distraction} />
              </>
            )}
            {phase === 'play' && mode === 'freezeBalance' && !!commandLabel && (
              <CommandBanner label={commandLabel} cue={commandCue} tone={freezeTone} pulseKey={bannerPulse} />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={S.sparkleColor} count={14} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Stand tall… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {phase === 'intro' && (
          <StandIntroPanel
            theme={T}
            errorText={cameraSupported && error ? error : undefined}
            cameraSupported={cameraSupported}
            hasCamera={hasCamera}
            onStart={handleStart}
            onRetry={() => setActive(true)}
            onGuided={() => { setForceFallback(true); handleStart(); }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  stageWrap: { flex: 1, marginTop: 10, marginBottom: 8 },
  stillBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(14,116,144,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  stillLabel: { color: '#CFFAFE', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  stillValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '70%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(8,30,38,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
});

export default StandingPostureGame;
