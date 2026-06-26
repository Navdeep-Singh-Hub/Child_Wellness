/**
 * OT Level 10 · Session 2 · Game 4 — Calm Body Quest
 *
 * Serene moon garden quest: glide to calm sanctuaries, then hold
 * a peaceful still body pose. Camera tracks stillness, posture,
 * attention and pose-specific calm checks.
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
import { CalmBodyQuestVisuals } from '@/components/game/occupational/level10/session2/components/CalmBodyQuestVisuals';
import { CalmSanctuaryTrail } from '@/components/game/occupational/level10/session2/components/CalmSanctuaryTrail';
import { RegulationMeter } from '@/components/game/occupational/level10/session2/components/RegulationMeter';
import { CALM_BODY_QUEST_PACING as P } from '@/components/game/occupational/level10/session2/calmBodyQuestPacing';
import {
  CALM_BODY_QUEST_THEME as T,
  CALM_SANCTUARIES,
  GARDEN_SHELL,
  type CalmSanctuary,
} from '@/components/game/occupational/level10/session2/calmBodyQuestTheme';
import {
  calmBodyQualityScore,
  calmPoseSatisfied,
  inSanctuaryZone,
  isTooRestless,
  stillnessScore,
} from '@/components/game/occupational/level10/session2/calmBodyQuestUtils';
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
const VOICE_PRAISE = ['So peaceful!', 'Calm star!', 'Still body!', 'Lovely quest!', 'Zen master!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'briefing' | 'approach' | 'calm';

const CalmBodyQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalSanctuaries = P.sanctuaries;
  const sanctuaries = CALM_SANCTUARIES;

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
  const [sanctuaryIdx, setSanctuaryIdx] = useState(0);
  const [quests, setQuests] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('briefing');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [regulation, setRegulation] = useState(0);
  const [stillness, setStillness] = useState(0);
  const [steadiness, setSteadiness] = useState(0);
  const [quality, setQuality] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [cursorOnId, setCursorOnId] = useState<string | null>(null);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const sanctuary = sanctuaries[Math.min(sanctuaryIdx, sanctuaries.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('briefing');
  const sanctuaryRef = useRef<CalmSanctuary>(sanctuary);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const sanctuaryIdxRef = useRef(0);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const calmStartRef = useRef(0);
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
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { sanctuaryRef.current = sanctuary; }, [sanctuary]);
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

  const beginApproach = useCallback((s: CalmSanctuary) => {
    roundPhaseRef.current = 'approach';
    setRoundPhase('approach');
    setBanner(T.questLabel);
    setCoachCue(s.voiceCue);
    holdMsRef.current = 0;
    setHoldProgress(0);
  }, []);

  const beginCalmPhase = useCallback((s: CalmSanctuary) => {
    roundPhaseRef.current = 'calm';
    setRoundPhase('calm');
    setBanner(T.calmLabel);
    setCoachCue(s.calmCue);
    calmStartRef.current = Date.now();
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
    const done = completedRef.current;
    const xp = done * 15 + accuracy + Math.round(regulationSumRef.current / Math.max(1, done) * 20);
    setFinalStats({ correct: done, total: totalSanctuaries, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'calm-body-quest',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, regulation: regulationSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('calm-body-quest', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalSanctuaries, tracking.vision]);

  const startSanctuary = useCallback(
    (idx: number) => {
      const s = sanctuaries[Math.min(idx, sanctuaries.length - 1)]!;
      sanctuaryIdxRef.current = idx;
      setSanctuaryIdx(idx);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      roundPhaseRef.current = 'briefing';
      setRoundPhase('briefing');
      setBanner(T.questLabel);
      setCoachCue(s.voiceCue);
      speakTTS(s.voiceCue, 0.82).catch(() => {});
      schedule(() => beginApproach(s), P.briefingMs);
    },
    [beginApproach, schedule, sanctuaries],
  );

  const completeSanctuary = useCallback(() => {
    if (doneRef.current) return;
    const s = sanctuaryRef.current;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.holdCalmMs);
    completedRef.current += 1;
    regulationSumRef.current += regulation;

    setCompletedIds((ids) => [...ids, s.id]);
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryN === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setQuests(next);

    if (next >= totalSanctuaries) {
      schedule(() => endGame(), P.betweenSanctuariesMs);
    } else {
      schedule(() => startSanctuary(next), P.betweenSanctuariesMs);
    }
  }, [endGame, recordHold, recordStar, regulation, schedule, startSanctuary, totalSanctuaries]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const s = sampleRef.current;
    const san = sanctuaryRef.current;
    const inZone = inSanctuaryZone(s.cursor, san);
    setCursorOnId(inZone ? san.id : null);

    if (roundPhaseRef.current === 'briefing') {
      recordTick(dt, { upright: true, still: true, quality: 0.7 });
      return;
    }

    if (!camLiveRef.current) {
      if (roundPhaseRef.current === 'calm') {
        const elapsed = now - calmStartRef.current;
        const t = clamp01(elapsed / P.fallbackCalmMs);
        setHoldProgress(t);
        setStillness(0.82);
        setSteadiness(0.8);
        setRegulation(0.85);
        setQuality(0.86);
        if (t >= 1) completeSanctuary();
      } else {
        const elapsed = now - (calmStartRef.current || now);
        if (elapsed > 1200) beginCalmPhase(san);
      }
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
    const smooth = movementSmoothness(prev, s.cursor, 0.045);
    const still = stillnessScore(motion, P.maxStillMotionNorm, P.restlessMotionNorm);
    const poseOk = calmPoseSatisfied(s, san);
    const q = calmBodyQualityScore(still, s.postureQuality, s.attentionScore, poseOk, inZone);
    const reg = clamp01(still * 0.45 + s.postureQuality * 0.3 + smooth * 0.25);

    setStillness(still);
    setSteadiness(smooth);
    setRegulation(reg);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (roundPhaseRef.current === 'approach') {
      if (inZone) {
        beginCalmPhase(san);
      } else {
        setCoachCue('Glide gently to the calm sanctuary…');
        setBanner(T.questLabel);
      }
    }

    if (roundPhaseRef.current === 'calm') {
      if (!inZone) {
        roundPhaseRef.current = 'approach';
        setRoundPhase('approach');
        holdMsRef.current = 0;
        setHoldProgress(0);
        setBanner(T.questLabel);
        setCoachCue('Return gently to the sanctuary…');
        lastInZoneRef.current = 0;
      } else if (!poseOk) {
        setCoachCue(san.calmCue);
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdCalmMs));
      } else if (isTooRestless(motion, P.restlessMotionNorm)) {
        setCoachCue(T.moveCue);
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 1.1);
        setHoldProgress(clamp01(holdMsRef.current / P.holdCalmMs));
        lastInZoneRef.current = 0;
      } else if (still > 0.45) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt * clamp01(still);
        const prog = clamp01(holdMsRef.current / P.holdCalmMs);
        setHoldProgress(prog);
        setBanner(T.stillLabel);
        setCoachCue(san.calmCue);
        if (prog >= 1) completeSanctuary();
      } else {
        setCoachCue(T.moveCue);
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.35);
        setHoldProgress(clamp01(holdMsRef.current / P.holdCalmMs));
      }
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: still > 0.5,
      quality: q,
    });
  }, [beginCalmPhase, completeSanctuary, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    regulationSumRef.current = 0;
    setCompletedIds([]);
    resetAnalytics();
    schedule(() => startSanctuary(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startSanctuary, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Sit calmly — show your face to the camera…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} calm sanctuaries · ${finalStats.accuracy}% quality`}
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
      <CalmBodyQuestVisuals />
      <RegulationMeter regulation={regulation} sync={stillness} steadiness={steadiness} />
      {phase === 'play' && (
        <>
          <CalmSanctuaryTrail
            sanctuaries={sanctuaries}
            activeId={sanctuary.id}
            completedIds={completedIds}
            holdProgress={holdProgress}
            cursorOnId={cursorOnId}
            calmPhase={roundPhase === 'calm'}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && roundPhase !== 'briefing' && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={GARDEN_SHELL.sparkleColor} count={22} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Calm calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: GARDEN_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: GARDEN_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧘 {GARDEN_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: GARDEN_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: GARDEN_SHELL.statLabel }]}>Quest</Text>
              <Text style={[styles.statValue, { color: GARDEN_SHELL.statValue }]}>
                {Math.min(sanctuaryIdx + (phase === 'play' ? 1 : 0), totalSanctuaries)}/{totalSanctuaries}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: GARDEN_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🪷</Text>
              <Text style={[styles.statValue, { color: GARDEN_SHELL.statValue }]}>{quests}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: GARDEN_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: GARDEN_SHELL.statLabel }]}>Calm</Text>
              <Text style={[styles.statValue, { color: GARDEN_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Enter Moon Garden</Text>
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

export default CalmBodyQuestGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: GARDEN_SHELL.accentSage, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#F5F3FF', fontSize: 24, fontWeight: '900' },
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
    borderColor: GARDEN_SHELL.stageBorder,
    backgroundColor: GARDEN_SHELL.stageBg,
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
    borderColor: GARDEN_SHELL.glassBorder,
  },
  phaseBannerText: { color: GARDEN_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#F5F3FF', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#A78BFA' },
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
    borderColor: GARDEN_SHELL.glassBorder,
  },
  cueText: { color: GARDEN_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: GARDEN_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.18)' },
  skillText: { color: '#C4B5FD', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#C4B5FD', fontWeight: '700' },
  errorText: { color: GARDEN_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
