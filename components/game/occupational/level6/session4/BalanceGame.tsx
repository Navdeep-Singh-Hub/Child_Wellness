/**
 * Crystal Lagoon — OT Level 6 Session 4 shared static-balance engine.
 *
 * Drives all five Static Balance games from camera-derived balance metrics
 * (single-leg stance, body sway, arm position) on web, or a guided hold-timer
 * fallback on native / no camera.
 *
 * Modes: flamingo · island · statue · starHold · freezeHero
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { DistractionLayer } from '@/components/game/occupational/level6/session1/components/DistractionLayer';
import {
  armsExtended,
  averageBaseline,
  BALANCE_POSES,
  balanceQuality,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  legLift,
  swayStillness,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { CommandBanner } from '@/components/game/occupational/level6/session2/components/CommandBanner';
import { BalanceRing } from '@/components/game/occupational/level6/session4/components/BalanceRing';
import { BALANCE_GAME_THEMES, type BalanceMode } from '@/components/game/occupational/level6/session4/lagoonTheme';
import { BalanceHUD, BalanceIntroPanel } from '@/components/game/occupational/level6/session4/shared/BalanceUI';
import { BalanceBackdrop } from '@/components/game/occupational/level6/session4/shared/BalanceVisuals';
import { SESSION4_PACING } from '@/components/game/occupational/level6/session4/session4Pacing';
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

const P = SESSION4_PACING;
const VOICE_PRAISE = ['Great balance!', 'Steady!', 'Awesome!', 'You did it!', 'So strong!'];

type Phase = 'intro' | 'calibrate' | 'play';
type FreezePhase = 'move' | 'freeze' | null;
type Kind = 'hold' | 'statue' | 'freeze';

const roundsForMode = (mode: BalanceMode): number => {
  switch (mode) {
    case 'flamingo':
      return P.flamingoRounds;
    case 'island':
      return P.islandRounds;
    case 'statue':
      return P.statueRounds;
    case 'starHold':
      return P.starHoldRounds;
    case 'freezeHero':
      return P.freezeRounds;
  }
};

const modeKind = (mode: BalanceMode): Kind => {
  if (mode === 'statue') return 'statue';
  if (mode === 'freezeHero') return 'freeze';
  return 'hold'; // flamingo, island, starHold
};

const goalMsForMode = (mode: BalanceMode): number => {
  switch (mode) {
    case 'flamingo':
      return P.flamingoHoldMs;
    case 'island':
      return P.islandHoldMs;
    case 'starHold':
      return P.starHoldMs;
    default:
      return P.flamingoHoldMs;
  }
};

export const BalanceGame: React.FC<{
  mode: BalanceMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = BALANCE_GAME_THEMES[mode];
  const S = T.shell;
  const totalRounds = roundsForMode(mode);
  const kind = modeKind(mode);
  const goalMs = goalMsForMode(mode);

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

  const [holdProgress, setHoldProgress] = useState(0);
  const [balanced, setBalanced] = useState(false);
  const [ringCaption, setRingCaption] = useState('');
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

  const balancedMsRef = useRef(0);
  const lastCollectRef = useRef(0);
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

  const collectSparkle = useCallback(() => {
    setSparkleKey((k) => k + 1);
    setCoins((c) => c + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
          skillTags: ['static-balance', 'single-leg-balance', 'postural-control', 'weight-bearing', 'motor-inhibition'],
          meta: analyticsMeta(accuracy),
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalRounds]);

  const completedRef = useRef(false);
  const phaseGuardComplete = useCallback((fn: () => void) => {
    if (completedRef.current) return;
    completedRef.current = true;
    fn();
    setTimeout(() => {
      completedRef.current = false;
    }, P.nextRoundDelayMs + 200);
  }, []);

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

  // Hold-mode end (flamingo / island / starHold).
  const finishHold = useCallback(() => {
    if (doneRef.current) return;
    phaseGuardComplete(() => {
      recordHold(balancedMsRef.current);
      const earned = balancedMsRef.current >= goalMs * 0.55;
      awardStar(earned);
      setRingCaption(earned ? 'Perfect balance! 🌟' : 'Good try — hold a little longer!');
      setCoachCue(earned ? T.hintText : 'Keep your balance steady next time!');
      advanceRound();
    });
  }, [advanceRound, awardStar, goalMs, phaseGuardComplete, recordHold, T.hintText]);

  // Statue-mode end.
  const finishStatue = useCallback(() => {
    if (doneRef.current) return;
    const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 0;
    recordHold(safeMsRef.current);
    const earned = pct >= 55;
    awardStar(earned);
    setCoachCue(earned ? 'Statue-still! 🗿' : 'Hold the pose still next time!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  const runMoveFreeze = useCallback(() => {
    if (doneRef.current) return;
    freezeActiveRef.current = false;
    setFreezePhase('move');
    setCommandLabel('MOVE!');
    setCommandCue('March and move like a hero!');
    setBannerPulse((k) => k + 1);
    setCoachCue('Keep moving… get ready to freeze!');
    const moveMs = P.moveMsMin + Math.random() * (P.moveMsMax - P.moveMsMin);
    schedule(() => {
      if (doneRef.current) return;
      setFreezePhase('freeze');
      setCommandLabel('FREEZE!');
      setCommandCue('Stop and balance — hold your pose!');
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
        setCoachCue(correct ? 'Heroic freeze and balance!' : 'Try to freeze and balance faster!');
        advanceRound();
      }, P.freezeWindowMs);
    }, moveMs);
  }, [advanceRound, awardStar, recordFreeze, schedule]);

  const startRound = useCallback(() => {
    balancedMsRef.current = 0;
    lastCollectRef.current = Date.now();
    safeMsRef.current = 0;
    totalMsRef.current = 0;
    stillStreakStartRef.current = null;
    prevMetricsRef.current = null;
    setHoldProgress(0);
    setBalanced(false);

    if (mode === 'flamingo') {
      setRingCaption('Lift one foot and balance!');
      setCoachCue('Stand on one leg like a flamingo!');
      schedule(() => finishHold(), goalMs * 2.4);
    } else if (mode === 'island') {
      setRingCaption(`Island ${roundRef.current} — balance on one foot!`);
      setCoachCue('Balance on the island — don\u2019t step off!');
      schedule(() => finishHold(), goalMs * 2.4);
    } else if (mode === 'starHold') {
      setRingCaption('Reach your arms to the stars!');
      setCoachCue('Arms out — reach for the stars and balance!');
      schedule(() => finishHold(), goalMs * 2.4);
    } else if (mode === 'statue') {
      const pose = BALANCE_POSES[(roundRef.current - 1) % BALANCE_POSES.length]!;
      setStillPct(100);
      setCommandLabel(`${pose.emoji} ${pose.label}`);
      setCommandCue(pose.cue);
      setBannerPulse((k) => k + 1);
      setCoachCue(pose.cue);
      scheduleDistraction(P.statueDistractionEveryMs);
      schedule(() => finishStatue(), P.statueRoundMs);
    } else if (mode === 'freezeHero') {
      runMoveFreeze();
    }
  }, [mode, goalMs, schedule, finishHold, finishStatue, scheduleDistraction, runMoveFreeze]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  // ── Main sampling loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    const includeWrists = mode === 'statue' || mode === 'starHold';
    const motion = cam ? frameMotionFull(prevMetricsRef.current, m, includeWrists) : 0;
    const bq = cam ? balanceQuality(m, base, motion) : 0.85;
    const still = cam ? swayStillness(motion) : 0.85;
    const stance = cam ? legLift(m) : { lifted: 'none' as const, amount: 0, legsVisible: false };
    prevMetricsRef.current = m;

    if (kind === 'hold') {
      let good: boolean;
      let caption: string;
      if (!cam) {
        good = true;
        caption = mode === 'starHold' ? 'Reaching for the stars! 🌟' : 'Balancing! 🦩';
      } else if (mode === 'starHold') {
        const reaching = armsExtended(m, P.starArmThreshold);
        good = reaching && bq >= P.balanceThreshold;
        caption = reaching ? (good ? 'Steady & reaching! ⭐' : 'Hold your balance!') : 'Stretch your arms out!';
      } else {
        // flamingo / island — prefer single-leg when legs are visible.
        const onOneLeg = stance.legsVisible ? stance.lifted !== 'none' : true;
        good = onOneLeg && bq >= P.balanceThreshold;
        caption = stance.legsVisible
          ? stance.lifted === 'none'
            ? 'Lift one foot up!'
            : good
              ? 'Great one-leg balance! 🦩'
              : 'Steady your balance!'
          : good
            ? 'Balancing! 🦩'
            : 'Stand tall and still!';
      }

      if (good) {
        balancedMsRef.current += dt;
        if (now - lastCollectRef.current >= (mode === 'starHold' ? P.starCollectEveryMs : P.flamingoCollectEveryMs)) {
          lastCollectRef.current = now;
          collectSparkle();
        }
      } else if (cam) {
        recordPostureBreak();
      }
      const prog = Math.min(1, balancedMsRef.current / goalMs);
      setHoldProgress(prog);
      setBalanced(good);
      setRingCaption(caption);
      const q = cam ? bq : 0.85;
      setQuality(q);
      recordTick(dt, { upright: good, still: good, quality: q });
      if (prog >= 1) finishHold();
    } else if (kind === 'statue') {
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
      recordTick(dt, { upright: cam ? uprightScore(m, base) >= 0.5 : true, still: good, quality: cam ? still : 0.85 });
    } else {
      // freeze
      if (freezeActiveRef.current) {
        freezeTotalRef.current += 1;
        const balancedOk = bq >= P.freezeBalanceThreshold;
        const frozen = still >= P.freezeStillThreshold;
        const ok = cam ? balancedOk && frozen : true;
        if (ok) {
          freezeHitRef.current += 1;
          if (freezeReactedRef.current === null) freezeReactedRef.current = now;
        }
        setQuality(cam ? Math.min(bq, still) : 0.85);
        recordTick(dt, { upright: balancedOk, still: frozen, quality: cam ? Math.min(bq, still) : 0.85 });
      }
    }
  }, [collectSparkle, finishHold, goalMs, kind, mode, recordHold, recordPostureBreak, recordTick]);

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
    setCoachCue('Stand tall with your whole body in view, feet together!');
    speakTTS('Stand up super tall with both feet together!', 0.8).catch(() => {});
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
      <BalanceBackdrop backdrop={T.backdrop} shell={S} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        <BalanceHUD theme={T} round={round} totalRounds={totalRounds} score={score} coins={coins} />

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
            {phase === 'play' && kind === 'hold' && (
              <BalanceRing
                hero={T.hero}
                quality={quality}
                progress={holdProgress}
                balanced={balanced}
                caption={ringCaption}
                accent={T.accent}
              />
            )}
            {phase === 'play' && mode === 'statue' && (
              <>
                {!!commandLabel && <CommandBanner label={commandLabel} cue={commandCue} tone="command" pulseKey={bannerPulse} />}
                <View style={styles.stillBadge} pointerEvents="none">
                  <Text style={styles.stillLabel}>STILLNESS</Text>
                  <Text style={styles.stillValue}>{Math.round(stillPct)}%</Text>
                </View>
                <DistractionLayer trigger={distraction} />
              </>
            )}
            {phase === 'play' && mode === 'freezeHero' && !!commandLabel && (
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
          <BalanceIntroPanel
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
    backgroundColor: 'rgba(13,148,136,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  stillLabel: { color: '#CCFBF1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  stillValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '70%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(5,59,74,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
});

export default BalanceGame;
