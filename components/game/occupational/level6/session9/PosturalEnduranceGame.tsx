/**
 * Sky Champions — OT Level 6 Session 9 shared postural-endurance engine.
 *
 * Progressive sustained-hold challenge: the child holds a target pose for
 * increasing durations while distractions test their focus. Pose quality is
 * scored from the camera (web) via holdQuality(), or auto-filled in a guided
 * fallback (native / no camera). A brief grace window forgives small wobbles;
 * sustained breaks drain the charge.
 *
 * Modes: superheroHold · airplaneHold · bridgeHold · tallTreeChallenge · longestStatue
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { BalanceRing } from '@/components/game/occupational/level6/session4/components/BalanceRing';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  holdQuality,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { DistractionLayer } from '@/components/game/occupational/level6/session9/components/DistractionLayer';
import { ENDURANCE_GAME_THEMES, SKY_SHELL, type EnduranceMode } from '@/components/game/occupational/level6/session9/enduranceTheme';
import { SESSION9_PACING } from '@/components/game/occupational/level6/session9/session9Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;

type Phase = 'intro' | 'calibrate' | 'play';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const PosturalEnduranceGame: React.FC<{
  mode: EnduranceMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = ENDURANCE_GAME_THEMES[mode];
  const levels = T.holdLevelsMs;
  const totalLevels = levels.length;

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, error, previewContainerId } = poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  // ── UI state ──
  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [quality, setQuality] = useState(0);
  const [chargedSec, setChargedSec] = useState(0);
  const [longestSec, setLongestSec] = useState(0);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const levelRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  const accumRef = useRef(0);
  const runRef = useRef(0);
  const chargedRef = useRef(0);
  const longestRef = useRef(0);
  const lastGoodRef = useRef(0);
  const levelActiveRef = useRef(false);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
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

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const completed = levelRef.current;
    const accuracy = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(
      completed * 18 + chargedRef.current / 1000 + snap.avgPostureQuality * 0.5 + snap.longestHoldMs / 1000,
    );
    setFinalStats({ correct: completed, total: totalLevels, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: completed,
          total: totalLevels,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['postural-endurance', 'core-activation', 'static-balance', 'motor-inhibition', 'body-awareness'],
          meta: { ...analyticsMeta(accuracy), chargedMs: Math.round(chargedRef.current) },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalLevels]);

  const startLevelRef = useRef<() => void>(() => {});

  const completeLevel = useCallback(() => {
    if (doneRef.current || !levelActiveRef.current) return;
    levelActiveRef.current = false;
    const target = levels[levelRef.current] ?? 0;
    recordStar();
    recordHold(target);
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Level complete! Keep going!', 0.8).catch(() => {});

    const next = levelRef.current + 1;
    levelRef.current = next;
    setLevelIndex(next);
    if (next >= totalLevels) {
      schedule(() => endGame(), P.nextLevelDelayMs);
    } else {
      setCoachCue(`Great hold! Get ready for a longer one…`);
      schedule(() => startLevelRef.current(), P.nextLevelDelayMs);
    }
  }, [endGame, levels, recordHold, recordStar, schedule, totalLevels]);

  const startLevel = useCallback(() => {
    if (doneRef.current) return;
    accumRef.current = 0;
    runRef.current = 0;
    lastGoodRef.current = Date.now();
    levelActiveRef.current = true;
    setProgress(0);
    setCoachCue(T.holdCueBreak);
  }, [T.holdCueBreak]);

  useEffect(() => {
    startLevelRef.current = startLevel;
  }, [startLevel]);

  // ── Main loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play' || !levelActiveRef.current) return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;
    const target = levels[levelRef.current] ?? 6000;

    let isHolding: boolean;
    let q: number;
    if (!cam) {
      q = 0.85;
      isHolding = true;
      accumRef.current += dt * P.fallbackFillRate;
      runRef.current += dt;
    } else {
      const motion = frameMotionFull(prevMetricsRef.current, m, true);
      prevMetricsRef.current = m;
      q = holdQuality(T.pose, m, base, motion);
      const good = q >= P.holdQualityThreshold;
      if (good) {
        lastGoodRef.current = now;
        isHolding = true;
        accumRef.current += dt;
        runRef.current += dt;
      } else {
        const broken = now - lastGoodRef.current > P.graceMs;
        if (broken && q < P.breakQualityThreshold) {
          isHolding = false;
          accumRef.current = Math.max(0, accumRef.current - dt * P.drainRate);
          runRef.current = 0;
          recordPostureBreak();
        } else {
          // within grace — hold steady, no gain/loss
          isHolding = true;
        }
      }
    }

    if (isHolding) {
      chargedRef.current += dt;
      if (runRef.current > longestRef.current) {
        longestRef.current = runRef.current;
        setLongestSec(Math.floor(longestRef.current / 1000));
      }
      recordHold(runRef.current);
    }

    setQuality(q);
    setHolding(isHolding);
    setProgress(clamp01(accumRef.current / target));
    setChargedSec(Math.floor(chargedRef.current / 1000));
    setCoachCue(isHolding ? T.holdCueGood : T.holdCueBreak);
    recordTick(dt, { upright: isHolding, still: isHolding, quality: q });

    if (accumRef.current >= target) completeLevel();
  }, [completeLevel, levels, recordHold, recordPostureBreak, recordTick, T.holdCueBreak, T.holdCueGood, T.pose]);

  // ── Calibration ──
  const beginPlay = useCallback(() => {
    resetAnalytics();
    chargedRef.current = 0;
    longestRef.current = 0;
    prevMetricsRef.current = null;
    setPhase('play');
    phaseRef.current = 'play';
    lastTickRef.current = 0;
    schedule(() => startLevelRef.current(), P.levelIntroDelayMs);
  }, [resetAnalytics, schedule]);

  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall facing the camera — hold still to calibrate!');
    speakTTS('Stand tall facing me so I can see you!', 0.8).catch(() => {});
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
        beginPlay();
      }
    }, 120);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [beginPlay, cameraSupported, forceFallback]);

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

  const levelLabel = Math.min(levelIndex + 1, totalLevels);

  return (
    <LinearGradient colors={SKY_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: SKY_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: SKY_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🏅 SKY CHAMPIONS</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: SKY_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: SKY_SHELL.statLabel }]}>Level</Text>
              <Text style={[styles.statValue, { color: SKY_SHELL.statValue }]}>
                {levelLabel}/{totalLevels}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: SKY_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>⚡</Text>
              <Text style={[styles.statValue, { color: SKY_SHELL.statValue }]}>{chargedSec}s</Text>
            </View>
            <View style={[styles.statPill, { borderColor: SKY_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>⏱️</Text>
              <Text style={[styles.statValue, { color: SKY_SHELL.statValue }]}>{longestSec}s</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
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
            {phase === 'play' && (
              <DistractionLayer emojis={T.distractions} active={phase === 'play'} intervalMs={P.distractionIntervalMs} />
            )}
            {phase === 'play' && (
              <BalanceRing
                hero={T.hero}
                quality={quality}
                progress={progress}
                balanced={holding}
                caption={holding ? T.holdCueGood : T.holdCueBreak}
                accent={T.accent}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={SKY_SHELL.sparkleColor} count={16} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Calibrating… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {cameraSupported && error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.btnRow}>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={() => setActive(true)}>
                    <Text style={styles.primaryBtnText}>Retry Camera</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} onPress={() => { setForceFallback(true); handleStart(); }}>
                    <Text style={styles.secondaryBtnText}>Play Guided</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.introText}>
                  {cameraSupported
                    ? hasCamera
                      ? 'Stand back so the camera sees your whole body, then hold your pose as long as you can!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the coach and hold your pose!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Challenge</Text>
                </Pressable>
                {cameraSupported && (
                  <Pressable style={styles.linkBtn} onPress={() => { setForceFallback(true); handleStart(); }}>
                    <Text style={styles.linkText}>No camera? Play guided mode</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  academyLabel: { color: '#7DD3FC', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#BAE6FD', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '900' },
  coinEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(12,74,110,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FCD34D' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#E0F2FE', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)' },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { paddingVertical: 6 },
  linkText: { color: '#7DD3FC', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default PosturalEnduranceGame;
