/**
 * OT Level 10 · Session 2 · Game 3 — Heavy Work Break
 *
 * Proprioceptive regulation stations: push, wall push, pull apart,
 * carry and press-in. Camera tracks bilateral wrist placement,
 * effort, posture, steadiness and sustained holds.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  distNorm,
  movementSmoothness,
} from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { HeavyWorkHandsOverlay } from '@/components/game/occupational/level10/session2/components/HeavyWorkHandsOverlay';
import { HeavyWorkStationView } from '@/components/game/occupational/level10/session2/components/HeavyWorkStationView';
import { HeavyWorkVisuals } from '@/components/game/occupational/level10/session2/components/HeavyWorkVisuals';
import { RegulationMeter } from '@/components/game/occupational/level10/session2/components/RegulationMeter';
import { HEAVY_WORK_PACING as P } from '@/components/game/occupational/level10/session2/heavyWorkPacing';
import {
  FORGE_SHELL,
  HEAVY_WORK_STATIONS,
  HEAVY_WORK_THEME as T,
  type HeavyWorkStation,
} from '@/components/game/occupational/level10/session2/heavyWorkTheme';
import {
  bilateralZoneStatus,
  heavyEffortScore,
  heavyWorkQualityScore,
  heavyWorkSatisfied,
} from '@/components/game/occupational/level10/session2/heavyWorkUtils';
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
const VOICE_PRAISE = ['Strong work!', 'Great push!', 'Power break!', 'So steady!', 'Heavy work star!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'briefing' | 'work';

const HeavyWorkBreakGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalStations = P.stations;

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
  const [stationIdx, setStationIdx] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('briefing');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [regulation, setRegulation] = useState(0);
  const [effort, setEffort] = useState(0);
  const [steadiness, setSteadiness] = useState(0);
  const [quality, setQuality] = useState(0);
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const station = HEAVY_WORK_STATIONS[Math.min(stationIdx, HEAVY_WORK_STATIONS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('briefing');
  const stationRef = useRef<HeavyWorkStation>(station);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const stationIdxRef = useRef(0);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const workStartRef = useRef(0);
  const prevLeftRef = useRef(sample.leftWrist);
  const prevRightRef = useRef(sample.rightWrist);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const regulationSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { stationRef.current = station; }, [station]);
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

  const beginWorkPhase = useCallback((s: HeavyWorkStation) => {
    roundPhaseRef.current = 'work';
    setRoundPhase('work');
    setBanner(T.workLabel);
    setCoachCue(s.seekCue);
    workStartRef.current = Date.now();
    holdMsRef.current = 0;
    setHoldProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const done = completedRef.current;
    const xp = done * 16 + accuracy + Math.round(regulationSumRef.current / Math.max(1, done) * 20);
    setFinalStats({ correct: done, total: totalStations, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'heavy-work-break',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, regulation: regulationSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('heavy-work-break', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalStations, tracking.vision]);

  const startStation = useCallback(
    (idx: number) => {
      const s = HEAVY_WORK_STATIONS[Math.min(idx, HEAVY_WORK_STATIONS.length - 1)]!;
      stationIdxRef.current = idx;
      setStationIdx(idx);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setLeftActive(false);
      setRightActive(false);
      roundPhaseRef.current = 'briefing';
      setRoundPhase('briefing');
      setBanner(T.pushLabel);
      setCoachCue(s.voiceCue);
      speakTTS(s.voiceCue, 0.82).catch(() => {});
      schedule(() => beginWorkPhase(s), P.briefingMs);
    },
    [beginWorkPhase, schedule],
  );

  const completeStation = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');
    setLeftActive(false);
    setRightActive(false);

    recordHold(P.holdToCompleteMs);
    completedRef.current += 1;
    regulationSumRef.current += regulation;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNStations === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setCompleted(next);

    if (next >= totalStations) {
      schedule(() => endGame(), P.betweenStationsMs);
    } else {
      schedule(() => startStation(next), P.betweenStationsMs);
    }
  }, [endGame, recordHold, recordStar, regulation, schedule, startStation, totalStations]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const s = sampleRef.current;
    const st = stationRef.current;
    const zones = bilateralZoneStatus(s, st);
    setLeftActive(zones.leftOk);
    setRightActive(zones.rightOk);

    if (roundPhaseRef.current === 'briefing') {
      recordTick(dt, { upright: true, still: true, quality: 0.7 });
      return;
    }

    if (!camLiveRef.current) {
      const elapsed = now - workStartRef.current;
      const t = clamp01(elapsed / P.fallbackWorkMs);
      setHoldProgress(t);
      setEffort(0.8);
      setSteadiness(0.78);
      setRegulation(0.82);
      setQuality(0.85);
      if (t >= 1) completeStation();
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      return;
    }

    const hasHands = Boolean(s.leftWrist && s.rightWrist);
    if (!hasHands) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prevL = prevLeftRef.current;
    const prevR = prevRightRef.current;
    const motion =
      (prevL && s.leftWrist ? distNorm(prevL, s.leftWrist) : 0) +
      (prevR && s.rightWrist ? distNorm(prevR, s.rightWrist) : 0);
    prevLeftRef.current = s.leftWrist;
    prevRightRef.current = s.rightWrist;

    const smooth = movementSmoothness(prevL ?? prevR, s.leftWrist ?? s.rightWrist, 0.055);
    const satisfied = heavyWorkSatisfied(s, st);
    const effortScore = heavyEffortScore(s, st);
    const q = heavyWorkQualityScore(effortScore, smooth, s.postureQuality, s.attentionScore, satisfied);
    const reg = clamp01(effortScore * 0.55 + smooth * 0.2 + s.postureQuality * 0.25);

    setEffort(effortScore);
    setSteadiness(smooth);
    setRegulation(reg);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (satisfied) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      const prog = clamp01(holdMsRef.current / P.holdToCompleteMs);
      setHoldProgress(prog);
      setBanner(T.holdLabel);
      setCoachCue('Hold steady — strong heavy work!');
      if (prog >= 1) completeStation();
    } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.55);
      setHoldProgress(clamp01(holdMsRef.current / P.holdToCompleteMs));
      lastInZoneRef.current = 0;
      setBanner(T.workLabel);
      setCoachCue(st.seekCue);
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: smooth > 0.45,
      quality: q,
    });
  }, [completeStation, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    regulationSumRef.current = 0;
    resetAnalytics();
    schedule(() => startStation(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startStation, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Show both hands and upper body to the camera…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} heavy work breaks · ${finalStats.accuracy}% quality`}
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
      <HeavyWorkVisuals />
      <RegulationMeter regulation={regulation} sync={effort} steadiness={steadiness} />
      {phase === 'play' && (
        <>
          <HeavyWorkStationView
            station={station}
            holdProgress={holdProgress}
            leftActive={leftActive}
            rightActive={rightActive}
            working={roundPhase === 'work'}
          />
          <HeavyWorkHandsOverlay leftWrist={sample.leftWrist} rightWrist={sample.rightWrist} />
          {!!banner && roundPhase === 'work' && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={FORGE_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Heavy work calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: FORGE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: FORGE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧱 {FORGE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: FORGE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: FORGE_SHELL.statLabel }]}>Station</Text>
              <Text style={[styles.statValue, { color: FORGE_SHELL.statValue }]}>
                {Math.min(stationIdx + (phase === 'play' ? 1 : 0), totalStations)}/{totalStations}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: FORGE_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>💪</Text>
              <Text style={[styles.statValue, { color: FORGE_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: FORGE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: FORGE_SHELL.statLabel }]}>Power</Text>
              <Text style={[styles.statValue, { color: FORGE_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              present={Boolean(sample.leftWrist || sample.rightWrist || sample.present)}
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
              <Text style={styles.primaryBtnText}>Enter Forge Yard</Text>
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

export default HeavyWorkBreakGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: FORGE_SHELL.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#FFFBEB', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#FDE68A', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    borderColor: FORGE_SHELL.stageBorder,
    backgroundColor: FORGE_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(28,25,23,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FORGE_SHELL.glassBorder,
  },
  phaseBannerText: { color: FORGE_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#FFFBEB', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#F97316' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(28,25,23,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FORGE_SHELL.glassBorder,
  },
  cueText: { color: FORGE_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: FORGE_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.18)' },
  skillText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#FDE68A', fontWeight: '700' },
  errorText: { color: FORGE_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
