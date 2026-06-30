/**
 * OT Level 9 · Session 10 · Game 4 — Mountain Rescue (Alpine Rescue Ridge)
 *
 * Camera tracks overhead rescue rope brace form and sustained hold effort to bring climbers to safety.
 * MediaPipe pose on APK + web; guided fallback when no camera.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  EMPTY_METRICS,
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  averageForceBaseline,
  DEFAULT_FORCE_BASELINE,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import { MountainRescueOverlay } from '@/components/game/occupational/level9/session10/components/MountainRescueOverlay';
import { MOUNTAIN_RESCUE_THEME, PROPRIOCEPTIVE_ADVENTURE_SHELL } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import {
  MOUNTAIN_RESCUE_ROUNDS,
  adventureBraceQuality,
  mirroredStrengthPalms,
  mountainRescueReadout,
  mountainRescueScore,
  strengthArmExtension,
  strengthColosseumStance,
  strengthOverheadHeight,
  type AdventureZoneStatus,
  type MountainRescueRound,
} from '@/components/game/occupational/level9/session10/proprioceptiveAdventureUtils';
import { SESSION9_10_PACING as P } from '@/components/game/occupational/level9/session10/session10Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const T = MOUNTAIN_RESCUE_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Climber safe!', 'Rescue hero!', 'Steady brace!', 'Ridge pro!', 'Alpine star!'];

type Phase = 'intro' | 'calibrate' | 'play';

const MountainRescueAdventureGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalRounds = P.rounds;

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, permissionGranted, error, previewContainerId } =
    poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [rescueStars, setRescueStars] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<MountainRescueRound>(MOUNTAIN_RESCUE_ROUNDS[0]!);
  const [ridgeProgress, setRidgeProgress] = useState(0);
  const [effort, setEffort] = useState(0);
  const [form, setForm] = useState(0);
  const [quality, setQuality] = useState(0);
  const [zoneStatus, setZoneStatus] = useState<AdventureZoneStatus>('light');
  const [holdProgress, setHoldProgress] = useState(0);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [leftPalm, setLeftPalm] = useState<{ x: number; y: number } | null>(null);
  const [rightPalm, setRightPalm] = useState<{ x: number; y: number } | null>(null);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = cameraSupported && !forceFallback;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<ForceBaseline>(DEFAULT_FORCE_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const roundDefRef = useRef<MountainRescueRound>(MOUNTAIN_RESCUE_ROUNDS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const savingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const saveStartRef = useRef(0);
  const roundStartRef = useRef(0);
  const effortSumRef = useRef(0);
  const effortCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const zoneTicksRef = useRef(0);
  const totalTicksRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);
  const peakPowerRef = useRef(0);
  const lastHeavyRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const targetForRound = useCallback(
    (r: number) => P.rescueTargets[Math.min(r, P.rescueTargets.length - 1)] ?? 0.6,
    [],
  );

  const holdMsForRound = useCallback(
    (r: number) => P.rescueHoldMs[Math.min(r, P.rescueHoldMs.length - 1)] ?? 1700,
    [],
  );

  const fallbackMsForRound = useCallback(
    (r: number) => P.fallbackRescueMs[Math.min(r, P.fallbackRescueMs.length - 1)] ?? 3000,
    [],
  );

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

    const completed = completedRef.current;
    const completion = totalRounds > 0 ? completed / totalRounds : 0;
    const avgEffort = effortCountRef.current > 0 ? effortSumRef.current / effortCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgEffort * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 21 + avgEffort * 88 + moveQuality * 68 + zoneAccuracy * 40);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'mountain-rescue-mission',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgMountainRescue: Math.round(avgEffort * 100),
            zoneAccuracy: Math.round(zoneAccuracy * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, router, totalRounds]);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      const def = MOUNTAIN_RESCUE_ROUNDS[Math.min(r, MOUNTAIN_RESCUE_ROUNDS.length - 1)] ?? MOUNTAIN_RESCUE_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      holdStartRef.current = 0;
      lastAtTargetRef.current = 0;
      saveStartRef.current = 0;
      peakPowerRef.current = 0;
      previewingRef.current = true;
      savingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setSaving(false);
      setSaveProgress(0);
      setHoldProgress(0);
      setEffort(0);
      setForm(0);
      setZoneStatus('light');
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(`${def.name}! Brace steady for ${(holdMsForRound(r) / 1000).toFixed(1)} seconds.`, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.braceCue);
        setCoachCue(T.hintText);
        speakTTS(T.voiceBrace, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.rescuePreviewMs);
    },
    [holdMsForRound, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    savingRef.current = false;
    setSaving(false);
    setSaveProgress(0);
    setHoldProgress(0);
    setBanner('');

    const roundScore = mountainRescueScore(peakPowerRef.current);
    effortSumRef.current += roundScore;
    effortCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    setRidgeProgress(completedRef.current / totalRounds);
    recordHold(holdMsForRound(roundRef.current));

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setRescueStars((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, holdMsForRound, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSave = useCallback(() => {
    if (doneRef.current || savingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    savingRef.current = true;
    setSaving(true);
    saveStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('CLIMBER SAFE!');
    speakTTS(T.voiceSave, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.rescueSaveMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const r = roundRef.current;
    const target = targetForRound(r);
    const band = P.bandHalf;
    const holdMs = holdMsForRound(r);
    const fallbackMs = fallbackMsForRound(r);

    if (savingRef.current) {
      const sp = clamp01((now - saveStartRef.current) / P.rescueSaveMs);
      setSaveProgress(sp);
      recordTick(dt, { upright: true, still: false, quality: 0.9 });
      prevMetricsRef.current = m;
      return;
    }

    if (previewingRef.current) {
      recordTick(dt, { upright: true, still: true, quality: 0.7 });
      prevMetricsRef.current = m;
      return;
    }

    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - roundStartRef.current;
        const t = clamp01(elapsed / fallbackMs);
        const e = clamp01(target * (0.48 + t * 0.58));
        const f = clamp01(0.55 + t * 0.4);
        const readout = {
          form: f,
          effort: e,
          status: (e >= target - band && e <= target + band ? 'zone' : e < target - band ? 'light' : 'heavy') as AdventureZoneStatus,
          power: clamp01(f * 0.48 + e * 0.52),
        };
        setEffort(e);
        setForm(f);
        setZoneStatus(readout.status);
        setLeftPalm({ x: 0.38, y: 0.34 });
        setRightPalm({ x: 0.62, y: 0.34 });
        setQuality(0.85);
        if (readout.power > peakPowerRef.current) peakPowerRef.current = readout.power;
        if (readout.status === 'zone' && f >= P.rescueFormMin) {
          const zoneElapsed = Math.max(0, elapsed - fallbackMs * 0.48);
          const prog = clamp01(zoneElapsed / holdMs);
          setHoldProgress(prog);
          if (prog >= 1) beginSave();
        } else {
          setHoldProgress(0);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    const positioned = m.present && uprightScore(m, baselineRef.current) >= 0.2;
    const palms = mirroredStrengthPalms(m);
    setLeftPalm(palms.left);
    setRightPalm(palms.right);

    if (!m.present || !m.leftWrist || !m.rightWrist || !m.leftElbow || !m.rightElbow) {
      setCoachCue(T.positionCue);
      setEffort(0);
      setForm(0);
      setZoneStatus('light');
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, 0.14);
    const controlled = clamp01(1 - Math.max(0, intensity - 0.5) / 0.5);
    const readout = mountainRescueReadout(m, baselineRef.current, target, band);
    const q = adventureBraceQuality(m, baselineRef.current, readout, P.rescueFormMin, controlled, positioned);
    setEffort(readout.effort);
    setForm(readout.form);
    setZoneStatus(readout.status);
    setQuality(q);
    if (readout.power > peakPowerRef.current) peakPowerRef.current = readout.power;

    const stance = strengthColosseumStance(m);
    const extension = strengthArmExtension(m);
    const height = strengthOverheadHeight(m);

    if (readout.form < P.rescueFormMin) {
      if (stance < 0.35) setCoachCue(T.stanceCue);
      else if (extension < 0.4 || height < 0.4) setCoachCue(T.formCue);
      else setCoachCue(T.formCue);
    } else if (readout.status === 'heavy') {
      setCoachCue(T.heavyCue);
      if (now - lastHeavyRef.current > 2200) {
        lastHeavyRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (readout.status === 'light') {
      setCoachCue(T.lightCue);
    } else {
      setCoachCue(T.hintText);
    }

    if (roundActiveRef.current) {
      totalTicksRef.current += 1;
      if (readout.status === 'zone' && readout.form >= P.rescueFormMin) zoneTicksRef.current += 1;

      if (readout.status === 'zone' && readout.form >= P.rescueFormMin) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / holdMs);
        setHoldProgress(prog);
        if (prog >= 1) beginSave();
      } else if (readout.status === 'heavy' || readout.form < P.rescueFormMin || now - lastAtTargetRef.current > P.holdGraceMs) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: readout.status === 'zone', quality: q });
    prevMetricsRef.current = m;
  }, [beginSave, fallbackMsForRound, holdMsForRound, recordPostureBreak, recordTick, targetForRound]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    effortSumRef.current = 0;
    effortCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    zoneTicksRef.current = 0;
    totalTicksRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setRescueStars(0);
    setCompletedCount(0);
    setRidgeProgress(0);
    setPhase('play');
    phaseRef.current = 'play';
    startRound(0);
  }, [resetAnalytics, startRound]);

  const beginCalibration = useCallback(() => {
    if (!camLive) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall with arms relaxed — I am learning your starting pose.');
    speakTTS('Stand tall and relax your arms. I will learn how you stand before Alpine Rescue Ridge begins!', 0.8).catch(
      () => {},
    );
    calibSamplesRef.current = [];
    const start = Date.now();
    const sampler = setInterval(() => {
      const met = metricsRef.current;
      if (met.present) calibSamplesRef.current.push(met);
      const prog = Math.min(1, (Date.now() - start) / P.calibrationMs);
      setCalibProgress(prog);
      if (prog >= 1) {
        clearInterval(sampler);
        baselineRef.current =
          calibSamplesRef.current.length >= 4
            ? averageForceBaseline(calibSamplesRef.current)
            : DEFAULT_FORCE_BASELINE;
        beginPlay();
      }
    }, 100);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [beginPlay, camLive]);

  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
    const cap = schedule(() => endGame(), P.maxGameMs);
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      clearTimeout(cap);
    };
  }, [phase, tick, schedule, endGame]);

  useEffect(() => {
    speakTTS(T.voiceIntro, 0.8).catch(() => {});
    return () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(async () => {
    if (cameraSupported && !forceFallback && !permissionGranted) {
      const granted = await poseDetection.requestCameraAccess();
      if (!granted) {
        setCoachCue('Camera not allowed — playing guided mountain rescue mode.');
      }
    }
    beginCalibration();
  }, [beginCalibration, cameraSupported, forceFallback, permissionGranted, poseDetection]);

  const handleBack = useCallback(() => {
    setActive(false);
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

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

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: PROPRIOCEPTIVE_ADVENTURE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>⛰️ {PROPRIOCEPTIVE_ADVENTURE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: PROPRIOCEPTIVE_ADVENTURE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.statLabel }]}>Ridge</Text>
              <Text style={[styles.statValue, { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: PROPRIOCEPTIVE_ADVENTURE_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.statValue }]}>{rescueStars}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            previewContainerId={previewContainerId}
            cameraSupported={camLive}
            permissionGranted={permissionGranted}
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
              <MountainRescueOverlay
                theme={T}
                roundDef={roundDef}
                effort={effort}
                form={form}
                targetEffort={targetForRound(round)}
                zoneStatus={zoneStatus}
                holdProgress={holdProgress}
                saveProgress={saveProgress}
                saving={saving}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                rescuedCount={completedCount}
                ridgeProgress={ridgeProgress}
                holdSeconds={holdMsForRound(round) / 1000}
                leftPalm={leftPalm}
                rightPalm={rightPalm}
                banner={banner}
                quality={quality}
                bandHalf={P.bandHalf}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={PROPRIOCEPTIVE_ADVENTURE_SHELL.sparkleColor} count={26} />
            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Calibrating… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%`, backgroundColor: T.accent }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {camLive && error && permissionGranted ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.btnRow}>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={() => setActive(true)}>
                    <Text style={styles.primaryBtnText}>Retry Camera</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Play Guided</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.introText}>
                  {camLive
                    ? 'Step back so the camera sees your arms overhead — brace each rescue rope with steady controlled force!'
                    : 'Guided mode: follow the coach and practice controlled alpine rescue bracing!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Ridge</Text>
                </Pressable>
                {camLive && (
                  <Pressable
                    style={styles.linkBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
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
  academyLabel: { color: '#BAE6FD', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#BAE6FD', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
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
  statEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(15,23,42,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#BAE6FD', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#60A5FA', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default MountainRescueAdventureGame;
