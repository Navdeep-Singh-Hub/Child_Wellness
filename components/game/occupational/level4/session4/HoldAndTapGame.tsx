/**
 * Hold one hand, tap with the other — OT Level 4 Session 4 · Game 5.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { HoldHitPlayArea } from '@/components/game/occupational/level4/session4/HoldHitPlayArea';
import { useTraceSound } from '@/components/game/occupational/level4/session4/dualTapUtils';
import { SESSION4_4_PACING } from '@/components/game/occupational/level4/session4/session4Pacing';
import { HOLD_HIT_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

const HoldAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [holdSide, setHoldSide] = useState<'left' | 'right'>('left');
  const [holdProgress, setHoldProgress] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [hitKey, setHitKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundCompleteRef = useRef(false);
  const isHoldingRef = useRef(false);
  const holdProgressRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const holdScale = useSharedValue(1);
  const tapScale = useSharedValue(1);
  const kickOffOpacity = useSharedValue(0);
  const playShake = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);
  useEffect(() => {
    holdProgressRef.current = holdProgress;
  }, [holdProgress]);

  const holdStyle = useAnimatedStyle(() => ({ transform: [{ scale: holdScale.value }] }));
  const tapStyle = useAnimatedStyle(() => ({ transform: [{ scale: tapScale.value }] }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(holdScale);
    cancelAnimation(tapScale);
    cancelAnimation(kickOffOpacity);
    cancelAnimation(playShake);
  }, [holdScale, kickOffOpacity, playShake, tapScale]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(T.voiceComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: 'hold-and-tap',
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags: ['hand-independence', 'two-hand-tap'],
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, router],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setIsHolding(false);
    isHoldingRef.current = false;
    roundCompleteRef.current = false;
    setSuccessToast(false);
    setWarnVisible(false);
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const resetRound = useCallback(
    (side: 'left' | 'right') => {
      setHoldProgress(0);
      holdProgressRef.current = 0;
      setTapCount(0);
      setIsHolding(false);
      isHoldingRef.current = false;
      setHoldSide(side);
      setSuccessToast(false);
      setWarnVisible(false);
      holdScale.value = withSpring(1);
      tapScale.value = withSpring(1);
    },
    [holdScale, tapScale],
  );

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setSparkleKey(Date.now());
    setSuccessToast(true);
    setHitKey(Date.now());
    toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(T.voiceSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    clearTimers();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, clearTimers, playSuccess]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
    resetRound(side);
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 350 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    speakTTS(side === 'left' ? T.voiceHoldLeft : T.voiceHoldRight, 0.78).catch(() => {});
  }, [kickOffOpacity, resetRound]);

  useEffect(() => {
    if (round === 1) speakTTS(T.voiceIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleHoldStart = useCallback(() => {
    if (!roundActive || doneRef.current || isHoldingRef.current) return;
    setIsHolding(true);
    isHoldingRef.current = true;
    setWarnVisible(false);
    holdScale.value = withSpring(1.12);
    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += P.holdTickMs;
      holdProgressRef.current = progress;
      setHoldProgress(progress);
      if (progress >= P.holdDurationMs) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        speakTTS(T.voiceNowTap, 0.78).catch(() => {});
      }
    }, P.holdTickMs);
  }, [holdScale, roundActive]);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current || holdProgressRef.current >= P.holdDurationMs) return;
    setIsHolding(false);
    isHoldingRef.current = false;
    holdScale.value = withSpring(1);
    setHoldProgress(0);
    holdProgressRef.current = 0;
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setWarnVisible(true);
    playShake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
    speakTTS(T.voiceKeepHolding, 0.78).catch(() => {});
  }, [holdScale, playShake]);

  const handleTap = useCallback(() => {
    if (!roundActive || !isHoldingRef.current || holdProgressRef.current < P.holdDurationMs) return;
    setTapCount((c) => {
      const next = c + 1;
      tapScale.value = withSequence(withSpring(1.15), withSpring(1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (next >= P.targetTaps) completeRound();
      return next;
    });
  }, [completeRound, roundActive, tapScale]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={T.congrats}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const holdPct = Math.min(100, (holdProgress / P.holdDurationMs) * 100);
  const canTap = isHolding && holdProgress >= P.holdDurationMs;
  const roundPct = (round / P.rounds) * 100;
  const showGuide = round <= 2;

  const renderHoldBtn = () => (
    <TouchableOpacity onPressIn={handleHoldStart} onPressOut={handleHoldEnd} activeOpacity={0.85}>
      <Animated.View style={[styles.holdBtn, holdStyle]}>
        <LinearGradient colors={['#14B8A6', '#0D9488', '#0F766E']} style={styles.btnGradient}>
          <Text style={styles.btnEmoji}>{holdSide === 'left' ? '👈' : '👉'}</Text>
          <Text style={styles.btnLabel}>ANCHOR</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderTapBtn = () => (
    <TouchableOpacity onPress={handleTap} activeOpacity={0.85} disabled={!canTap}>
      <Animated.View style={[styles.tapBtn, tapStyle, !canTap && styles.disabled]}>
        <LinearGradient
          colors={canTap ? ['#FCD34D', '#F59E0B', '#D97706'] : ['#57534E', '#44403C', '#292524']}
          style={styles.btnGradient}
        >
          <Text style={styles.btnEmoji}>{holdSide === 'left' ? '👉' : '👈'}</Text>
          <Text style={styles.btnLabel}>STRIKE</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && (
          <Text style={[styles.hint, { color: T.accentDark }]}>
            {holdSide === 'left' ? '⚓ Hold LEFT · ⚡ Strike RIGHT' : '⚡ Strike LEFT · ⚓ Hold RIGHT'}
          </Text>
        )}
        <View style={[styles.roundTrack, { borderColor: T.accent }]}>
          <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
        </View>
        {isHolding && (
          <View style={[styles.progressTrack, { borderColor: T.accent }]}>
            <View style={[styles.progressFill, { width: `${holdPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive && (
          <Text style={[styles.tapCount, { color: T.accentDark }]}>
            Strikes: {tapCount}/{P.targetTaps}
          </Text>
        )}
        <View style={styles.headerDeco}>
          <Text style={styles.decoHand}>🤲</Text>
          <Text style={[styles.decoPulse, { color: T.accent }]}>⚡</Text>
          <Text style={styles.decoHand}>🤲</Text>
        </View>
      </View>

      <Animated.View style={[styles.playAreaWrap, playShakeStyle]}>
        <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          <HoldHitPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            holdSide={holdSide}
            isHolding={isHolding}
            holdPct={holdPct}
            canTap={canTap}
            tapCount={tapCount}
            targetTaps={P.targetTaps}
            hitKey={hitKey}
          />

          {roundActive && (
            <View style={styles.handsRow}>
              {holdSide === 'left' ? (
                <>
                  {renderHoldBtn()}
                  {renderTapBtn()}
                </>
              ) : (
                <>
                  {renderTapBtn()}
                  {renderHoldBtn()}
                </>
              )}
            </View>
          )}

          {kickOffVisible ? (
            <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.kickOffText}>🤲 SPLIT HAND!</Text>
            </Animated.View>
          ) : null}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
          <ResultToast text="HIT!" type="ok" show={successToast} />
        </View>
      </Animated.View>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>{T.voiceKeepHolding}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(12,26,31,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  tapCount: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(12,26,31,0.55)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: { width: '70%', height: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden', marginBottom: 6, backgroundColor: 'rgba(12,26,31,0.45)' },
  roundFill: { height: '100%', borderRadius: 6 },
  progressTrack: { width: '70%', height: 10, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(12,26,31,0.45)' },
  progressFill: { height: '100%', borderRadius: 8 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 4 },
  decoHand: { fontSize: 16 },
  decoPulse: { fontSize: 14, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  handsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, zIndex: 2 },
  holdBtn: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: T.anchorGlow,
    shadowColor: T.anchorGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  tapBtn: {
    width: 108,
    height: 108,
    borderRadius: 54,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: T.strikeGlow,
    shadowColor: T.strikeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 59 },
  disabled: { opacity: 0.5, borderColor: 'rgba(148,163,184,0.4)' },
  btnEmoji: { fontSize: 36, marginBottom: 4 },
  btnLabel: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.2 },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '16%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(12,26,31,0.9)',
    borderWidth: 2,
    borderColor: T.anchorGlow,
    zIndex: 3,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: T.anchorGlow, letterSpacing: 1 },
  warnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: T.strikeGlow,
  },
  warnText: { fontSize: 14, fontWeight: '800', color: T.accentDark, textAlign: 'center' },
});

export default HoldAndTapGame;
