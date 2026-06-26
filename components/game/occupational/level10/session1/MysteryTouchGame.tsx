/**
 * OT Level 10 · Session 1 · Game 4 — Mystery Touch
 *
 * Hand-reach tactile game: mystery orbs appear in the silk void;
 * child reaches with the correct hand (wrist tracking) and holds to touch.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { HandReachOverlay } from '@/components/game/occupational/level10/session1/components/HandReachOverlay';
import { IntegrationMeter } from '@/components/game/occupational/level10/session1/components/IntegrationMeter';
import { MysteryOrb } from '@/components/game/occupational/level10/session1/components/MysteryOrb';
import { MysteryTouchVisuals } from '@/components/game/occupational/level10/session1/components/MysteryTouchVisuals';
import { MYSTERY_TOUCH_PACING as P } from '@/components/game/occupational/level10/session1/mysteryTouchPacing';
import {
  MYSTERY_TOUCH_THEME as T,
  TOUCH_CHALLENGES,
  TOUCH_SHELL,
  type MysteryTouchChallenge,
} from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
import {
  inTouchZone,
  touchSatisfied,
  wrongHandActive,
} from '@/components/game/occupational/level10/session1/mysteryTouchUtils';
import {
  adaptiveResponseScore,
  distNorm,
  engagementFromMotion,
  movementSmoothness,
} from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
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
const VOICE_PRAISE = ['Nice touch!', 'Perfect reach!', 'Great hands!', 'Mystery solved!', 'So gentle!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'reveal' | 'touch';

const MysteryTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [touches, setTouches] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('reveal');
  const [revealed, setRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [integration, setIntegration] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [attention, setAttention] = useState(0);
  const [quality, setQuality] = useState(0);
  const [handOnPrimary, setHandOnPrimary] = useState(false);
  const [handOnSecondary, setHandOnSecondary] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const challenge = TOUCH_CHALLENGES[Math.min(round, TOUCH_CHALLENGES.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('reveal');
  const challengeRef = useRef<MysteryTouchChallenge>(challenge);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const touchStartRef = useRef(0);
  const prevLeftRef = useRef(sample.leftWrist);
  const prevRightRef = useRef(sample.rightWrist);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const integrationSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { challengeRef.current = challenge; }, [challenge]);
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

  const beginTouchPhase = useCallback((c: MysteryTouchChallenge) => {
    roundPhaseRef.current = 'touch';
    setRoundPhase('touch');
    setRevealed(true);
    setBanner(T.touchLabel);
    setCoachCue(c.seekCue);
    touchStartRef.current = Date.now();
    playSound('clap', 0.5, 1.1).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const xp = touches * 15 + accuracy + Math.round(integrationSumRef.current / Math.max(1, completedRef.current));
    setFinalStats({ correct: completedRef.current, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'mystery-touch',
        score: touches,
        accuracy,
        meta: { ...analyticsMeta, integration: integrationSumRef.current / Math.max(1, completedRef.current) },
      });
      await logGameAndAward('mystery-touch', touches, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, touches, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const c = TOUCH_CHALLENGES[Math.min(r, TOUCH_CHALLENGES.length - 1)]!;
      roundRef.current = r;
      setRound(r);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setHandOnPrimary(false);
      setHandOnSecondary(false);
      setRevealed(false);
      roundPhaseRef.current = 'reveal';
      setRoundPhase('reveal');
      setBanner(T.revealLabel);
      setCoachCue('A mystery orb is appearing…');
      speakTTS(c.voiceCue, 0.82).catch(() => {});

      schedule(() => beginTouchPhase(c), P.revealMs);
    },
    [beginTouchPhase, schedule],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');
    setHandOnPrimary(false);
    setHandOnSecondary(false);

    recordHold(P.holdToTouchMs);
    completedRef.current += 1;
    integrationSumRef.current += integration;

    const touchMs = Date.now() - touchStartRef.current;
    const quickBonus = touchMs < P.quickTouchBonusMs;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0 || quickBonus) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setTouches((n) => n + 1);

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
    const c = challengeRef.current;

    const onPrimary =
      c.hand === 'both'
        ? inTouchZone(s.leftWrist, c.primary)
        : inTouchZone(c.hand === 'left' ? s.leftWrist : s.rightWrist, c.primary);
    const onSecondary = c.secondary ? inTouchZone(s.rightWrist, c.secondary) : false;
    setHandOnPrimary(onPrimary);
    setHandOnSecondary(onSecondary);

    if (!camLiveRef.current) {
      if (roundPhaseRef.current === 'touch') {
        const elapsed = now - touchStartRef.current;
        const t = clamp01(elapsed / P.fallbackTouchMs);
        setHoldProgress(t);
        setEngagement(0.78);
        setAttention(0.82);
        setQuality(0.84);
        setIntegration(0.5 + t * 0.42);
        if (t >= 1) completeRound();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.84 });
      return;
    }

    const hasHands = Boolean(s.leftWrist || s.rightWrist);
    if (!hasHands) {
      setCoachCue(T.positionCue);
      if (roundPhaseRef.current === 'touch') {
        holdMsRef.current = 0;
        setHoldProgress(0);
      }
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

    const smooth = movementSmoothness(prevL ?? prevR, s.leftWrist ?? s.rightWrist);
    const engage = engagementFromMotion(motion);
    const attn = s.attentionScore;
    const touching = roundPhaseRef.current === 'touch' && touchSatisfied(s, c);
    const adapt = adaptiveResponseScore(touching, holdMsRef.current / P.holdToTouchMs, s.postureQuality, smooth, attn);
    const q = clamp01(adapt * 0.6 + s.postureQuality * 0.4);

    setEngagement(engage);
    setAttention(attn);
    setIntegration(adapt);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (roundPhaseRef.current === 'touch') {
      if (wrongHandActive(s, c)) {
        setCoachCue(c.hand === 'left' ? 'Use your left hand!' : 'Use your right hand!');
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.7);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToTouchMs));
        lastInZoneRef.current = 0;
      } else if (touching) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToTouchMs);
        setHoldProgress(prog);
        setCoachCue(c.seekCue);
        if (prog >= 1) completeRound();
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToTouchMs));
        lastInZoneRef.current = 0;
      }
    }

    recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.5, quality: q });
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
    setCoachCue('Show both hands to the camera…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} mysteries touched · ${finalStats.accuracy}% quality`}
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
      <MysteryTouchVisuals reveal={revealed} />
      <IntegrationMeter integration={integration} engagement={engagement} attention={attention} />
      {phase === 'play' && (
        <>
          <MysteryOrb
            challenge={challenge}
            revealed={revealed}
            holdProgress={holdProgress}
            handOnPrimary={handOnPrimary}
            handOnSecondary={handOnSecondary}
          />
          <HandReachOverlay
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            requiredHand={challenge.hand}
          />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={TOUCH_SHELL.sparkleColor} count={22} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Hand tracking calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: TOUCH_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: TOUCH_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🖐️ {TOUCH_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: TOUCH_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TOUCH_SHELL.statLabel }]}>Mystery</Text>
              <Text style={[styles.statValue, { color: TOUCH_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: TOUCH_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>✨</Text>
              <Text style={[styles.statValue, { color: TOUCH_SHELL.statValue }]}>{touches}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: TOUCH_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TOUCH_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: TOUCH_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Enter Silk Void</Text>
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

export default MysteryTouchGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: '#D4A574', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
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
    borderColor: TOUCH_SHELL.stageBorder,
    backgroundColor: TOUCH_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(24,10,32,0.82)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TOUCH_SHELL.glassBorder,
  },
  phaseBannerText: { color: TOUCH_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#C084FC' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(24,10,32,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TOUCH_SHELL.glassBorder,
  },
  cueText: { color: TOUCH_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: TOUCH_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(192,132,252,0.18)' },
  skillText: { color: '#E9D5FF', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#2E1065', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#E9D5FF', fontWeight: '700' },
  errorText: { color: TOUCH_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
