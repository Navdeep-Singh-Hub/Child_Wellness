/**
 * OT Level 10 · Session 3 · Game 3 — Pirate Detour
 *
 * Captain's course change: sail the planned route, then adapt
 * when a detour is called to reach the new island. Camera tracks
 * redirect speed, movement quality, posture, attention and holds.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import {
  adaptiveMotorQuality,
  adaptSpeedScore,
  redirectSmoothness,
} from '@/components/game/occupational/level10/session3/adaptiveMotorUtils';
import { AdaptiveMeter } from '@/components/game/occupational/level10/session3/components/AdaptiveMeter';
import { PirateDetourVisuals } from '@/components/game/occupational/level10/session3/components/PirateDetourVisuals';
import { PirateWaypointOverlay } from '@/components/game/occupational/level10/session3/components/PirateWaypointOverlay';
import { PIRATE_DETOUR_PACING as P } from '@/components/game/occupational/level10/session3/pirateDetourPacing';
import {
  PIRATE_DETOUR_ROUNDS,
  PIRATE_DETOUR_THEME as T,
  PIRATE_SHELL,
  type PirateDetourRound,
} from '@/components/game/occupational/level10/session3/pirateDetourTheme';
import { inDetourZone } from '@/components/game/occupational/level10/session3/pirateDetourUtils';
import { VisionTrackingView } from '@/hooks/useVisionTracking';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Ahoy!', 'Smooth sailing!', 'Detour hero!', 'Captain star!', 'Treasure course!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'route-a' | 'detour' | 'adapt-b';

const PirateDetourGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [detours, setDetours] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('route-a');
  const [activeRoute, setActiveRoute] = useState<'a' | 'b'>('a');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [detourFlash, setDetourFlash] = useState(false);
  const [adaptation, setAdaptation] = useState(0);
  const [focus, setFocus] = useState(0);
  const [flow, setFlow] = useState(0);
  const [quality, setQuality] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const detourRound = PIRATE_DETOUR_ROUNDS[Math.min(round, PIRATE_DETOUR_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('route-a');
  const routeRef = useRef<PirateDetourRound>(detourRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const detourAtRef = useRef(0);
  const adaptStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const adaptSumRef = useRef(0);
  const lastTickRef = useRef(0);
  const detourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { routeRef.current = detourRound; }, [detourRound]);
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
    if (detourTimerRef.current) clearTimeout(detourTimerRef.current);
    detourTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const beginAdaptPhase = useCallback((dr: PirateDetourRound) => {
    roundPhaseRef.current = 'adapt-b';
    setRoundPhase('adapt-b');
    setActiveRoute('b');
    setDetourFlash(false);
    setBanner(T.adaptLabel);
    setCoachCue(dr.adaptCue);
    adaptStartRef.current = Date.now();
    holdMsRef.current = 0;
    setHoldProgress(0);
    speakTTS(dr.voiceRouteB, 0.85).catch(() => {});
  }, []);

  const triggerDetour = useCallback(
    (dr: PirateDetourRound) => {
      roundPhaseRef.current = 'detour';
      setRoundPhase('detour');
      setDetourFlash(true);
      setBanner(T.detourLabel);
      setCoachCue(dr.voiceDetour);
      detourAtRef.current = Date.now();
      speakTTS(dr.voiceDetour, 0.88).catch(() => {});
      playSound('beep', 0.55, 0.95).catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      schedule(() => beginAdaptPhase(dr), P.detourFlashMs);
    },
    [beginAdaptPhase, schedule],
  );

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const done = completedRef.current;
    const xp = done * 16 + accuracy + Math.round(adaptSumRef.current / Math.max(1, done) * 22);
    setFinalStats({ correct: done, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'pirate-detour',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, adaptation: adaptSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('pirate-detour', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const dr = PIRATE_DETOUR_ROUNDS[Math.min(r, PIRATE_DETOUR_ROUNDS.length - 1)]!;
      setRound(r);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setDetourFlash(false);
      roundPhaseRef.current = 'route-a';
      setRoundPhase('route-a');
      setActiveRoute('a');
      setBanner(T.routeLabel);
      setCoachCue(dr.voiceRouteA);
      speakTTS(dr.voiceRouteA, 0.82).catch(() => {});

      if (detourTimerRef.current) clearTimeout(detourTimerRef.current);
      detourTimerRef.current = setTimeout(() => triggerDetour(dr), P.routeAPreviewMs + P.detourDelayMs);
    },
    [triggerDetour],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.holdToAdaptMs);
    completedRef.current += 1;
    adaptSumRef.current += adaptation;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setDetours(next);

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [adaptation, endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const dr = routeRef.current;
    const rp = roundPhaseRef.current;
    const target = rp === 'adapt-b' ? dr.routeB : dr.routeA;

    if (rp === 'detour') {
      recordTick(dt, { upright: true, still: false, quality: 0.75 });
      return;
    }

    if (!camLiveRef.current) {
      if (rp === 'adapt-b') {
        const elapsed = now - adaptStartRef.current;
        const t = clamp01(elapsed / P.fallbackAdaptMs);
        setHoldProgress(t);
        setAdaptation(0.82);
        setFocus(0.8);
        setFlow(0.84);
        setQuality(0.86);
        if (t >= 1) completeRound();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      return;
    }

    const s = sampleRef.current;
    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      if (rp === 'adapt-b') {
        holdMsRef.current = 0;
        setHoldProgress(0);
      }
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    prevCursorRef.current = s.cursor;
    const smooth = redirectSmoothness(prev, s.cursor);
    const inZone = inDetourZone(s.cursor, target);
    const onB = inDetourZone(s.cursor, dr.routeB);

    const adaptSpd =
      rp === 'adapt-b' && onB
        ? adaptSpeedScore(now - adaptStartRef.current, P.quickAdaptBonusMs)
        : 0.4;
    const holdPct = clamp01(holdMsRef.current / P.holdToAdaptMs);
    const q = adaptiveMotorQuality(inZone && rp === 'adapt-b', holdPct, adaptSpd, s.postureQuality, smooth, s.attentionScore);

    setAdaptation(rp === 'adapt-b' ? adaptSpd : smooth * 0.5);
    setFocus(s.attentionScore);
    setFlow(smooth);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (rp === 'route-a') {
      setCoachCue(inZone ? 'Good course — hold steady…' : dr.voiceRouteA);
      setBanner(T.routeLabel);
    }

    if (rp === 'adapt-b') {
      if (onB) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToAdaptMs);
        setHoldProgress(prog);
        setBanner(T.holdLabel);
        setCoachCue(dr.adaptCue);
        if (prog >= 1) completeRound();
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToAdaptMs));
        lastInZoneRef.current = 0;
        setBanner(T.adaptLabel);
        setCoachCue(dr.adaptCue);
      }
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: smooth > 0.4,
      quality: q,
    });
  }, [completeRound, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    adaptSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Show your face — compass calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} detours sailed · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const showA = true;
  const showB = roundPhase === 'detour' || roundPhase === 'adapt-b';
  const cursorOnActive =
    roundPhase === 'adapt-b'
      ? inDetourZone(sample.cursor, detourRound.routeB)
      : inDetourZone(sample.cursor, detourRound.routeA);

  const renderOverlay = () => (
    <>
      <PirateDetourVisuals detourFlash={detourFlash} />
      <AdaptiveMeter adaptation={adaptation} focus={focus} flow={flow} />
      {phase === 'play' && (
        <>
          <PirateWaypointOverlay
            routeA={detourRound.routeA}
            routeB={detourRound.routeB}
            activeRoute={activeRoute}
            showA={showA}
            showB={showB}
            detourFlash={detourFlash}
            holdProgress={holdProgress}
            cursorOnActive={cursorOnActive}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={[styles.phaseBanner, detourFlash && styles.phaseBannerDetour]} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={PIRATE_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Compass calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: PIRATE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: PIRATE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🏴‍☠️ {PIRATE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: PIRATE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PIRATE_SHELL.statLabel }]}>Voyage</Text>
              <Text style={[styles.statValue, { color: PIRATE_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: PIRATE_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>⚓</Text>
              <Text style={[styles.statValue, { color: PIRATE_SHELL.statValue }]}>{detours}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: PIRATE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PIRATE_SHELL.statLabel }]}>Adapt</Text>
              <Text style={[styles.statValue, { color: PIRATE_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Set Sail</Text>
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

export default PirateDetourGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: PIRATE_SHELL.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#FFFBEB', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#BAE6FD', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: PIRATE_SHELL.stageBorder,
    backgroundColor: PIRATE_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(12,25,41,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PIRATE_SHELL.glassBorder,
  },
  phaseBannerDetour: { borderColor: PIRATE_SHELL.warn, backgroundColor: 'rgba(120,53,15,0.78)' },
  phaseBannerText: { color: PIRATE_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#FFFBEB', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#EAB308' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(12,25,41,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PIRATE_SHELL.glassBorder,
  },
  cueText: { color: PIRATE_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: PIRATE_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(234,179,8,0.15)' },
  skillText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#422006', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#BAE6FD', fontWeight: '700' },
  errorText: { color: PIRATE_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
