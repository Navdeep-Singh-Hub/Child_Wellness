/**
 * OT Level 10 · Session 8 · Game 1 — Find Another Way
 *
 * Adaptive Path Quest: try each blocked path, then adapt
 * and find another way with calm posture and steady attention.
 * Camera tracks movement quality, posture, attention and task completion.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { movementSmoothness } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { AttentionMeter } from '@/components/game/occupational/level10/session6/components/AttentionMeter';
import { FindAnotherWayOverlay } from '@/components/game/occupational/level10/session8/components/FindAnotherWayOverlay';
import { FindAnotherWayVisuals } from '@/components/game/occupational/level10/session8/components/FindAnotherWayVisuals';
import { FIND_ANOTHER_WAY_PACING as P } from '@/components/game/occupational/level10/session8/findAnotherWayPacing';
import {
  FIND_ANOTHER_WAY_ROUNDS,
  FIND_ANOTHER_WAY_THEME as T,
  FIND_SHELL,
  type FindAnotherWayRound,
} from '@/components/game/occupational/level10/session8/findAnotherWayTheme';
import { inAdaptZone, inTryZone } from '@/components/game/occupational/level10/session8/findAnotherWayUtils';
import { problemSolvingQuality } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
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
const VOICE_PRAISE = ['Adapt star!', 'Clever path!', 'Great solve!', 'Problem champ!', 'Way finder!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'try' | 'adapt';

const FindAnotherWayGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('try');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [tryScore, setTryScore] = useState(0);
  const [adaptScore, setAdaptScore] = useState(0);
  const [calm, setCalm] = useState(0);
  const [focus, setFocus] = useState(0);
  const [quality, setQuality] = useState(0);
  const [onTry, setOnTry] = useState(false);
  const [onAdapt, setOnAdapt] = useState(false);
  const [showAdapt, setShowAdapt] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const pathRound = FIND_ANOTHER_WAY_ROUNDS[Math.min(round, FIND_ANOTHER_WAY_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('try');
  const roundRef = useRef<FindAnotherWayRound>(pathRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const tryMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const tryStartRef = useRef(0);
  const adaptStartRef = useRef(0);
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
  useEffect(() => { roundRef.current = pathRound; }, [pathRound]);
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

  const beginAdaptPhase = useCallback((fr: FindAnotherWayRound) => {
    roundPhaseRef.current = 'adapt';
    setRoundPhase('adapt');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setShowAdapt(true);
    setBanner(T.adaptLabel);
    setCoachCue(fr.adaptCue);
    adaptStartRef.current = Date.now();
    speakTTS(fr.voiceAdapt, 0.85).catch(() => {});
    playSound('clap', 0.55, 1.08).catch(() => {});
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
        gameId: 'find-another-way',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, adaptive: motorSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('find-another-way', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback((r: number) => {
    const fr = FIND_ANOTHER_WAY_ROUNDS[Math.min(r, FIND_ANOTHER_WAY_ROUNDS.length - 1)]!;
    setRound(r);
    holdMsRef.current = 0;
    tryMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    roundPhaseRef.current = 'try';
    setRoundPhase('try');
    setShowAdapt(false);
    setBanner(T.tryLabel);
    setCoachCue(fr.voiceTry);
    setOnTry(false);
    setOnAdapt(false);
    tryStartRef.current = Date.now();
    speakTTS(fr.voiceTry, 0.82).catch(() => {});
  }, []);

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.adaptHoldMs);
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

    const fr = roundRef.current;
    const rp = roundPhaseRef.current;

    if (!camLiveRef.current) {
      if (rp === 'try') {
        const elapsed = now - tryStartRef.current;
        const t = clamp01(elapsed / P.fallbackTryMs);
        setTryScore(t * 0.85);
        setAdaptScore(0.35);
        setCalm(0.5);
        setOnTry(t > 0.5);
        setHoldProgress(t);
        if (elapsed >= P.fallbackTryMs) beginAdaptPhase(fr);
      } else {
        const elapsed = now - adaptStartRef.current;
        const t = clamp01(elapsed / P.fallbackAdaptMs);
        setHoldProgress(t);
        setAdaptScore(0.84);
        setTryScore(0.8);
        setCalm(0.82);
        setOnAdapt(true);
        setShowAdapt(true);
        if (t >= 1) completeRound();
      }
      setFocus(0.8);
      setQuality(0.86);
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      return;
    }

    const s = sampleRef.current;
    const cursor = s.cursor;

    if (!s.present || !cursor) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    prevCursorRef.current = cursor;
    const smooth = movementSmoothness(prev, cursor);

    if (rp === 'try') {
      const atTry = inTryZone(cursor, fr);

      if (atTry) {
        tryMsRef.current += dt;
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
      } else if (now - (lastInZoneRef.current || now) > P.tryGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        lastInZoneRef.current = 0;
      }

      const holdPct = clamp01(holdMsRef.current / P.tryHoldMs);
      const q = problemSolvingQuality(atTry, false, holdPct, s.postureQuality, s.attentionScore, smooth, 'try');

      setOnTry(atTry);
      setOnAdapt(false);
      setTryScore(holdPct * 0.65 + (atTry ? 0.35 : smooth * 0.2));
      setAdaptScore(0.3);
      setCalm(smooth * 0.5 + s.attentionScore * 0.3);
      setFocus(s.attentionScore);
      setQuality(q);
      setHoldProgress(holdPct);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(T.holdTryLabel);
      setCoachCue(atTry ? `${fr.label} — try the path!` : fr.voiceTry);

      if (holdMsRef.current >= P.tryHoldMs) beginAdaptPhase(fr);

      recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.35, quality: q });
      return;
    }

    const atAdapt =
      inAdaptZone(cursor, fr) &&
      s.postureQuality >= P.minPostureForAdapt &&
      s.attentionScore >= P.minAttentionForAdapt;
    const holdPct = clamp01(holdMsRef.current / P.adaptHoldMs);
    const tryPct = clamp01(tryMsRef.current / P.tryHoldMs);
    const q = problemSolvingQuality(false, atAdapt, holdPct, s.postureQuality, s.attentionScore, smooth, 'adapt');

    setOnTry(false);
    setOnAdapt(atAdapt);
    setTryScore(tryPct);
    setAdaptScore(atAdapt ? holdPct * 0.65 + smooth * 0.35 : smooth * 0.25);
    setCalm(atAdapt ? smooth * 0.55 + s.attentionScore * 0.45 : smooth * 0.3);
    setFocus(s.attentionScore);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    setBanner(atAdapt ? T.holdAdaptLabel : T.adaptLabel);
    setCoachCue(atAdapt ? fr.adaptCue : fr.voiceAdapt);

    if (atAdapt) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      setHoldProgress(clamp01(holdMsRef.current / P.adaptHoldMs));
      if (holdMsRef.current >= P.adaptHoldMs) completeRound();
    } else if (now - (lastInZoneRef.current || now) > P.adaptGraceMs) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / P.adaptHoldMs));
      lastInZoneRef.current = 0;
    }

    recordTick(dt, {
      upright: s.postureQuality > P.minPostureForAdapt,
      still: smooth > 0.35,
      quality: q,
    });
  }, [beginAdaptPhase, completeRound, recordTick]);

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
    setCoachCue('Show your full body — problem sensors calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} paths adapted · ${finalStats.accuracy}% quality`}
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
      <FindAnotherWayVisuals adaptPhase={roundPhase === 'adapt'} />
      <AttentionMeter
        find={tryScore}
        focus={adaptScore}
        calm={calm}
        title="SOLVE"
        labels={{ find: 'TRY', focus: 'ADAPT', calm: 'CALM' }}
        style={{
          glassBorder: FIND_SHELL.glassBorder,
          statLabel: FIND_SHELL.statLabel,
          accent: T.accent,
          fillColors: ['#14B8A6', '#F59E0B', '#FDE68A'],
        }}
      />
      {phase === 'play' && (
        <>
          <FindAnotherWayOverlay
            round={pathRound}
            phase={roundPhase}
            holdProgress={holdProgress}
            onTry={onTry}
            onAdapt={onAdapt}
            showAdapt={showAdapt}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={FIND_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Problem calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: FIND_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: FIND_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧩 {FIND_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: FIND_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: FIND_SHELL.statLabel }]}>Path</Text>
              <Text style={[styles.statValue, { color: FIND_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: FIND_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>💡</Text>
              <Text style={[styles.statValue, { color: FIND_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: FIND_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: FIND_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: FIND_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Start Find Another Way</Text>
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

export default FindAnotherWayGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: T.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#F0FDFA', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#99F6E4', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: FIND_SHELL.stageBorder,
    backgroundColor: FIND_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FIND_SHELL.glassBorder,
  },
  phaseBannerText: { color: FIND_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#F0FDFA', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#14B8A6' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(15,23,42,0.88)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FIND_SHELL.glassBorder,
  },
  cueText: { color: FIND_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: FIND_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(20,184,166,0.2)' },
  skillText: { color: '#99F6E4', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#134E4A', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#99F6E4', fontWeight: '700' },
  errorText: { color: FIND_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
