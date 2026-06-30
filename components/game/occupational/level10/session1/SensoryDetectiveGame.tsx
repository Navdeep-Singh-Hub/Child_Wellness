/**
 * OT Level 10 · Session 1 · Game 5 — Sensory Detective
 *
 * Problem-solving sensory adventure: read case files, scan clues when needed,
 * move body to matching evidence on the cork board and hold to solve.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { CaseFileCard } from '@/components/game/occupational/level10/session1/components/CaseFileCard';
import { EvidenceBoard } from '@/components/game/occupational/level10/session1/components/EvidenceBoard';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { IntegrationMeter } from '@/components/game/occupational/level10/session1/components/IntegrationMeter';
import { SensoryDetectiveVisuals } from '@/components/game/occupational/level10/session1/components/SensoryDetectiveVisuals';
import { SENSORY_DETECTIVE_PACING as P } from '@/components/game/occupational/level10/session1/sensoryDetectivePacing';
import {
  DETECTIVE_CASES,
  DETECTIVE_SHELL,
  SENSORY_DETECTIVE_THEME as T,
  type DetectiveCase,
} from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
import {
  clueAtCursor,
  inMagnifierZone,
  isCorrectClue,
  solveSatisfied,
} from '@/components/game/occupational/level10/session1/sensoryDetectiveUtils';
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
const VOICE_PRAISE = ['Case closed!', 'Sharp detective!', 'Mystery solved!', 'Great sleuthing!', 'Evidence found!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'briefing' | 'scan' | 'solve';

const SensoryDetectiveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [solved, setSolved] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('briefing');
  const [scanned, setScanned] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [integration, setIntegration] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [attention, setAttention] = useState(0);
  const [quality, setQuality] = useState(0);
  const [activeClueId, setActiveClueId] = useState<DetectiveCase['correctClueId'] | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const detectiveCase = DETECTIVE_CASES[Math.min(round, DETECTIVE_CASES.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('briefing');
  const caseRef = useRef<DetectiveCase>(detectiveCase);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const scannedRef = useRef(false);
  const holdMsRef = useRef(0);
  const scanHoldRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const solveStartRef = useRef(0);
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
  useEffect(() => { caseRef.current = detectiveCase; }, [detectiveCase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);
  useEffect(() => { scannedRef.current = scanned; }, [scanned]);

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

  const beginScanPhase = useCallback(() => {
    roundPhaseRef.current = 'scan';
    setRoundPhase('scan');
    setBanner(T.scanLabel);
    setCoachCue('Move to the magnifying glass and hold to scan!');
    scanHoldRef.current = 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const beginSolvePhase = useCallback((c: DetectiveCase) => {
    roundPhaseRef.current = 'solve';
    setRoundPhase('solve');
    setBanner(T.solveLabel);
    setCoachCue(c.seekCue);
    solveStartRef.current = Date.now();
    holdMsRef.current = 0;
    setHoldProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const afterBriefing = useCallback(
    (c: DetectiveCase) => {
      if (c.needsScan) {
        beginScanPhase();
      } else {
        beginSolvePhase(c);
      }
    },
    [beginScanPhase, beginSolvePhase],
  );

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const xp = solved * 15 + accuracy + Math.round(integrationSumRef.current / Math.max(1, completedRef.current));
    setFinalStats({ correct: completedRef.current, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'sensory-detective',
        score: solved,
        accuracy,
        meta: { ...analyticsMeta, integration: integrationSumRef.current / Math.max(1, completedRef.current) },
      });
      await logGameAndAward('sensory-detective', solved, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, solved, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const c = DETECTIVE_CASES[Math.min(r, DETECTIVE_CASES.length - 1)]!;
      roundRef.current = r;
      setRound(r);
      holdMsRef.current = 0;
      scanHoldRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setScanned(false);
      scannedRef.current = false;
      setActiveClueId(null);
      setWrongFlash(false);
      roundPhaseRef.current = 'briefing';
      setRoundPhase('briefing');
      setBanner(T.briefingLabel);
      setCoachCue('Read the case file carefully…');

      speakTTS(c.voiceCue, 0.82).catch(() => {});
      if (c.soundKey) {
        playSound(c.soundKey, 0.55, c.soundRate ?? 1).catch(() => {});
      }

      schedule(() => afterBriefing(c), P.briefingMs);
    },
    [afterBriefing, schedule],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');
    setActiveClueId(null);
    setWrongFlash(false);

    recordHold(P.holdToSolveMs);
    completedRef.current += 1;
    integrationSumRef.current += integration;

    const solveMs = Date.now() - solveStartRef.current;
    const quickBonus = solveMs < P.quickSolveBonusMs;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0 || quickBonus) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setSolved((n) => n + 1);

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
    const c = caseRef.current;
    const onClue = clueAtCursor(s.cursor, c.clues);
    setActiveClueId(onClue?.id ?? null);

    if (!camLiveRef.current) {
      if (roundPhaseRef.current === 'solve') {
        const elapsed = now - solveStartRef.current;
        const t = clamp01(elapsed / P.fallbackSolveMs);
        setHoldProgress(t);
        setEngagement(0.77);
        setAttention(0.83);
        setQuality(0.85);
        setIntegration(0.5 + t * 0.42);
        if (t >= 1) completeRound();
      } else if (roundPhaseRef.current === 'scan') {
        const t = clamp01(scanHoldRef.current / P.scanHoldMs);
        setHoldProgress(t);
        if (t >= 1) {
          scannedRef.current = true;
          setScanned(true);
          beginSolvePhase(c);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.84 });
      return;
    }

    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      if (roundPhaseRef.current === 'solve' || roundPhaseRef.current === 'scan') {
        holdMsRef.current = 0;
        scanHoldRef.current = 0;
        setHoldProgress(0);
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

    if (roundPhaseRef.current === 'scan' && c.needsScan && !scannedRef.current) {
      const onMag = inMagnifierZone(s.cursor);
      const adapt = adaptiveResponseScore(onMag, scanHoldRef.current / P.scanHoldMs, s.postureQuality, smooth, attn);
      setEngagement(engage);
      setAttention(attn);
      setIntegration(adapt);
      setQuality(clamp01(adapt * 0.6 + s.postureQuality * 0.4));
      qualSumRef.current += adapt;
      qualCountRef.current += 1;

      if (onMag) {
        scanHoldRef.current += dt;
        setHoldProgress(clamp01(scanHoldRef.current / P.scanHoldMs));
        if (scanHoldRef.current >= P.scanHoldMs) {
          scannedRef.current = true;
          setScanned(true);
          setHoldProgress(0);
          scanHoldRef.current = 0;
          beginSolvePhase(c);
        }
      } else {
        scanHoldRef.current = Math.max(0, scanHoldRef.current - dt * 0.5);
        setHoldProgress(clamp01(scanHoldRef.current / P.scanHoldMs));
      }
      recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.5, quality: adapt });
      return;
    }

    const solving = roundPhaseRef.current === 'solve' && solveSatisfied(s.cursor, c, scannedRef.current);
    const adapt = adaptiveResponseScore(
      solving,
      holdMsRef.current / P.holdToSolveMs,
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

    if (roundPhaseRef.current === 'solve') {
      if (solving) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToSolveMs);
        setHoldProgress(prog);
        setCoachCue(c.seekCue);
        setWrongFlash(false);
        if (prog >= 1) completeRound();
      } else if (onClue && !isCorrectClue(onClue, c)) {
        setWrongFlash(true);
        setCoachCue(c.wrongCue);
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.8);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToSolveMs));
        lastInZoneRef.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToSolveMs));
        lastInZoneRef.current = 0;
        setWrongFlash(false);
      }
    }

    recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.5, quality: q });
  }, [beginSolvePhase, completeRound, recordTick]);

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
    setCoachCue('Sit where the camera sees your face clearly…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} cases closed · ${finalStats.accuracy}% quality`}
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
      <SensoryDetectiveVisuals lampOn={roundPhase !== 'briefing'} />
      <IntegrationMeter integration={integration} engagement={engagement} attention={attention} />
      {phase === 'play' && (
        <>
          <CaseFileCard detectiveCase={detectiveCase} visible={roundPhase === 'briefing'} />
          <EvidenceBoard
            detectiveCase={detectiveCase}
            phase={roundPhase}
            scanned={scanned}
            holdProgress={holdProgress}
            activeClueId={activeClueId}
            wrongFlash={wrongFlash}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={null}
            rightWrist={null}
            accent={T.accent}
          />
          {!!banner && roundPhase !== 'briefing' && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={DETECTIVE_SHELL.sparkleColor} count={24} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Detective calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: DETECTIVE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: DETECTIVE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🕵️ {DETECTIVE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: DETECTIVE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: DETECTIVE_SHELL.statLabel }]}>Case</Text>
              <Text style={[styles.statValue, { color: DETECTIVE_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: DETECTIVE_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>📁</Text>
              <Text style={[styles.statValue, { color: DETECTIVE_SHELL.statValue }]}>{solved}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: DETECTIVE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: DETECTIVE_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: DETECTIVE_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Open Case Files</Text>
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

export default SensoryDetectiveGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: DETECTIVE_SHELL.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: DETECTIVE_SHELL.stageBorder,
    backgroundColor: DETECTIVE_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DETECTIVE_SHELL.glassBorder,
  },
  phaseBannerText: { color: DETECTIVE_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#22C55E' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(15,23,42,0.82)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DETECTIVE_SHELL.glassBorder,
  },
  cueText: { color: DETECTIVE_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: DETECTIVE_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.18)' },
  skillText: { color: '#D1FAE5', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#052E16', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#D1FAE5', fontWeight: '700' },
  errorText: { color: DETECTIVE_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
