/**
 * OT Level 10 · Session 2 · Game 2 — Slow Motion Walk
 *
 * Glide slowly along twilight path stones. Camera tracks movement speed,
 * smoothness, posture, attention and hold completion.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import {
  distNorm,
  movementSmoothness,
} from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { RegulationMeter } from '@/components/game/occupational/level10/session2/components/RegulationMeter';
import { SlowMotionWalkVisuals } from '@/components/game/occupational/level10/session2/components/SlowMotionWalkVisuals';
import { SlowPathWaypoints } from '@/components/game/occupational/level10/session2/components/SlowPathWaypoints';
import { SLOW_MOTION_WALK_PACING as P } from '@/components/game/occupational/level10/session2/slowMotionWalkPacing';
import {
  SLOW_MOTION_WALK_THEME as T,
  TWILIGHT_SHELL,
  WALK_STONES,
  type WalkStone,
  type WalkStoneId,
} from '@/components/game/occupational/level10/session2/slowMotionWalkTheme';
import {
  inStoneZone,
  isMovingTooFast,
  slowMotionScore,
  slowWalkQualityScore,
} from '@/components/game/occupational/level10/session2/slowMotionWalkUtils';
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
const VOICE_PRAISE = ['So slow!', 'Smooth walker!', 'Calm steps!', 'Great glide!', 'Perfect pace!'];

type Phase = 'intro' | 'calibrate' | 'play';

function stoneAtCursor(cursor: { x: number; y: number } | null, stones: WalkStone[]): WalkStone | null {
  if (!cursor) return null;
  for (const stone of stones) {
    if (inStoneZone(cursor, stone)) return stone;
  }
  return null;
}

const SlowMotionWalkGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalWaypoints = P.waypoints;
  const stones = WALK_STONES;

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
  const [waypoint, setWaypoint] = useState(0);
  const [steps, setSteps] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [regulation, setRegulation] = useState(0);
  const [slowScore, setSlowScore] = useState(0);
  const [steadiness, setSteadiness] = useState(0);
  const [quality, setQuality] = useState(0);
  const [completedIds, setCompletedIds] = useState<WalkStoneId[]>([]);
  const [cursorOnId, setCursorOnId] = useState<WalkStoneId | null>(null);
  const [tooFast, setTooFast] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const targetStone = stones[Math.min(waypoint, stones.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const waypointRef = useRef(0);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const reachStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const regulationSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
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

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const completed = completedRef.current;
    const xp = completed * 15 + accuracy + Math.round(regulationSumRef.current / Math.max(1, completed) * 18);
    setFinalStats({ correct: completed, total: totalWaypoints, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'slow-motion-walk',
        score: completed,
        accuracy,
        meta: { ...analyticsMeta, regulation: regulationSumRef.current / Math.max(1, completed) },
      });
      await logGameAndAward('slow-motion-walk', completed, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalWaypoints, tracking.vision]);

  const startWaypoint = useCallback(
    (w: number) => {
      const stone = stones[Math.min(w, stones.length - 1)]!;
      waypointRef.current = w;
      setWaypoint(w);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setTooFast(false);
      setBanner(T.reachLabel);
      setCoachCue(stone.voiceCue);
      reachStartRef.current = Date.now();
      speakTTS(stone.voiceCue, 0.82).catch(() => {});
    },
    [stones],
  );

  const completeWaypoint = useCallback(() => {
    if (doneRef.current) return;
    const stone = stones[Math.min(waypointRef.current, stones.length - 1)]!;
    setHoldProgress(0);
    setBanner('');
    setCursorOnId(null);
    setTooFast(false);

    recordHold(P.holdToReachMs);
    completedRef.current += 1;
    regulationSumRef.current += regulation;

    const reachMs = Date.now() - reachStartRef.current;
    const quickBonus = reachMs < P.quickReachBonusMs;

    setCompletedIds((ids) => [...ids, stone.id]);
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNWaypoints === 0 || quickBonus) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setSteps(next);

    if (next >= totalWaypoints) {
      schedule(() => endGame(), P.betweenWaypointsMs);
    } else {
      schedule(() => startWaypoint(next), P.betweenWaypointsMs);
    }
  }, [endGame, recordHold, recordStar, regulation, schedule, startWaypoint, stones, totalWaypoints]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const s = sampleRef.current;
    const target = stones[Math.min(waypointRef.current, stones.length - 1)]!;
    const onStone = stoneAtCursor(s.cursor, stones);
    setCursorOnId(onStone?.id ?? null);

    if (!camLiveRef.current) {
      const elapsed = now - reachStartRef.current;
      const t = clamp01(elapsed / P.fallbackReachMs);
      setHoldProgress(t);
      setSlowScore(0.78);
      setSteadiness(0.8);
      setRegulation(0.76);
      setQuality(0.84);
      if (t >= 1) completeWaypoint();
      recordTick(dt, { upright: true, still: false, quality: 0.84 });
      return;
    }

    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    const motion = prev && s.cursor ? distNorm(prev, s.cursor) : 0;
    prevCursorRef.current = s.cursor;

    const smooth = movementSmoothness(prev, s.cursor, 0.05);
    const slow = slowMotionScore(motion, P.maxSlowMotionNorm, P.fastMotionNorm);
    const inZone = inStoneZone(s.cursor, target);
    const fast = isMovingTooFast(motion, P.fastMotionNorm);
    setTooFast(fast && inZone);

    const q = slowWalkQualityScore(slow, smooth, s.postureQuality, s.attentionScore, inZone);
    const reg = clamp01(slow * 0.5 + smooth * 0.25 + s.postureQuality * 0.25);

    setSlowScore(slow);
    setSteadiness(smooth);
    setRegulation(reg);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (inZone) {
      if (fast) {
        setCoachCue(T.fastCue);
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 1.2);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToReachMs));
        lastInZoneRef.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (slow > 0.4) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt * clamp01(slow);
        const prog = clamp01(holdMsRef.current / P.holdToReachMs);
        setHoldProgress(prog);
        setBanner(T.holdLabel);
        setCoachCue('Hold steady — slow and calm…');
        if (prog >= 1) completeWaypoint();
      } else {
        setCoachCue('Move slower toward the stone…');
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.4);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToReachMs));
      }
    } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / P.holdToReachMs));
      lastInZoneRef.current = 0;
      setBanner(T.slowLabel);
      setCoachCue(target.voiceCue);
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: smooth > 0.5,
      quality: q,
    });
  }, [completeWaypoint, recordTick, stones]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    regulationSumRef.current = 0;
    setCompletedIds([]);
    resetAnalytics();
    schedule(() => startWaypoint(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startWaypoint, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Stand calmly — show your face and upper body…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} slow steps · ${finalStats.accuracy}% quality`}
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
      <SlowMotionWalkVisuals />
      <RegulationMeter regulation={regulation} sync={slowScore} steadiness={steadiness} />
      {phase === 'play' && (
        <>
          <SlowPathWaypoints
            stones={stones}
            activeStoneId={targetStone.id}
            completedIds={completedIds}
            holdProgress={holdProgress}
            cursorOnId={cursorOnId}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={[styles.phaseBanner, tooFast && styles.phaseBannerWarn]} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{tooFast ? T.fastCue : banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={TWILIGHT_SHELL.sparkleColor} count={22} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Slow-path calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: TWILIGHT_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: TWILIGHT_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🐢 {TWILIGHT_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: TWILIGHT_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TWILIGHT_SHELL.statLabel }]}>Step</Text>
              <Text style={[styles.statValue, { color: TWILIGHT_SHELL.statValue }]}>
                {Math.min(waypoint + (phase === 'play' ? 1 : 0), totalWaypoints)}/{totalWaypoints}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: TWILIGHT_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🐢</Text>
              <Text style={[styles.statValue, { color: TWILIGHT_SHELL.statValue }]}>{steps}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: TWILIGHT_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TWILIGHT_SHELL.statLabel }]}>Pace</Text>
              <Text style={[styles.statValue, { color: TWILIGHT_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Enter Twilight Path</Text>
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

export default SlowMotionWalkGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: TWILIGHT_SHELL.accentSilver, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: TWILIGHT_SHELL.stageBorder,
    backgroundColor: TWILIGHT_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TWILIGHT_SHELL.glassBorder,
  },
  phaseBannerWarn: { borderColor: TWILIGHT_SHELL.warn },
  phaseBannerText: { color: TWILIGHT_SHELL.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#F8FAFC', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#2DD4BF' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(15,23,42,0.82)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TWILIGHT_SHELL.glassBorder,
  },
  cueText: { color: TWILIGHT_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: TWILIGHT_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(45,212,191,0.15)' },
  skillText: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#042F2E', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#94A3B8', fontWeight: '700' },
  errorText: { color: TWILIGHT_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
