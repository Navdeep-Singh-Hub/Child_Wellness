/**
 * Crown Keeper — OT Level 6 Session 2 Game 2
 *
 * Uses the reusable child-wellness-vision module (MediaPipe face landmarks +
 * head stability) to keep a magical crown from falling.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CrownKeeperStage } from '@/components/game/occupational/level6/session2/crownKeeper/components/CrownKeeperStage';
import { CROWN_KEEPER_PACING as P } from '@/components/game/occupational/level6/session2/crownKeeper/crownKeeperPacing';
import {
  CROWN_DIFFICULTY_LABELS,
  CROWN_KEEPER_THEME as T,
  type CrownDifficulty,
} from '@/components/game/occupational/level6/session2/crownKeeper/crownKeeperTheme';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import { useVisionTracking, VISION_REBUILD_MSG } from 'child-wellness-vision';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Phase = 'intro' | 'calibrate' | 'play';

const VOICE_PRAISE = ['Steady!', 'Royal focus!', 'Perfect stillness!', 'Crown safe!', 'Amazing!'];

const CrownKeeperGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const [active, setActive] = useState(true);
  const [difficulty, setDifficulty] = useState<CrownDifficulty>('easy');
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(100);
  const [safePct, setSafePct] = useState(100);
  const [stabilityNorm, setStabilityNorm] = useState(1);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [crownFallFlash, setCrownFallFlash] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [forceFallback, setForceFallback] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const vision = useVisionTracking(active && !forceFallback, difficulty, {
    enableFace: true,
    enableHands: false,
    enablePose: false,
    targetFps: 25,
  });

  const face = vision.snapshot.face;
  const present = Boolean(face?.landmarks?.length);
  const trackingLive = vision.isTracking && vision.isModuleAvailable && !forceFallback;

  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const roundStartRef = useRef(0);
  const safeMsRef = useRef(0);
  const totalMsRef = useRef(0);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);
  const faceRef = useRef(face);
  const roundCompleteRef = useRef(false);

  useEffect(() => {
    faceRef.current = face;
  }, [face]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const finishGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setActive(false);
    clearTimers();
    await vision.stopTracking();
    const accuracy = Math.round(safePct);
    const xp = scoreRef.current * 12 + accuracy;
    setFinalStats({ correct: roundRef.current, total: P.rounds, xp, accuracy });
    setShowCongrats(true);
    try {
      await recordGame({ gameId: 'crown-keeper-s2', score: scoreRef.current, accuracy, meta: { difficulty } });
      await logGameAndAward('crown-keeper-s2', scoreRef.current, xp);
    } catch {
      // offline ok
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [clearTimers, difficulty, safePct, vision]);

  const advanceRound = useCallback(() => {
    if (roundRef.current >= P.rounds) {
      finishGame();
      return;
    }
    roundRef.current += 1;
    setRound(roundRef.current);
    roundStartRef.current = Date.now();
    safeMsRef.current = 0;
    totalMsRef.current = 0;
    roundCompleteRef.current = false;
    setCoachCue(`Round ${roundRef.current} — hold your crown steady!`);
    vision.resetCalibration().catch(() => {});
    schedule(() => speakTTS(VOICE_PRAISE[roundRef.current % VOICE_PRAISE.length], 0.8).catch(() => {}), 400);
  }, [finishGame, schedule, vision]);

  const startPlay = useCallback(async () => {
    phaseRef.current = 'play';
    setPhase('play');
    roundRef.current = 1;
    setRound(1);
    scoreRef.current = 0;
    setScore(0);
    roundStartRef.current = Date.now();
    safeMsRef.current = 0;
    totalMsRef.current = 0;
    await vision.resetCalibration();
    setCoachCue('Keep your head still — protect the crown!');
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(() => {
      if (doneRef.current || phaseRef.current !== 'play') return;
      const now = Date.now();
      const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
      lastTickRef.current = now;
      totalMsRef.current += dt;

      const f = faceRef.current;
      const live = trackingLive || Platform.OS === 'web';
      const stab = live && f ? f.stabilityScore : 85;
      const rot = live && f ? f.rotationAmount : 0;
      const maxDeg = CROWN_DIFFICULTY_LABELS[difficulty].degrees;
      const stableEnough = rot <= maxDeg && stab >= 45;

      if (stableEnough) safeMsRef.current += dt;
      const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 100;
      setSafePct(pct);
      setStabilityScore(stab);
      setStabilityNorm(Math.max(0, Math.min(1, stab / 100)));

      const elapsed = now - roundStartRef.current;
      if (elapsed >= P.roundMs && !roundCompleteRef.current) {
        roundCompleteRef.current = true;
        const roundScore = Math.round(stab * 0.6 + pct * 0.4);
        scoreRef.current += roundScore;
        setScore(scoreRef.current);
        setSparkleKey((k) => k + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        schedule(advanceRound, P.nextRoundDelayMs);
      }
    }, P.tickMs);
  }, [advanceRound, difficulty, schedule, trackingLive, vision]);

  const startCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Sit tall and look straight ahead…');
    await vision.resetCalibration();
    const start = Date.now();
    const timer = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / P.calibrationMs);
      setCalibProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        schedule(startPlay, P.roundIntroDelayMs);
      }
    }, 80);
  }, [schedule, startPlay, vision]);

  useEffect(() => {
    if (vision.snapshot.lastEvent?.type === 'CROWN_FALL') {
      setCrownFallFlash(true);
      scoreRef.current = Math.max(0, scoreRef.current - P.crownFallPenalty);
      setScore(scoreRef.current);
      setCoachCue('Crown wobbled! Steady your head!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      schedule(() => setCrownFallFlash(false), 500);
    }
    if (vision.snapshot.lastEvent?.type === 'HEAD_STABLE') {
      scoreRef.current += P.stableScoreBoost;
      setScore(scoreRef.current);
      setSparkleKey((k) => k + 1);
      setCoachCue('Five seconds steady — royal bonus!');
    }
  }, [vision.snapshot.lastEvent, schedule]);

  useEffect(() => {
    return () => {
      clearTimers();
      vision.stopTracking().catch(() => {});
      cleanupSounds();
      stopAllSpeech();
    };
  }, [clearTimers, vision]);

  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        title={T.congrats}
        subtitle={`Score ${scoreRef.current} · Stability ${finalStats.accuracy}%`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  return (
    <LinearGradient colors={T.gradient} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{T.title}</Text>
            <Text style={styles.subtitle}>{T.subtitle}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
        </View>

        <View style={styles.hudRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ROUND</Text>
            <Text style={styles.statValue}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STABILITY</Text>
            <Text style={styles.statValue}>{Math.round(stabilityScore)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CROWN SAFE</Text>
            <Text style={styles.statValue}>{Math.round(safePct)}%</Text>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CrownKeeperStage
            active={active}
            tracking={trackingLive}
            present={present}
            stability={stabilityNorm}
            safePct={safePct}
            coachCue={phase === 'play' ? coachCue : ''}
            crownFallFlash={crownFallFlash}
          />
          <SparkleBurst key={sparkleKey} color={T.gold} />
        </View>

        {vision.error && !forceFallback && (
          <Text style={styles.errorText}>{vision.error}</Text>
        )}

        {phase === 'intro' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Choose difficulty</Text>
            <View style={styles.diffRow}>
              {(Object.keys(CROWN_DIFFICULTY_LABELS) as CrownDifficulty[]).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
                >
                  <Text style={[styles.diffText, difficulty === d && styles.diffTextActive]}>
                    {CROWN_DIFFICULTY_LABELS[d].label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!vision.isModuleAvailable && Platform.OS !== 'web' && (
              <Text style={styles.rebuildHint}>{VISION_REBUILD_MSG}</Text>
            )}
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                speakTTS(T.voiceIntro, 0.85).catch(() => {});
                startCalibration();
              }}
            >
              <Text style={styles.primaryBtnText}>Start Crown Quest</Text>
            </Pressable>
            {!vision.isModuleAvailable && Platform.OS !== 'web' && (
              <Pressable style={styles.secondaryBtn} onPress={() => setForceFallback(true)}>
                <Text style={styles.secondaryBtnText}>Play guided mode</Text>
              </Pressable>
            )}
          </View>
        )}

        {phase === 'calibrate' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Calibrating head position…</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(calibProgress * 100)}%` }]} />
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CrownKeeperGame;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, gap: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: T.backBorder },
  backText: { color: T.backText, fontWeight: '800' },
  headerCenter: { flex: 1 },
  title: { color: T.titleColor, fontSize: 22, fontWeight: '900' },
  subtitle: { color: T.subtitleColor, fontSize: 12, fontWeight: '600' },
  hudRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 8 },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
    minWidth: 72,
  },
  statLabel: { color: T.subtitleColor, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { color: T.gold, fontSize: 18, fontWeight: '900' },
  stageWrap: { flex: 1, marginHorizontal: 16, marginBottom: 8, minHeight: 280 },
  panel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: T.glassBorder,
    gap: 12,
  },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  diffRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  diffBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: T.glassBorder },
  diffBtnActive: { backgroundColor: 'rgba(251,191,36,0.25)', borderColor: T.accent },
  diffText: { color: T.subtitleColor, fontWeight: '700', fontSize: 12 },
  diffTextActive: { color: T.gold },
  primaryBtn: { backgroundColor: T.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#422006', fontWeight: '900', fontSize: 16 },
  secondaryBtn: { paddingVertical: 10, alignItems: 'center' },
  secondaryBtnText: { color: T.subtitleColor, fontWeight: '700' },
  progressTrack: { height: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.accent, borderRadius: 8 },
  errorText: { color: T.warn, textAlign: 'center', marginHorizontal: 16, marginBottom: 6, fontWeight: '700' },
  rebuildHint: { color: T.subtitleColor, fontSize: 12, textAlign: 'center' },
});
