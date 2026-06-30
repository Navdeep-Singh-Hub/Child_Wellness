/**
 * OT Level 10 · Session 1 · Game 2 — Find The Sound
 *
 * Listen to spatial sound cues, then use body movement (absolute coordinates)
 * to reach the matching echo portal. Camera tracks posture, attention & quality.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { FindTheSoundVisuals } from '@/components/game/occupational/level10/session1/components/FindTheSoundVisuals';
import { IntegrationMeter } from '@/components/game/occupational/level10/session1/components/IntegrationMeter';
import { SoundWavePortal } from '@/components/game/occupational/level10/session1/components/SoundWavePortal';
import { FIND_SOUND_PACING as P } from '@/components/game/occupational/level10/session1/findTheSoundPacing';
import {
  ECHO_SHELL,
  FIND_THE_SOUND_THEME as T,
  SOUND_CHALLENGES,
  type SoundChallenge,
  type SoundDirection,
} from '@/components/game/occupational/level10/session1/findTheSoundTheme';
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
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Found it!', 'Great ears!', 'Perfect seek!', 'Sound star!', 'Amazing focus!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'listen' | 'seek';

const rippleOriginFor = (dir: SoundDirection) => {
  switch (dir) {
    case 'left':
      return { x: 0.06, y: 0.5 };
    case 'right':
      return { x: 0.94, y: 0.5 };
    case 'up':
      return { x: 0.5, y: 0.06 };
    case 'down':
      return { x: 0.5, y: 0.92 };
    default:
      return { x: 0.5, y: 0.5 };
  }
};

const FindTheSoundGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [foundCount, setFoundCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('listen');
  const [portalVisible, setPortalVisible] = useState(false);
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

  const challenge = SOUND_CHALLENGES[Math.min(round, SOUND_CHALLENGES.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('listen');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const seekStartRef = useRef(0);
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
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
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

  const playChallengeSound = useCallback((c: SoundChallenge, vol = 1) => {
    playSound(c.soundKey, vol, c.playbackRate).catch(() => {});
  }, []);

  const beginSeekPhase = useCallback(
    (c: SoundChallenge) => {
      roundPhaseRef.current = 'seek';
      setRoundPhase('seek');
      setPortalVisible(true);
      seekStartRef.current = Date.now();
      setBanner(T.seekPhaseLabel);
      setCoachCue(c.seekCue);
      playChallengeSound(c, 0.85);
    },
    [playChallengeSound],
  );

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const xp = foundCount * 15 + accuracy + Math.round(integrationSumRef.current / Math.max(1, completedRef.current));
    setFinalStats({ correct: completedRef.current, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'find-the-sound',
        score: foundCount,
        accuracy,
        meta: { ...analyticsMeta, integration: integrationSumRef.current / Math.max(1, completedRef.current) },
      });
      await logGameAndAward('find-the-sound', foundCount, xp);
    } catch {
      // offline ok
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, foundCount, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const c = SOUND_CHALLENGES[Math.min(r, SOUND_CHALLENGES.length - 1)]!;
      roundRef.current = r;
      setRound(r);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setPortalVisible(false);
      roundPhaseRef.current = 'listen';
      setRoundPhase('listen');
      setBanner(T.listenPhaseLabel);
      setCoachCue(c.listenCue);

      playChallengeSound(c);
      speakTTS(c.voiceDirection, 0.82).catch(() => {});

      schedule(() => playChallengeSound(c, 0.75), P.listenReplayMs);
      schedule(() => beginSeekPhase(c), P.listenPhaseMs);
    },
    [beginSeekPhase, playChallengeSound, schedule],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setPortalVisible(false);
    setHoldProgress(0);
    setBanner('');

    recordHold(P.holdToFindMs);
    completedRef.current += 1;
    integrationSumRef.current += integration;

    const seekMs = Date.now() - seekStartRef.current;
    const quickBonus = seekMs < P.quickFindBonusMs;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0 || quickBonus) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setFoundCount((n) => n + 1);

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
    const c = SOUND_CHALLENGES[Math.min(roundRef.current, SOUND_CHALLENGES.length - 1)]!;

    if (!camLiveRef.current) {
      if (roundPhaseRef.current === 'seek') {
        const elapsed = now - seekStartRef.current;
        const t = clamp01(elapsed / P.fallbackFindMs);
        setHoldProgress(t);
        setEngagement(0.78);
        setAttention(0.82);
        setQuality(0.8);
        setIntegration(0.5 + t * 0.42);
        if (t >= 1) completeRound();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.8 });
      return;
    }

    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      if (roundPhaseRef.current === 'seek') {
        setHoldProgress(0);
        holdMsRef.current = 0;
      }
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    const smooth = movementSmoothness(prev, s.cursor);
    const motion = prev && s.cursor ? distNorm(prev, s.cursor) : 0;
    prevCursorRef.current = s.cursor;

    const engage = engagementFromMotion(motion);
    const attn = s.attentionScore;
    const inZone = roundPhaseRef.current === 'seek' && inOrbZone(s.cursor, c);
    const adapt = adaptiveResponseScore(
      inZone,
      holdMsRef.current / P.holdToFindMs,
      s.postureQuality,
      smooth,
      attn,
    );
    const q = clamp01(adapt * 0.65 + s.postureQuality * 0.35);

    setEngagement(engage);
    setAttention(attn);
    setIntegration(adapt);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (roundPhaseRef.current === 'seek') {
      if (inZone) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToFindMs);
        setHoldProgress(prog);
        if (prog >= 1) completeRound();
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.55);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToFindMs));
        lastInZoneRef.current = 0;
      }
    }

    recordTick(dt, { upright: s.postureQuality > 0.4, still: smooth > 0.55, quality: q });
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
    setCoachCue('Get ready to listen and move…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} sounds found · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const rippleOrigin = rippleOriginFor(challenge.direction);
  const listenActive = roundPhase === 'listen' && phase === 'play';

  const renderOverlay = () => (
    <>
      <FindTheSoundVisuals
        accent={T.accent}
        rippleOrigin={rippleOrigin}
        listenActive={listenActive}
      />
      <IntegrationMeter integration={integration} engagement={engagement} attention={attention} />
      {phase === 'play' && (
        <>
          <SoundWavePortal
            challenge={challenge}
            holdProgress={holdProgress}
            visible={portalVisible}
            listenActive={listenActive}
            found={false}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            accent={T.accent}
          />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={ECHO_SHELL.sparkleColor} count={22} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Tuning your sensory ears… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: ECHO_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: ECHO_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🔊 {ECHO_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: ECHO_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: ECHO_SHELL.statLabel }]}>Echo</Text>
              <Text style={[styles.statValue, { color: ECHO_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: ECHO_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🎧</Text>
              <Text style={[styles.statValue, { color: ECHO_SHELL.statValue }]}>{foundCount}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: ECHO_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: ECHO_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: ECHO_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Enter Echo Cavern</Text>
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

export default FindTheSoundGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: '#FCD34D', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
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
    borderColor: ECHO_SHELL.stageBorder,
    backgroundColor: ECHO_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,10,35,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ECHO_SHELL.glassBorder,
  },
  phaseBannerText: { color: ECHO_SHELL.gold, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#F59E0B' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(20,10,35,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ECHO_SHELL.glassBorder,
  },
  cueText: { color: ECHO_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: ECHO_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.18)' },
  skillText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#422006', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#E9D5FF', fontWeight: '700' },
  errorText: { color: ECHO_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
