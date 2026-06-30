/**
 * OT Level 10 · Session 2 · Game 1 — Balloon Breathing
 *
 * Regulation through movement: child syncs slow arm raises/lowers with
 * an on-screen breathing balloon. Camera tracks posture, steadiness,
 * breath-sync quality and attention.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { BALLOON_BREATHING_PACING as P } from '@/components/game/occupational/level10/session2/balloonBreathingPacing';
import {
  BALLOON_BREATHING_THEME as T,
  BREATH_BALLOONS,
  BREATH_VOICE_CUES,
  CLOUD_SHELL,
} from '@/components/game/occupational/level10/session2/balloonBreathingTheme';
import { BalloonBreathingVisuals } from '@/components/game/occupational/level10/session2/components/BalloonBreathingVisuals';
import { BreathCycleHUD } from '@/components/game/occupational/level10/session2/components/BreathCycleHUD';
import { BreathingBalloon } from '@/components/game/occupational/level10/session2/components/BreathingBalloon';
import { RegulationMeter } from '@/components/game/occupational/level10/session2/components/RegulationMeter';
import {
  balloonScaleForPhase,
  breathBodySignal,
  breathSyncScore,
  regulationQualityScore,
  steadinessFromMotion,
  type BreathPhase,
} from '@/components/game/occupational/level10/session2/regulationTrackingUtils';
import { VisionTrackingView } from '@/hooks/useVisionTracking';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['So calm!', 'Beautiful breath!', 'Lovely rhythm!', 'Peaceful mover!', 'Great regulation!'];

const PHASE_MS: Record<BreathPhase, number> = {
  inhale: P.inhaleMs,
  hold: P.holdMs,
  exhale: P.exhaleMs,
  rest: P.restMs,
};

const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
  inhale: 'hold',
  hold: 'exhale',
  exhale: 'rest',
  rest: 'inhale',
};

type Phase = 'intro' | 'calibrate' | 'play';

const BalloonBreathingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalCycles = P.cycles;

  const [active, setActive] = useState(true);
  const tracking = useSensoryTracking(active);
  const { sample, hasCamera, cameraSupported, pose, vision, previewContainerId, permissionGranted } = tracking;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordStar,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [breaths, setBreaths] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [balloonScale, setBalloonScale] = useState(P.balloonMinScale);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [regulation, setRegulation] = useState(0);
  const [sync, setSync] = useState(0);
  const [steadiness, setSteadiness] = useState(0);
  const [attention, setAttention] = useState(0);
  const [quality, setQuality] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const balloonColors = BREATH_BALLOONS[Math.min(cycle, BREATH_BALLOONS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const breathPhaseRef = useRef<BreathPhase>('inhale');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const cycleRef = useRef(0);
  const phaseStartRef = useRef(0);
  const baselineYRef = useRef(0.5);
  const prevSignalRef = useRef<number | null>(null);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const regulationSumRef = useRef(0);
  const cycleSyncSumRef = useRef(0);
  const cycleSyncTicksRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { breathPhaseRef.current = breathPhase; }, [breathPhase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const phaseCoach = useCallback((bp: BreathPhase) => {
    switch (bp) {
      case 'inhale':
        return 'Slowly raise your arms as the balloon grows…';
      case 'hold':
        return 'Hold still — feel the calm balloon…';
      case 'exhale':
        return 'Lower your arms as the balloon shrinks…';
      default:
        return 'Rest softly before the next breath…';
    }
  }, []);

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const completed = completedRef.current;
    const xp = completed * 14 + accuracy + Math.round(regulationSumRef.current / Math.max(1, completed) * 20);
    setFinalStats({ correct: completed, total: totalCycles, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'balloon-breathing',
        score: completed,
        accuracy,
        meta: { ...analyticsMeta, regulation: regulationSumRef.current / Math.max(1, completed) },
      });
      await logGameAndAward('balloon-breathing', completed, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalCycles, tracking.vision]);

  const beginBreathPhase = useCallback(
    (bp: BreathPhase, c: number) => {
      breathPhaseRef.current = bp;
      setBreathPhase(bp);
      phaseStartRef.current = Date.now();
      setPhaseProgress(0);
      setCoachCue(phaseCoach(bp));

      const signal = breathBodySignal(sampleRef.current);
      if (signal != null) baselineYRef.current = signal;

      if (bp === 'inhale') {
        const cue = BREATH_VOICE_CUES[Math.min(c, BREATH_VOICE_CUES.length - 1)];
        speakTTS(cue ?? BREATH_VOICE_CUES[0], 0.8).catch(() => {});
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [phaseCoach],
  );

  const startCycle = useCallback(
    (c: number) => {
      cycleRef.current = c;
      setCycle(c);
      cycleSyncSumRef.current = 0;
      cycleSyncTicksRef.current = 0;
      beginBreathPhase('inhale', c);
    },
    [beginBreathPhase],
  );

  const completeCycle = useCallback(() => {
    const avgSync = cycleSyncTicksRef.current > 0 ? cycleSyncSumRef.current / cycleSyncTicksRef.current : 0.75;
    regulationSumRef.current += avgSync;
    completedRef.current += 1;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNCycles === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    recordHold(P.holdMs);
    setBreaths(next);

    cycleSyncSumRef.current = 0;
    cycleSyncTicksRef.current = 0;

    if (next >= totalCycles) {
      schedule(() => endGame(), P.betweenCyclesMs);
    } else {
      schedule(() => startCycle(next), P.betweenCyclesMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startCycle, totalCycles]);

  const advanceBreathPhase = useCallback(() => {
    const current = breathPhaseRef.current;
    const next = NEXT_PHASE[current];
    if (current === 'rest') {
      completeCycle();
      return;
    }
    beginBreathPhase(next, cycleRef.current);
  }, [beginBreathPhase, completeCycle]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const bp = breathPhaseRef.current;
    const phaseMs = PHASE_MS[bp];
    const elapsed = now - phaseStartRef.current;
    const progress = clamp01(elapsed / phaseMs);
    setPhaseProgress(progress);
    setBalloonScale(balloonScaleForPhase(bp, progress, P.balloonMinScale, P.balloonMaxScale));

    if (elapsed >= phaseMs) {
      advanceBreathPhase();
      return;
    }

    const s = sampleRef.current;

    if (!camLiveRef.current) {
      const fallbackSync = 0.72 + progress * 0.18;
      setSync(fallbackSync);
      setSteadiness(0.8);
      setAttention(0.82);
      setRegulation(fallbackSync);
      setQuality(0.84);
      recordTick(dt, { upright: true, still: bp === 'hold', quality: 0.84 });
      return;
    }

    const bodyY = breathBodySignal(s);
    const prevY = prevSignalRef.current;
    prevSignalRef.current = bodyY;

    if (bodyY == null && !s.present) {
      setCoachCue(T.positionCue);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const syncScore = breathSyncScore(bp, progress, baselineYRef.current, bodyY, P.breathRangeNorm);
    const smooth = steadinessFromMotion(
      prevY != null && bodyY != null ? { x: 0.5, y: prevY } : null,
      bodyY != null ? { x: 0.5, y: bodyY } : null,
    );
    const attn = s.attentionScore;
    const q = regulationQualityScore(syncScore, s.postureQuality, smooth, attn, bp);
    const reg = clamp01(syncScore * 0.55 + s.postureQuality * 0.25 + smooth * 0.2);

    setSync(syncScore);
    setSteadiness(smooth);
    setAttention(attn);
    setRegulation(reg);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;
    cycleSyncSumRef.current += syncScore;
    cycleSyncTicksRef.current += 1;

    if (bp === 'inhale' && syncScore > 0.55) {
      setCoachCue('Lovely inhale — keep rising with the balloon…');
    } else if (bp === 'exhale' && syncScore > 0.55) {
      setCoachCue('Gentle exhale — let the balloon float down…');
    } else {
      setCoachCue(phaseCoach(bp));
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: bp === 'hold' || bp === 'rest' ? smooth > 0.55 : smooth > 0.35,
      quality: q,
    });
  }, [advanceBreathPhase, phaseCoach, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    regulationSumRef.current = 0;
    resetAnalytics();
    schedule(() => startCycle(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startCycle, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Sit calmly — show your face and hands to the camera…');
    await tracking.vision.resetCalibration().catch(() => {});
    const start = Date.now();
    const timer = setInterval(() => {
      const p = clamp01((Date.now() - start) / P.calibrationMs);
      setCalibProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        schedule(beginPlay, 400);
      }
    }, 80);
  }, [beginPlay, schedule, tracking.vision]);

  useEffect(() => {
    return () => {
      clearTimers();
      tracking.vision.stopTracking().catch(() => {});
      cleanupSounds();
      stopAllSpeech();
    };
  }, [clearTimers, tracking.vision]);

  const handleBack = useCallback(() => {
    clearTimers();
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [clearTimers, onBack]);

  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        title={T.congrats}
        subtitle={`${finalStats.correct}/${finalStats.total} calm breaths · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const renderOverlay = () => (
    <>
      <BalloonBreathingVisuals />
      <RegulationMeter regulation={regulation} sync={sync} steadiness={steadiness} />
      {phase === 'play' && (
        <>
          <BreathCycleHUD
            phase={breathPhase}
            cycle={cycle}
            totalCycles={totalCycles}
            phaseProgress={phaseProgress}
          />
          <BreathingBalloon
            scale={balloonScale}
            colors={balloonColors}
            phase={breathPhase}
            syncScore={sync}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            accent={T.accent}
          />
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={CLOUD_SHELL.sparkleColor} count={20} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Calm calibration… {Math.round(calibProgress * 100)}%</Text>
          <View style={styles.calibTrack}>
            <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
          </View>
        </View>
      )}
    </>
  );

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: CLOUD_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: CLOUD_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🎈 {CLOUD_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: CLOUD_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CLOUD_SHELL.statLabel }]}>Breath</Text>
              <Text style={[styles.statValue, { color: CLOUD_SHELL.statValue }]}>
                {Math.min(cycle + (phase === 'play' ? 1 : 0), totalCycles)}/{totalCycles}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: CLOUD_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>☁️</Text>
              <Text style={[styles.statValue, { color: CLOUD_SHELL.statValue }]}>{breaths}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: CLOUD_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CLOUD_SHELL.statLabel }]}>Calm</Text>
              <Text style={[styles.statValue, { color: CLOUD_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          {useNativeVision ? (
            <View style={styles.nativeStage}>
              <VisionTrackingView active={camLive} style={StyleSheet.absoluteFill} />
              {renderOverlay()}
              {(phase === 'play' || phase === 'calibrate') && !!coachCue && (
                <View style={styles.cueWrap} pointerEvents="none">
                  <Text style={styles.cueText}>{coachCue}</Text>
                </View>
              )}
            </View>
          ) : (
            <CameraStage
              {...poseStageNativeProps(pose)}
              previewContainerId={previewContainerId}
              cameraSupported={cameraSupported}
              permissionGranted={permissionGranted}
              hasCamera={hasCamera}
              present={sample.present}
              isDetecting={pose.isDetecting}
              calibrating={phase === 'calibrate'}
              quality={quality}
              glowColor={T.glow}
              hero={T.hero}
              coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
            >
              {renderOverlay()}
            </CameraStage>
          )}
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {tracking.error && camLive && <Text style={styles.errorText}>{tracking.error}</Text>}
            <View style={styles.skillRow}>
              {T.skillTags.map((tag) => (
                <View key={tag} style={styles.skillPill}>
                  <Text style={styles.skillText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: T.accent }]}
              onPress={() => {
                speakTTS(T.voiceIntro, 0.85).catch(() => {});
                tracking.requestCameraAccess().finally(() => beginCalibration());
              }}
            >
              <Text style={styles.primaryBtnText}>Enter Cloud Loft</Text>
            </Pressable>
            {cameraSupported && !camLive && (
              <Pressable style={styles.secondaryBtn} onPress={() => setForceFallback(true)}>
                <Text style={styles.secondaryText}>Skip camera — guided mode</Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BalloonBreathingGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.65)' },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: '#0369A1', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#0C4A6E', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#0369A1', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  statLabel: { fontSize: 10, fontWeight: '800' },
  statValue: { fontSize: 16, fontWeight: '900' },
  statEmoji: { fontSize: 16 },
  stageWrap: { flex: 1, marginHorizontal: 16, marginBottom: 8, minHeight: 300 },
  nativeStage: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: CLOUD_SHELL.stageBorder,
    backgroundColor: CLOUD_SHELL.stageBg,
    position: 'relative',
  },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#0C4A6E', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(12,74,110,0.1)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#38BDF8' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CLOUD_SHELL.glassBorder,
  },
  cueText: { color: '#0369A1', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: CLOUD_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(56,189,248,0.15)' },
  skillText: { color: '#0369A1', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#0369A1', fontWeight: '700' },
  errorText: { color: CLOUD_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
