/**
 * OT Level 10 · Session 3 · Game 4 — Mission Update
 *
 * Command beacon relay: complete Mission A, then adapt when
 * command sends a live mission update to Beacon B. Camera tracks
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
import { MissionBeaconOverlay } from '@/components/game/occupational/level10/session3/components/MissionBeaconOverlay';
import { MissionUpdateVisuals } from '@/components/game/occupational/level10/session3/components/MissionUpdateVisuals';
import { MISSION_UPDATE_PACING as P } from '@/components/game/occupational/level10/session3/missionUpdatePacing';
import {
  MISSION_SHELL,
  MISSION_UPDATE_ROUNDS,
  MISSION_UPDATE_THEME as T,
  type MissionUpdateRound,
} from '@/components/game/occupational/level10/session3/missionUpdateTheme';
import { inBeaconZone } from '@/components/game/occupational/level10/session3/missionUpdateUtils';
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
const VOICE_PRAISE = ['Locked on!', 'Update hero!', 'Beacon star!', 'Command pro!', 'Mission ace!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'mission-a' | 'update' | 'adapt-b';

const MissionUpdateGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [updates, setUpdates] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('mission-a');
  const [activeMission, setActiveMission] = useState<'a' | 'b'>('a');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [updateFlash, setUpdateFlash] = useState(false);
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
  const missionRound = MISSION_UPDATE_ROUNDS[Math.min(round, MISSION_UPDATE_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('mission-a');
  const missionRef = useRef<MissionUpdateRound>(missionRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const adaptStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const adaptSumRef = useRef(0);
  const lastTickRef = useRef(0);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { missionRef.current = missionRound; }, [missionRound]);
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
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const beginAdaptPhase = useCallback((mr: MissionUpdateRound) => {
    roundPhaseRef.current = 'adapt-b';
    setRoundPhase('adapt-b');
    setActiveMission('b');
    setUpdateFlash(false);
    setBanner(T.adaptLabel);
    setCoachCue(mr.adaptCue);
    adaptStartRef.current = Date.now();
    holdMsRef.current = 0;
    setHoldProgress(0);
    speakTTS(mr.voiceMissionB, 0.85).catch(() => {});
  }, []);

  const triggerUpdate = useCallback(
    (mr: MissionUpdateRound) => {
      roundPhaseRef.current = 'update';
      setRoundPhase('update');
      setUpdateFlash(true);
      setBanner(T.updateLabel);
      setCoachCue(mr.voiceUpdate);
      speakTTS(mr.voiceUpdate, 0.88).catch(() => {});
      playSound('beep', 0.6, 1.15).catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      schedule(() => beginAdaptPhase(mr), P.updateFlashMs);
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
        gameId: 'mission-update',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, adaptation: adaptSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('mission-update', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const mr = MISSION_UPDATE_ROUNDS[Math.min(r, MISSION_UPDATE_ROUNDS.length - 1)]!;
      setRound(r);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setUpdateFlash(false);
      roundPhaseRef.current = 'mission-a';
      setRoundPhase('mission-a');
      setActiveMission('a');
      setBanner(T.missionLabel);
      setCoachCue(mr.voiceMissionA);
      speakTTS(mr.voiceMissionA, 0.82).catch(() => {});

      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(() => triggerUpdate(mr), P.missionAPreviewMs + P.updateDelayMs);
    },
    [triggerUpdate],
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
    setUpdates(next);

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

    const mr = missionRef.current;
    const rp = roundPhaseRef.current;
    const target = rp === 'adapt-b' ? mr.missionB : mr.missionA;

    if (rp === 'update') {
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
    const inZone = inBeaconZone(s.cursor, target);
    const onB = inBeaconZone(s.cursor, mr.missionB);

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

    if (rp === 'mission-a') {
      setCoachCue(inZone ? 'Good lock — standby for updates…' : mr.voiceMissionA);
      setBanner(T.missionLabel);
    }

    if (rp === 'adapt-b') {
      if (onB) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToAdaptMs);
        setHoldProgress(prog);
        setBanner(T.holdLabel);
        setCoachCue(mr.adaptCue);
        if (prog >= 1) completeRound();
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToAdaptMs));
        lastInZoneRef.current = 0;
        setBanner(T.adaptLabel);
        setCoachCue(mr.adaptCue);
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
    setCoachCue('Show your face — beacon sensors calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} updates adapted · ${finalStats.accuracy}% quality`}
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
  const showB = roundPhase === 'update' || roundPhase === 'adapt-b';
  const cursorOnActive =
    roundPhase === 'adapt-b'
      ? inBeaconZone(sample.cursor, missionRound.missionB)
      : inBeaconZone(sample.cursor, missionRound.missionA);

  const renderOverlay = () => (
    <>
      <MissionUpdateVisuals updateFlash={updateFlash} />
      <AdaptiveMeter adaptation={adaptation} focus={focus} flow={flow} />
      {phase === 'play' && (
        <>
          <MissionBeaconOverlay
            missionA={missionRound.missionA}
            missionB={missionRound.missionB}
            activeMission={activeMission}
            showA={showA}
            showB={showB}
            updateFlash={updateFlash}
            holdProgress={holdProgress}
            cursorOnActive={cursorOnActive}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={[styles.phaseBanner, updateFlash && styles.phaseBannerUpdate]} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={MISSION_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Beacon calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: MISSION_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: MISSION_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>📡 {MISSION_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: MISSION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MISSION_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: MISSION_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: MISSION_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🛰️</Text>
              <Text style={[styles.statValue, { color: MISSION_SHELL.statValue }]}>{updates}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: MISSION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MISSION_SHELL.statLabel }]}>Adapt</Text>
              <Text style={[styles.statValue, { color: MISSION_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Launch Mission</Text>
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

export default MissionUpdateGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: MISSION_SHELL.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#F0F9FF', fontSize: 24, fontWeight: '900' },
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
    borderColor: MISSION_SHELL.stageBorder,
    backgroundColor: MISSION_SHELL.stageBg,
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
    borderColor: MISSION_SHELL.glassBorder,
  },
  phaseBannerUpdate: { borderColor: MISSION_SHELL.warn, backgroundColor: 'rgba(120,53,15,0.75)' },
  phaseBannerText: { color: MISSION_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#F0F9FF', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#38BDF8' },
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
    borderColor: MISSION_SHELL.glassBorder,
  },
  cueText: { color: MISSION_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: MISSION_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(56,189,248,0.15)' },
  skillText: { color: '#BAE6FD', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#0C4A6E', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#BAE6FD', fontWeight: '700' },
  errorText: { color: MISSION_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
