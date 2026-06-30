/**
 * OT Level 10 · Session 4 · Game 3 — Catch & Turn
 *
 * Whirlwind catch arena: intercept the flying orb with the correct
 * hand, then turn body to the spin marker and hold. Camera tracks
 * catch timing, turn accuracy, posture, attention and completion.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { HandReachOverlay } from '@/components/game/occupational/level10/session1/components/HandReachOverlay';
import { movementSmoothness } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { CATCH_TURN_PACING as P } from '@/components/game/occupational/level10/session4/catchTurnPacing';
import {
  CATCH_SHELL,
  CATCH_TURN_ROUNDS,
  CATCH_TURN_THEME as T,
  type CatchHand,
  type CatchTurnRound,
} from '@/components/game/occupational/level10/session4/catchTurnTheme';
import { CatchTurnOverlay } from '@/components/game/occupational/level10/session4/components/CatchTurnOverlay';
import { CatchTurnVisuals } from '@/components/game/occupational/level10/session4/components/CatchTurnVisuals';
import { SensoryMotorMeter } from '@/components/game/occupational/level10/session4/components/SensoryMotorMeter';
import {
  catchTurnQuality,
  inCatchZone,
  inTurnZone,
  orbPosition,
} from '@/components/game/occupational/level10/session4/catchTurnUtils';
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
const VOICE_PRAISE = ['Great catch!', 'Smooth turn!', 'Arena star!', 'Whirlwind pro!', 'Spin master!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'catch' | 'turn';

const handPoint = (hand: CatchHand, left: { x: number; y: number } | null, right: { x: number; y: number } | null) =>
  hand === 'left' ? left : right;

const CatchTurnGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [completed, setCompleted] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('catch');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [catchScore, setCatchScore] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [focus, setFocus] = useState(0);
  const [quality, setQuality] = useState(0);
  const [catching, setCatching] = useState(false);
  const [turning, setTurning] = useState(false);
  const [orbPos, setOrbPos] = useState(CATCH_TURN_ROUNDS[0]!.spawn);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const catchRound = CATCH_TURN_ROUNDS[Math.min(round, CATCH_TURN_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('catch');
  const roundRef = useRef<CatchTurnRound>(catchRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const catchStartRef = useRef(0);
  const turnStartRef = useRef(0);
  const prevHandRef = useRef(sample.leftWrist);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const motorSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { roundRef.current = catchRound; }, [catchRound]);
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

  const beginTurnPhase = useCallback((cr: CatchTurnRound) => {
    roundPhaseRef.current = 'turn';
    setRoundPhase('turn');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setBanner(T.turnLabel);
    setCoachCue(cr.turnCue);
    turnStartRef.current = Date.now();
    speakTTS(cr.voiceTurn, 0.85).catch(() => {});
    playSound('clap', 0.58, 1.1).catch(() => {});
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
    const xp = done * 18 + accuracy + Math.round(motorSumRef.current / Math.max(1, done) * 20);
    setFinalStats({ correct: done, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'catch-turn',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, integration: motorSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('catch-turn', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback((r: number) => {
    const cr = CATCH_TURN_ROUNDS[Math.min(r, CATCH_TURN_ROUNDS.length - 1)]!;
    setRound(r);
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    roundPhaseRef.current = 'catch';
    setRoundPhase('catch');
    setBanner(T.catchLabel);
    setCoachCue(cr.voiceCatch);
    setCatching(false);
    setTurning(false);
    catchStartRef.current = Date.now();
    setOrbPos(cr.spawn);
    speakTTS(cr.voiceCatch, 0.82).catch(() => {});
  }, []);

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.turnHoldMs);
    completedRef.current += 1;
    motorSumRef.current += quality;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setCompleted(next);

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, quality, recordHold, recordStar, schedule, startRound, totalRounds]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const cr = roundRef.current;
    const rp = roundPhaseRef.current;

    if (!camLiveRef.current) {
      if (rp === 'catch') {
        const elapsed = now - catchStartRef.current;
        const t = clamp01(elapsed / P.fallbackCatchMs);
        setOrbPos(orbPosition(cr.spawn, cr.catch, t));
        setCatchScore(t * 0.82);
        if (elapsed >= P.fallbackCatchMs) beginTurnPhase(cr);
      } else {
        const elapsed = now - turnStartRef.current;
        const t = clamp01(elapsed / P.fallbackTurnMs);
        setHoldProgress(t);
        setTurnScore(0.84);
        if (t >= 1) completeRound();
      }
      setFocus(0.8);
      setQuality(0.86);
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      return;
    }

    const s = sampleRef.current;
    const hand = handPoint(cr.hand, s.leftWrist, s.rightWrist);
    const cursor = s.cursor;

    if (!s.present || !hand) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prevHand = prevHandRef.current;
    prevHandRef.current = hand;
    const handSmooth = movementSmoothness(prevHand, hand);

    if (rp === 'catch') {
      const elapsed = now - catchStartRef.current;
      const t = clamp01(elapsed / P.catchFlightMs);
      const pos = orbPosition(cr.spawn, cr.catch, t);
      setOrbPos(pos);

      const inWindow = t >= P.catchWindowStart;
      const onCatch = inCatchZone(hand, cr.catch) && inWindow;
      const holdPct = clamp01(holdMsRef.current / P.catchHoldMs);
      const q = catchTurnQuality(onCatch, false, holdPct, t, handSmooth, s.postureQuality, s.attentionScore);

      setCatching(onCatch);
      setTurning(false);
      setCatchScore(onCatch ? holdPct * 0.6 + 0.35 : t * 0.4);
      setTurnScore(0.3);
      setFocus(s.attentionScore);
      setQuality(q);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(onCatch ? T.holdCatchLabel : T.catchLabel);
      setCoachCue(onCatch ? 'Hold the catch!' : cr.voiceCatch);

      if (onCatch) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        setHoldProgress(clamp01(holdMsRef.current / P.catchHoldMs));
        if (holdMsRef.current >= P.catchHoldMs) beginTurnPhase(cr);
      } else if (now - (lastInZoneRef.current || now) > P.catchGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.45);
        setHoldProgress(clamp01(holdMsRef.current / P.catchHoldMs));
        lastInZoneRef.current = 0;
      }

      if (t >= 1 && holdMsRef.current < P.catchHoldMs * 0.4 && !onCatch) {
        setCoachCue('Catch the orb at the target zone!');
      }

      recordTick(dt, { upright: s.postureQuality > 0.35, still: handSmooth > 0.35, quality: q });
      return;
    }

    // turn phase
    const prevCursor = prevCursorRef.current;
    prevCursorRef.current = cursor;
    const cursorSmooth = movementSmoothness(prevCursor, cursor);
    const onTurn = inTurnZone(cursor, cr.turn);
    const holdPct = clamp01(holdMsRef.current / P.turnHoldMs);
    const q = catchTurnQuality(false, onTurn, holdPct, 1, cursorSmooth, s.postureQuality, s.attentionScore);

    setCatching(false);
    setTurning(onTurn);
    setCatchScore(0.85);
    setTurnScore(onTurn ? holdPct * 0.65 + cursorSmooth * 0.35 : cursorSmooth * 0.25);
    setFocus(s.attentionScore);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    setBanner(onTurn ? T.holdTurnLabel : T.turnLabel);
    setCoachCue(onTurn ? cr.turnCue : cr.voiceTurn);

    if (onTurn) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      setHoldProgress(clamp01(holdMsRef.current / P.turnHoldMs));
      if (holdMsRef.current >= P.turnHoldMs) completeRound();
    } else if (now - (lastInZoneRef.current || now) > P.turnGraceMs) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / P.turnHoldMs));
      lastInZoneRef.current = 0;
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: cursorSmooth > 0.35,
      quality: q,
    });
  }, [beginTurnPhase, completeRound, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    motorSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Show your hands — arena sensors calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} catches & turns · ${finalStats.accuracy}% quality`}
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
      <CatchTurnVisuals turnPhase={roundPhase === 'turn'} />
      <SensoryMotorMeter balance={catchScore} reach={turnScore} focus={focus} />
      {phase === 'play' && (
        <>
          <CatchTurnOverlay
            round={catchRound}
            orbPos={orbPos}
            phase={roundPhase}
            holdProgress={holdProgress}
            catching={catching}
            turning={turning}
            showTurn={roundPhase === 'turn'}
          />
          <HandReachOverlay
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            requiredHand={roundPhase === 'catch' ? catchRound.hand : 'both'}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={CATCH_SHELL.sparkleColor} count={26} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Arena calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: CATCH_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: CATCH_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌀 {CATCH_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: CATCH_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CATCH_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: CATCH_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: CATCH_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🤾</Text>
              <Text style={[styles.statValue, { color: CATCH_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: CATCH_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CATCH_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: CATCH_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Enter Arena</Text>
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

export default CatchTurnGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: CATCH_SHELL.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#FFFBEB', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#E9D5FF', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: CATCH_SHELL.stageBorder,
    backgroundColor: CATCH_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(30,27,75,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CATCH_SHELL.glassBorder,
  },
  phaseBannerText: { color: CATCH_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#FFFBEB', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#FBBF24' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(30,27,75,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CATCH_SHELL.glassBorder,
  },
  cueText: { color: CATCH_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: CATCH_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(251,191,36,0.15)' },
  skillText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#422006', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#E9D5FF', fontWeight: '700' },
  errorText: { color: CATCH_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
