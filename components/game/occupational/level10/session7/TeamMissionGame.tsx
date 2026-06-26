/**
 * OT Level 10 · Session 7 · Game 3 — Team Mission
 *
 * Squad Adventure: rally with each team, then complete
 * the mission with calm posture and steady attention.
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
import { TeamMissionOverlay } from '@/components/game/occupational/level10/session7/components/TeamMissionOverlay';
import { TeamMissionVisuals } from '@/components/game/occupational/level10/session7/components/TeamMissionVisuals';
import { TEAM_MISSION_PACING as P } from '@/components/game/occupational/level10/session7/teamMissionPacing';
import {
  TEAM_MISSION_ROUNDS,
  TEAM_MISSION_THEME as T,
  TEAM_SHELL,
  type TeamMissionRound,
} from '@/components/game/occupational/level10/session7/teamMissionTheme';
import { inMissionZone, inRallyZone } from '@/components/game/occupational/level10/session7/teamMissionUtils';
import { socialSensoryQuality } from '@/components/game/occupational/level10/session7/socialSensoryUtils';
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
const VOICE_PRAISE = ['Team star!', 'Squad ace!', 'Mission done!', 'Team champ!', 'Goal hero!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'rally' | 'mission';

const TeamMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('rally');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [rallyScore, setRallyScore] = useState(0);
  const [missionScore, setMissionScore] = useState(0);
  const [calm, setCalm] = useState(0);
  const [focus, setFocus] = useState(0);
  const [quality, setQuality] = useState(0);
  const [onRally, setOnRally] = useState(false);
  const [onMission, setOnMission] = useState(false);
  const [showMission, setShowMission] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const teamRound = TEAM_MISSION_ROUNDS[Math.min(round, TEAM_MISSION_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('rally');
  const roundRef = useRef<TeamMissionRound>(teamRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const rallyMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const rallyStartRef = useRef(0);
  const missionStartRef = useRef(0);
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
  useEffect(() => { roundRef.current = teamRound; }, [teamRound]);
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

  const beginMissionPhase = useCallback((tr: TeamMissionRound) => {
    roundPhaseRef.current = 'mission';
    setRoundPhase('mission');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setShowMission(true);
    setBanner(T.missionLabel);
    setCoachCue(tr.missionCue);
    missionStartRef.current = Date.now();
    speakTTS(tr.voiceMission, 0.85).catch(() => {});
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
        gameId: 'team-mission',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, adaptive: motorSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('team-mission', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback((r: number) => {
    const tr = TEAM_MISSION_ROUNDS[Math.min(r, TEAM_MISSION_ROUNDS.length - 1)]!;
    setRound(r);
    holdMsRef.current = 0;
    rallyMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    roundPhaseRef.current = 'rally';
    setRoundPhase('rally');
    setShowMission(false);
    setBanner(T.rallyLabel);
    setCoachCue(tr.voiceRally);
    setOnRally(false);
    setOnMission(false);
    rallyStartRef.current = Date.now();
    speakTTS(tr.voiceRally, 0.82).catch(() => {});
  }, []);

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.missionHoldMs);
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

    const tr = roundRef.current;
    const rp = roundPhaseRef.current;

    if (!camLiveRef.current) {
      if (rp === 'rally') {
        const elapsed = now - rallyStartRef.current;
        const t = clamp01(elapsed / P.fallbackRallyMs);
        setRallyScore(t * 0.85);
        setMissionScore(0.35);
        setCalm(0.5);
        setOnRally(t > 0.5);
        setHoldProgress(t);
        if (elapsed >= P.fallbackRallyMs) beginMissionPhase(tr);
      } else {
        const elapsed = now - missionStartRef.current;
        const t = clamp01(elapsed / P.fallbackMissionMs);
        setHoldProgress(t);
        setMissionScore(0.84);
        setRallyScore(0.8);
        setCalm(0.82);
        setOnMission(true);
        setShowMission(true);
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

    if (rp === 'rally') {
      const atRally = inRallyZone(cursor, tr);

      if (atRally) {
        rallyMsRef.current += dt;
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
      } else if (now - (lastInZoneRef.current || now) > P.rallyGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        lastInZoneRef.current = 0;
      }

      const holdPct = clamp01(holdMsRef.current / P.rallyHoldMs);
      const q = socialSensoryQuality(atRally, false, holdPct, s.postureQuality, s.attentionScore, smooth, 'approach');

      setOnRally(atRally);
      setOnMission(false);
      setRallyScore(holdPct * 0.65 + (atRally ? 0.35 : smooth * 0.2));
      setMissionScore(0.3);
      setCalm(smooth * 0.5 + s.attentionScore * 0.3);
      setFocus(s.attentionScore);
      setQuality(q);
      setHoldProgress(holdPct);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(T.holdRallyLabel);
      setCoachCue(atRally ? `${tr.label} — squad together!` : tr.voiceRally);

      if (holdMsRef.current >= P.rallyHoldMs) beginMissionPhase(tr);

      recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.35, quality: q });
      return;
    }

    const atMission =
      inMissionZone(cursor, tr) &&
      s.postureQuality >= P.minPostureForMission &&
      s.attentionScore >= P.minAttentionForMission;
    const holdPct = clamp01(holdMsRef.current / P.missionHoldMs);
    const rallyPct = clamp01(rallyMsRef.current / P.rallyHoldMs);
    const q = socialSensoryQuality(false, atMission, holdPct, s.postureQuality, s.attentionScore, smooth, 'greet');

    setOnRally(false);
    setOnMission(atMission);
    setRallyScore(rallyPct);
    setMissionScore(atMission ? holdPct * 0.65 + smooth * 0.35 : smooth * 0.25);
    setCalm(atMission ? smooth * 0.55 + s.attentionScore * 0.45 : smooth * 0.3);
    setFocus(s.attentionScore);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    setBanner(atMission ? T.holdMissionLabel : T.missionLabel);
    setCoachCue(atMission ? tr.missionCue : tr.voiceMission);

    if (atMission) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      setHoldProgress(clamp01(holdMsRef.current / P.missionHoldMs));
      if (holdMsRef.current >= P.missionHoldMs) completeRound();
    } else if (now - (lastInZoneRef.current || now) > P.missionGraceMs) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / P.missionHoldMs));
      lastInZoneRef.current = 0;
    }

    recordTick(dt, {
      upright: s.postureQuality > P.minPostureForMission,
      still: smooth > 0.35,
      quality: q,
    });
  }, [beginMissionPhase, completeRound, recordTick]);

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
    setCoachCue('Show your full body — team sensors calibrating…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} missions completed · ${finalStats.accuracy}% quality`}
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
      <TeamMissionVisuals missionPhase={roundPhase === 'mission'} />
      <AttentionMeter
        find={rallyScore}
        focus={missionScore}
        calm={calm}
        title="TEAM"
        labels={{ find: 'RALLY', focus: 'MISSION', calm: 'CALM' }}
        style={{
          glassBorder: TEAM_SHELL.glassBorder,
          statLabel: TEAM_SHELL.statLabel,
          accent: T.accent,
          fillColors: ['#3B82F6', '#22C55E', '#FDE68A'],
        }}
      />
      {phase === 'play' && (
        <>
          <TeamMissionOverlay
            round={teamRound}
            phase={roundPhase}
            holdProgress={holdProgress}
            onRally={onRally}
            onMission={onMission}
            showMission={showMission}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={TEAM_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Team calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: TEAM_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: TEAM_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🤝 {TEAM_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: TEAM_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TEAM_SHELL.statLabel }]}>Squad</Text>
              <Text style={[styles.statValue, { color: TEAM_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: TEAM_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={[styles.statValue, { color: TEAM_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: TEAM_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TEAM_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: TEAM_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Start Team Mission</Text>
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

export default TeamMissionGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: T.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#EFF6FF', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#93C5FD', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: TEAM_SHELL.stageBorder,
    backgroundColor: TEAM_SHELL.stageBg,
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
    borderColor: TEAM_SHELL.glassBorder,
  },
  phaseBannerText: { color: TEAM_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#EFF6FF', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#3B82F6' },
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
    borderColor: TEAM_SHELL.glassBorder,
  },
  cueText: { color: TEAM_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: TEAM_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.2)' },
  skillText: { color: '#93C5FD', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#EFF6FF', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#93C5FD', fontWeight: '700' },
  errorText: { color: TEAM_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
