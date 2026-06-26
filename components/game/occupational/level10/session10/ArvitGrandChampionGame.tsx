/**
 * OT Level 10 · Session 10 · Game 5 — ARVIT Grand Champion
 *
 * Capstone sensory integration adventure: explore each world, integrate
 * with calm stillness, then champion the finale with steady attention.
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
import { ArvitGrandChampionOverlay } from '@/components/game/occupational/level10/session10/components/ArvitGrandChampionOverlay';
import { ArvitGrandChampionVisuals } from '@/components/game/occupational/level10/session10/components/ArvitGrandChampionVisuals';
import { ARVIT_GRAND_CHAMPION_PACING as P } from '@/components/game/occupational/level10/session10/arvitGrandChampionPacing';
import {
  ARVIT_GRAND_CHAMPION_ROUNDS,
  ARVIT_GRAND_CHAMPION_THEME as T,
  CHAMPION_SHELL,
  type ArvitGrandChampionRound,
  type ChampionPhaseKind,
} from '@/components/game/occupational/level10/session10/arvitGrandChampionTheme';
import { inChampionZone } from '@/components/game/occupational/level10/session10/arvitGrandChampionUtils';
import { integrationChampionQuality } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';
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
const VOICE_PRAISE = ['Champion star!', 'Grand win!', 'ARVIT hero!', 'Integrate ace!', 'Crown earned!'];

type Phase = 'intro' | 'calibrate' | 'play';

const ArvitGrandChampionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
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
  const [roundPhase, setRoundPhase] = useState<ChampionPhaseKind>('explore');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [exploreScore, setExploreScore] = useState(0);
  const [integrateScore, setIntegrateScore] = useState(0);
  const [championScore, setChampionScore] = useState(0);
  const [quality, setQuality] = useState(0);
  const [exploreOk, setExploreOk] = useState(false);
  const [integrateOk, setIntegrateOk] = useState(false);
  const [championOk, setChampionOk] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const championRound = ARVIT_GRAND_CHAMPION_ROUNDS[Math.min(round, ARVIT_GRAND_CHAMPION_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<ChampionPhaseKind>('explore');
  const roundRef = useRef<ArvitGrandChampionRound>(championRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const phaseStartRef = useRef(0);
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
  useEffect(() => { roundRef.current = championRound; }, [championRound]);
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

  const beginIntegratePhase = useCallback((cr: ArvitGrandChampionRound) => {
    roundPhaseRef.current = 'integrate';
    setRoundPhase('integrate');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setBanner(T.integrateLabel);
    setCoachCue(cr.integrateCue);
    phaseStartRef.current = Date.now();
    speakTTS(cr.voiceIntegrate, 0.85).catch(() => {});
    playSound('clap', 0.55, 1.05).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const beginChampionPhase = useCallback((cr: ArvitGrandChampionRound) => {
    roundPhaseRef.current = 'champion';
    setRoundPhase('champion');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setBanner(T.championLabel);
    setCoachCue(cr.championCue);
    phaseStartRef.current = Date.now();
    speakTTS(cr.voiceChampion, 0.85).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
    const xp = done * 22 + accuracy + Math.round(motorSumRef.current / Math.max(1, done) * 26);
    setFinalStats({ correct: done, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'arvit-grand-champion',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, integration: motorSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('arvit-grand-champion', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback((r: number) => {
    const cr = ARVIT_GRAND_CHAMPION_ROUNDS[Math.min(r, ARVIT_GRAND_CHAMPION_ROUNDS.length - 1)]!;
    setRound(r);
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    roundPhaseRef.current = 'explore';
    setRoundPhase('explore');
    setBanner(T.exploreLabel);
    setCoachCue(cr.voiceExplore);
    setExploreOk(false);
    setIntegrateOk(false);
    setChampionOk(false);
    phaseStartRef.current = Date.now();
    speakTTS(cr.voiceExplore, 0.82).catch(() => {});
  }, []);

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.championHoldMs);
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

    const holdTarget =
      rp === 'explore' ? P.exploreHoldMs : rp === 'integrate' ? P.integrateHoldMs : P.championHoldMs;
    const grace =
      rp === 'explore' ? P.exploreGraceMs : rp === 'integrate' ? P.integrateGraceMs : P.championGraceMs;

    if (!camLiveRef.current) {
      const fbMs =
        rp === 'explore' ? P.fallbackExploreMs : rp === 'integrate' ? P.fallbackIntegrateMs : P.fallbackChampionMs;
      const elapsed = now - phaseStartRef.current;
      const t = clamp01(elapsed / fbMs);
      setHoldProgress(t);
      setExploreScore(0.84);
      setIntegrateScore(0.82);
      setChampionScore(0.8);
      setQuality(0.88);
      if (rp === 'explore' && t >= 1) beginIntegratePhase(cr);
      else if (rp === 'integrate' && t >= 1) beginChampionPhase(cr);
      else if (rp === 'champion' && t >= 1) completeRound();
      recordTick(dt, { upright: true, still: true, quality: 0.86 });
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

    if (rp === 'explore') {
      const ok = inChampionZone(cursor, cr.explore);
      const holdPct = clamp01(holdMsRef.current / holdTarget);
      const q = integrationChampionQuality(ok, false, false, holdPct, smooth, s.postureQuality, s.attentionScore, 'explore');

      setExploreOk(ok);
      setIntegrateOk(false);
      setChampionOk(false);
      setExploreScore(ok ? holdPct * 0.55 + 0.35 : smooth * 0.25);
      setIntegrateScore(0.25);
      setChampionScore(0.2);
      setQuality(q);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(ok ? T.holdExploreLabel : T.exploreLabel);
      setCoachCue(ok ? 'Hold at the adventure node…' : cr.voiceExplore);

      if (ok) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        if (holdMsRef.current >= holdTarget) beginIntegratePhase(cr);
      } else if (now - (lastInZoneRef.current || now) > grace) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.45);
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        lastInZoneRef.current = 0;
      }

      recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.35, quality: q });
      return;
    }

    if (rp === 'integrate') {
      const inZone = inChampionZone(cursor, cr.integrate);
      const ok =
        inZone &&
        s.postureQuality >= P.minPostureForIntegrate &&
        smooth >= P.minStillnessForIntegrate;
      const holdPct = clamp01(holdMsRef.current / holdTarget);
      const q = integrationChampionQuality(true, ok, false, holdPct, smooth, s.postureQuality, s.attentionScore, 'integrate');

      setExploreOk(true);
      setIntegrateOk(ok);
      setChampionOk(false);
      setExploreScore(0.85);
      setIntegrateScore(ok ? holdPct * 0.55 + smooth * 0.35 : inZone ? 0.35 : 0.15);
      setChampionScore(0.2);
      setQuality(q);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(ok ? T.holdIntegrateLabel : T.integrateLabel);
      setCoachCue(ok ? cr.integrateCue : inZone ? 'Calm your body — integrate hold!' : cr.voiceIntegrate);

      if (ok) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        if (holdMsRef.current >= holdTarget) beginChampionPhase(cr);
      } else if (now - (lastInZoneRef.current || now) > grace) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        lastInZoneRef.current = 0;
      }

      recordTick(dt, {
        upright: s.postureQuality > P.minPostureForIntegrate,
        still: smooth > P.minStillnessForIntegrate,
        quality: q,
      });
      return;
    }

    const inZone = inChampionZone(cursor, cr.champion);
    const ok =
      inZone &&
      s.postureQuality >= P.minPostureForChampion &&
      s.attentionScore >= P.minAttentionForChampion;
    const holdPct = clamp01(holdMsRef.current / holdTarget);
    const q = integrationChampionQuality(true, true, ok, holdPct, smooth, s.postureQuality, s.attentionScore, 'champion');

    setExploreOk(true);
    setIntegrateOk(true);
    setChampionOk(ok);
    setExploreScore(0.9);
    setIntegrateScore(0.88);
    setChampionScore(ok ? holdPct * 0.6 + s.attentionScore * 0.35 : smooth * 0.25);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    setBanner(ok ? T.holdChampionLabel : T.championLabel);
    setCoachCue(ok ? cr.championCue : cr.voiceChampion);

    if (ok) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      setHoldProgress(clamp01(holdMsRef.current / holdTarget));
      if (holdMsRef.current >= holdTarget) completeRound();
    } else if (now - (lastInZoneRef.current || now) > grace) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / holdTarget));
      lastInZoneRef.current = 0;
    }

    recordTick(dt, {
      upright: s.postureQuality > P.minPostureForChampion,
      still: smooth > 0.35,
      quality: q,
    });
  }, [beginChampionPhase, beginIntegratePhase, completeRound, recordTick]);

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
    setCoachCue('Show your full body — champion sensors calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} adventures championed · ${finalStats.accuracy}% quality`}
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
      <ArvitGrandChampionVisuals championPhase={roundPhase === 'champion'} />
      <AttentionMeter
        find={exploreScore}
        focus={integrateScore}
        calm={championScore}
        title="ARVIT"
        labels={{ find: 'EXPLORE', focus: 'INTEGRATE', calm: 'CHAMPION' }}
        style={{
          glassBorder: CHAMPION_SHELL.glassBorder,
          statLabel: CHAMPION_SHELL.statLabel,
          accent: T.accent,
          fillColors: ['#22C55E', '#6366F1', '#EAB308'],
        }}
      />
      {phase === 'play' && (
        <>
          <ArvitGrandChampionOverlay
            round={championRound}
            phase={roundPhase}
            holdProgress={holdProgress}
            exploreOk={exploreOk}
            integrateOk={integrateOk}
            championOk={championOk}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={CHAMPION_SHELL.sparkleColor} count={28} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Champion calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: CHAMPION_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: CHAMPION_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>👑 {CHAMPION_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: CHAMPION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CHAMPION_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: CHAMPION_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: CHAMPION_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>👑</Text>
              <Text style={[styles.statValue, { color: CHAMPION_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: CHAMPION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: CHAMPION_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: CHAMPION_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Begin Grand Champion Quest</Text>
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

export default ArvitGrandChampionGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: CHAMPION_SHELL.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
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
    borderColor: CHAMPION_SHELL.stageBorder,
    backgroundColor: CHAMPION_SHELL.stageBg,
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
    borderColor: CHAMPION_SHELL.glassBorder,
  },
  phaseBannerText: { color: CHAMPION_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#FFFBEB', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#EAB308' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CHAMPION_SHELL.glassBorder,
  },
  cueText: { color: CHAMPION_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: CHAMPION_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(234,179,8,0.15)' },
  skillText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#78350F', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#FDE68A', fontWeight: '700' },
  errorText: { color: CHAMPION_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
