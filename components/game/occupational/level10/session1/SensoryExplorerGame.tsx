/**
 * OT Level 10 · Session 1 · Game 1 — Sensory Explorer
 *
 * Camera tracks absolute body coordinates (nose, wrists) via vision module on APK
 * and MediaPipe pose/face on web. Child guides their explorer dot onto sensory
 * crystal portals and holds to collect each zone.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { IntegrationMeter } from '@/components/game/occupational/level10/session1/components/IntegrationMeter';
import { SensoryExplorerVisuals } from '@/components/game/occupational/level10/session1/components/SensoryExplorerVisuals';
import { SensoryOrb } from '@/components/game/occupational/level10/session1/components/SensoryOrb';
import { SESSION10_1_PACING as P } from '@/components/game/occupational/level10/session1/session1Pacing';
import {
  SENSORY_EXPLORER_THEME as T,
  SENSORY_SHELL,
  SENSORY_ZONES,
} from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';
import {
  adaptiveResponseScore,
  distNorm,
  engagementFromMotion,
  inOrbZone,
  movementSmoothness,
} from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
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
const VOICE_PRAISE = ['Beautiful!', 'Sensory star!', 'So focused!', 'Great integration!', 'Amazing explorer!'];

type Phase = 'intro' | 'calibrate' | 'play';

const SensoryExplorerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalRounds = P.rounds;

  const [active, setActive] = useState(true);
  const tracking = useSensoryTracking(active);
  const { sample, hasCamera, cameraSupported, pose, vision, previewContainerId, permissionGranted } = tracking;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordStar,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [integration, setIntegration] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [attention, setAttention] = useState(0);
  const [quality, setQuality] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const roundActiveRef = useRef(false);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const roundStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const integrationSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const zone = SENSORY_ZONES[Math.min(round, SENSORY_ZONES.length - 1)] ?? SENSORY_ZONES[0];
  const target = P.orbTargets[Math.min(round, P.orbTargets.length - 1)] ?? P.orbTargets[0];

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
    const xp = crystals * 14 + accuracy + Math.round(integrationSumRef.current / Math.max(1, completedRef.current));
    setFinalStats({ correct: completedRef.current, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'sensory-explorer',
        score: crystals,
        accuracy,
        meta: { ...analyticsMeta, integration: integrationSumRef.current / Math.max(1, completedRef.current) },
      });
      await logGameAndAward('sensory-explorer', crystals, xp);
    } catch {
      // offline ok
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, crystals, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      roundRef.current = r;
      setRound(r);
      roundActiveRef.current = true;
      setRoundActive(true);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      roundStartRef.current = Date.now();
      setHoldProgress(0);
      const z = SENSORY_ZONES[Math.min(r, SENSORY_ZONES.length - 1)]!;
      setBanner(z.label);
      setCoachCue(z.story);
      speakTTS(z.voiceCue, 0.82).catch(() => {});
    },
    [],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    setHoldProgress(0);
    setBanner('');

    recordHold(P.holdToCollectMs);
    completedRef.current += 1;
    integrationSumRef.current += integration;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setCrystals((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    } else {
      setCrystals((c) => c + 1);
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, integration, recordHold, recordStar, schedule, startRound, totalRounds]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const s = sampleRef.current;
    const tgt = P.orbTargets[Math.min(roundRef.current, P.orbTargets.length - 1)]!;

    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - roundStartRef.current;
        const t = clamp01(elapsed / P.fallbackReachMs);
        setHoldProgress(t);
        setEngagement(0.75);
        setAttention(0.8);
        setQuality(0.82);
        setIntegration(0.5 + t * 0.4);
        if (t >= 1) completeRound();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.82 });
      return;
    }

    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      setHoldProgress(0);
      holdMsRef.current = 0;
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    setCoachCue(T.holdCue);
    const inZone = inOrbZone(s.cursor, tgt);
    const prev = prevCursorRef.current;
    const smooth = movementSmoothness(prev, s.cursor);
    const motion = prev && s.cursor ? distNorm(prev, s.cursor) : 0;
    prevCursorRef.current = s.cursor;
    const engage = engagementFromMotion(motion);
    const attn = s.attentionScore;
    const adapt = adaptiveResponseScore(inZone, holdMsRef.current / P.holdToCollectMs, s.postureQuality, smooth, attn);
    const q = clamp01(adapt * 0.7 + s.postureQuality * 0.3);

    setEngagement(engage);
    setAttention(attn);
    setIntegration(adapt);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (roundActiveRef.current) {
      if (inZone) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToCollectMs);
        setHoldProgress(prog);
        if (prog >= 1) completeRound();
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.6);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToCollectMs));
        lastInZoneRef.current = 0;
      }
    }

    recordTick(dt, { upright: s.postureQuality > 0.4, still: smooth > 0.6, quality: q });
  }, [completeRound, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    integrationSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Sit comfortably — we are mapping your sensory baseline…');
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
    onBack?.();
  }, [clearTimers, onBack]);

  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        title={T.congrats}
        subtitle={`${finalStats.correct}/${finalStats.total} crystals · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const renderPlayOverlay = () => (
    <>
      <SensoryExplorerVisuals zoneColor={zone.color} />
      <IntegrationMeter integration={integration} engagement={engagement} attention={attention} />
      {phase === 'play' && (
        <>
          <SensoryOrb
            target={target}
            zone={zone}
            holdProgress={holdProgress}
            active={roundActive}
            collected={false}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            accent={zone.color}
          />
          {!!banner && (
            <View style={styles.bannerWrap} pointerEvents="none">
              <Text style={[styles.banner, { color: zone.color }]}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={SENSORY_SHELL.sparkleColor} count={20} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Sensory calibration… {Math.round(calibProgress * 100)}%</Text>
          <View style={styles.calibTrack}>
            <View style={[styles.calibFill, { width: `${calibProgress * 100}%`, backgroundColor: zone.color }]} />
          </View>
        </View>
      )}
    </>
  );

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: SENSORY_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: SENSORY_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌈 {SENSORY_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: SENSORY_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: SENSORY_SHELL.statLabel }]}>Portal</Text>
              <Text style={[styles.statValue, { color: SENSORY_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: SENSORY_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🔮</Text>
              <Text style={[styles.statValue, { color: SENSORY_SHELL.statValue }]}>{crystals}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: SENSORY_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: SENSORY_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: SENSORY_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          {useNativeVision ? (
            <View style={styles.nativeStage}>
              <VisionTrackingView active={camLive} style={StyleSheet.absoluteFill} />
              {renderPlayOverlay()}
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
              glowColor={zone.glow}
              hero={T.hero}
              coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
            >
              {renderPlayOverlay()}
            </CameraStage>
          )}
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {tracking.error && camLive && (
              <Text style={styles.errorText}>{tracking.error}</Text>
            )}
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
              <Text style={styles.primaryBtnText}>Begin Aurora Quest</Text>
            </Pressable>
            {!cameraSupported && (
              <Pressable style={styles.secondaryBtn} onPress={() => setForceFallback(true)}>
                <Text style={styles.secondaryText}>Play guided mode</Text>
              </Pressable>
            )}
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

export default SensoryExplorerGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: '#A5F3FC', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#C4B5FD', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: SENSORY_SHELL.stageBorder,
    backgroundColor: SENSORY_SHELL.stageBg,
    position: 'relative',
  },
  bannerWrap: { position: 'absolute', top: '58%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { fontSize: 18, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6 },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(5,11,26,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SENSORY_SHELL.glassBorder,
  },
  cueText: { color: SENSORY_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: SENSORY_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(34,211,238,0.15)' },
  skillText: { color: '#A5F3FC', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#042F2E', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#C4B5FD', fontWeight: '700' },
  errorText: { color: SENSORY_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
