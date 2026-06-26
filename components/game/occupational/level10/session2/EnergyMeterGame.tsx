/**
 * OT Level 10 · Session 2 · Game 5 — Energy Meter
 *
 * Match body movement energy to neon gauge targets across a
 * low → rise → peak → reset arc. Camera tracks motion level,
 * posture, attention and sustained energy matching.
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
import { EnergyGauge } from '@/components/game/occupational/level10/session2/components/EnergyGauge';
import { EnergyMeterVisuals } from '@/components/game/occupational/level10/session2/components/EnergyMeterVisuals';
import { RegulationMeter } from '@/components/game/occupational/level10/session2/components/RegulationMeter';
import { ENERGY_METER_PACING as P } from '@/components/game/occupational/level10/session2/energyMeterPacing';
import {
  ENERGY_METER_THEME as T,
  ENERGY_ROUNDS,
  PULSE_SHELL,
  type EnergyRound,
} from '@/components/game/occupational/level10/session2/energyMeterTheme';
import {
  energyMatchScore,
  energyQualityScore,
  isEnergyMatched,
  motionToEnergy,
  smoothEnergy,
  wristBoostEnergy,
} from '@/components/game/occupational/level10/session2/energyMeterUtils';
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
const VOICE_PRAISE = ['Perfect match!', 'Energy star!', 'Great control!', 'So regulated!', 'Meter master!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'read' | 'match';

const EnergyMeterGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [matched, setMatched] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('read');
  const [currentEnergy, setCurrentEnergy] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [regulation, setRegulation] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [steadiness, setSteadiness] = useState(0);
  const [quality, setQuality] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const energyRound = ENERGY_ROUNDS[Math.min(round, ENERGY_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('read');
  const roundRef = useRef<EnergyRound>(energyRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastMatchRef = useRef(0);
  const matchStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const prevLeftRef = useRef(sample.leftWrist);
  const prevRightRef = useRef(sample.rightWrist);
  const energySamplesRef = useRef<number[]>([]);
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
  useEffect(() => { roundRef.current = energyRound; }, [energyRound]);
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

  const beginMatchPhase = useCallback((r: EnergyRound) => {
    roundPhaseRef.current = 'match';
    setRoundPhase('match');
    setBanner(T.matchLabel);
    setCoachCue(r.matchCue);
    matchStartRef.current = Date.now();
    holdMsRef.current = 0;
    setMatchProgress(0);
    energySamplesRef.current = [];
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
    const xp = done * 16 + accuracy + Math.round(regulationSumRef.current / Math.max(1, done) * 22);
    setFinalStats({ correct: done, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'energy-meter',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, regulation: regulationSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('energy-meter', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const er = ENERGY_ROUNDS[Math.min(r, ENERGY_ROUNDS.length - 1)]!;
      setRound(r);
      holdMsRef.current = 0;
      lastMatchRef.current = 0;
      setMatchProgress(0);
      setCurrentEnergy(0);
      energySamplesRef.current = [];
      roundPhaseRef.current = 'read';
      setRoundPhase('read');
      setBanner(T.readLabel);
      setCoachCue(er.voiceCue);
      speakTTS(er.voiceCue, 0.82).catch(() => {});
      schedule(() => beginMatchPhase(er), P.readMeterMs);
    },
    [beginMatchPhase, schedule],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setMatchProgress(0);
    setBanner('');

    recordHold(P.holdMatchMs);
    completedRef.current += 1;
    regulationSumRef.current += regulation;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setMatched(next);

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, regulation, schedule, startRound, totalRounds]);

  const measureEnergy = useCallback((s: typeof sample) => {
    const prevC = prevCursorRef.current;
    const prevL = prevLeftRef.current;
    const prevR = prevRightRef.current;

    const noseMotion = prevC && s.cursor ? distNorm(prevC, s.cursor) : 0;
    const leftMotion = prevL && s.leftWrist ? distNorm(prevL, s.leftWrist) : 0;
    const rightMotion = prevR && s.rightWrist ? distNorm(prevR, s.rightWrist) : 0;

    prevCursorRef.current = s.cursor;
    prevLeftRef.current = s.leftWrist;
    prevRightRef.current = s.rightWrist;

    const wristCount = (s.leftWrist ? 1 : 0) + (s.rightWrist ? 1 : 0);
    const wristMotion = wristCount > 0 ? (leftMotion + rightMotion) / wristCount : 0;
    const combined = wristCount > 0 ? noseMotion * 0.4 + wristMotion * 0.6 : noseMotion;

    const instant = motionToEnergy(combined, P.maxMotionNorm);
    const boosted = wristBoostEnergy(s, instant);

    energySamplesRef.current.push(boosted);
    if (energySamplesRef.current.length > P.energySmoothTicks) {
      energySamplesRef.current.shift();
    }
    return smoothEnergy(energySamplesRef.current);
  }, []);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const er = roundRef.current;

    if (roundPhaseRef.current === 'read') {
      recordTick(dt, { upright: true, still: true, quality: 0.72 });
      return;
    }

    if (!camLiveRef.current) {
      const elapsed = now - matchStartRef.current;
      const t = clamp01(elapsed / P.fallbackMatchMs);
      setCurrentEnergy(er.target * 0.9 + 0.05);
      setMatchProgress(t);
      setMatchScore(0.8);
      setSteadiness(0.78);
      setRegulation(0.84);
      setQuality(0.86);
      if (t >= 1) completeRound();
      recordTick(dt, { upright: true, still: false, quality: 0.86 });
      return;
    }

    const s = sampleRef.current;
    if (!s.present) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setMatchProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const energy = measureEnergy(s);
    setCurrentEnergy(energy);

    const prev = prevCursorRef.current;
    const smooth = movementSmoothness(prev, s.cursor, 0.06);
    const match = energyMatchScore(energy, er.target, P.matchTolerance);
    const matchedNow = isEnergyMatched(energy, er.target, P.matchTolerance);
    const q = energyQualityScore(match, s.postureQuality, s.attentionScore, smooth);
    const reg = clamp01(match * 0.55 + smooth * 0.25 + s.postureQuality * 0.2);

    setMatchScore(match);
    setSteadiness(smooth);
    setRegulation(reg);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (matchedNow) {
      if (lastMatchRef.current === 0) lastMatchRef.current = now;
      holdMsRef.current += dt;
      const prog = clamp01(holdMsRef.current / P.holdMatchMs);
      setMatchProgress(prog);
      setBanner(T.holdLabel);
      setCoachCue(er.matchCue);
      if (prog >= 1) completeRound();
    } else {
      const diff = energy - er.target;
      if (diff > P.matchTolerance) {
        setCoachCue('Too much energy — slow your body down…');
      } else {
        setCoachCue(`${er.motionHint} — raise your energy a little!`);
      }
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.55);
      setMatchProgress(clamp01(holdMsRef.current / P.holdMatchMs));
      lastMatchRef.current = 0;
      setBanner(T.matchLabel);
    }

    recordTick(dt, {
      upright: s.postureQuality > 0.35,
      still: smooth > 0.4,
      quality: q,
    });
  }, [completeRound, measureEnergy, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    regulationSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Show your face and hands to the energy sensor…');
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
        subtitle={`${finalStats.correct}/${finalStats.total} energy levels matched · ${finalStats.accuracy}% quality`}
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
      <EnergyMeterVisuals />
      <RegulationMeter regulation={regulation} sync={matchScore} steadiness={steadiness} />
      {phase === 'play' && (
        <>
          <EnergyGauge
            round={energyRound}
            currentEnergy={currentEnergy}
            targetEnergy={energyRound.target}
            matchProgress={matchProgress}
            phase={roundPhase}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            accent={T.accent}
          />
          {!!banner && roundPhase === 'match' && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={PULSE_SHELL.sparkleColor} count={26} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Energy sensor calibration… {Math.round(calibProgress * 100)}%</Text>
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: PULSE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: PULSE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>⚡ {PULSE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: PULSE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PULSE_SHELL.statLabel }]}>Level</Text>
              <Text style={[styles.statValue, { color: PULSE_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: PULSE_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statValue, { color: PULSE_SHELL.statValue }]}>{matched}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: PULSE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PULSE_SHELL.statLabel }]}>Match</Text>
              <Text style={[styles.statValue, { color: PULSE_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
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
              <Text style={styles.primaryBtnText}>Power Up Station</Text>
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

export default EnergyMeterGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: PULSE_SHELL.accentMagenta, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#F0FDFA', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#A5F3FC', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
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
    borderColor: PULSE_SHELL.stageBorder,
    backgroundColor: PULSE_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    left: 16,
    backgroundColor: 'rgba(15,23,42,0.88)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PULSE_SHELL.glassBorder,
  },
  phaseBannerText: { color: PULSE_SHELL.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1.2 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#F0FDFA', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#22D3EE' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '72%',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PULSE_SHELL.glassBorder,
  },
  cueText: { color: PULSE_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: PULSE_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(34,211,238,0.15)' },
  skillText: { color: '#A5F3FC', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#042F2E', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#A5F3FC', fontWeight: '700' },
  errorText: { color: PULSE_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
