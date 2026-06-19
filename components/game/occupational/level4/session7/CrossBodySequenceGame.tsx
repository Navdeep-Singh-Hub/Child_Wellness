/**
 * Cross-body arrow sequence core for OT Level 4 Session 7.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { ArrowChainPlayArea } from '@/components/game/occupational/level4/session7/ArrowChainPlayArea';
import {
  ArrowDirection,
  Hand,
  arrowEmoji,
  crossBodyHand,
  handLabel,
  useTraceSound,
} from '@/components/game/occupational/level4/session7/arrowUtils';
import { SESSION4_7_PACING } from '@/components/game/occupational/level4/session7/session7Pacing';
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
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_7_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

type SeqItem = { id: number; direction: ArrowDirection; expectedHand: Hand };

const SeqArrowSlot: React.FC<{
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
  left: number;
  emoji: string;
  active: boolean;
  accent: string;
  themed?: boolean;
}> = ({ opacity, scale, left, emoji, active, accent, themed }) => {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        styles.seqArrow,
        themed && styles.chainSeqArrow,
        style,
        {
          left,
          borderColor: active ? accent : themed ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.5)',
        },
        active && themed && styles.chainSeqArrowActive,
      ]}
    >
      <Text style={styles.arrowEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

export type CrossBodySequenceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
};

export type CrossBodySequenceGameConfig = {
  theme: CrossBodySequenceTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsWrong?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const CrossBodySequenceGame: React.FC<
  CrossBodySequenceGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Follow the arrow sequence!',
  ttsSuccess = 'Perfect sequence!',
  ttsWrong = 'Wrong hand — watch the chain again!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [inputReady, setInputReady] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [chainKey, setChainKey] = useState(0);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const sequenceRef = useRef<SeqItem[]>([]);
  const stepRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playW = useRef(360);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);
  const arrowOpacity0 = useSharedValue(0);
  const arrowOpacity1 = useSharedValue(0);
  const arrowOpacity2 = useSharedValue(0);
  const arrowScale0 = useSharedValue(0.5);
  const arrowScale1 = useSharedValue(0.5);
  const arrowScale2 = useSharedValue(0.5);
  const arrowOpacitiesRef = useRef([arrowOpacity0, arrowOpacity1, arrowOpacity2]);
  const arrowScalesRef = useRef([arrowScale0, arrowScale1, arrowScale2]);
  const arrowOpacities = arrowOpacitiesRef.current;
  const arrowScales = arrowScalesRef.current;
  const startRoundPlayRef = useRef<() => void>(() => {});

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);
  useEffect(() => {
    stepRef.current = stepIndex;
  }, [stepIndex]);

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    revealTimersRef.current.forEach((t) => clearTimeout(t));
    revealTimersRef.current = [];
    arrowOpacitiesRef.current.forEach((o) => cancelAnimation(o));
    arrowScalesRef.current.forEach((s) => cancelAnimation(s));
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [kickOffOpacity, playShake]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.sequenceRounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags,
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
      setWarnMessage(msg);
      setWarnVisible(true);
      playShake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
    },
    [playShake, playWarn],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setInputReady(false);
    setRevealedCount(0);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.sequenceRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setInputReady(false);
    bumpScore();
    setSuccessToast(true);
    setChainKey(Date.now());
    toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore]);

  const buildSequence = useCallback((): SeqItem[] => {
    const dirs: ArrowDirection[] = ['left', 'right'];
    return Array.from({ length: P.sequenceLength }, (_, id) => {
      const direction = dirs[Math.floor(Math.random() * dirs.length)]!;
      return { id, direction, expectedHand: crossBodyHand(direction) };
    });
  }, []);

  const revealSequence = useCallback((seq: SeqItem[]) => {
    setRevealedCount(0);
    setStepIndex(0);
    stepRef.current = 0;
    setInputReady(false);
    setStatusHint('Watch the arrows…');
    arrowOpacitiesRef.current.forEach((opacity, i) => {
      opacity.value = 0;
      arrowScalesRef.current[i]!.value = 0.5;
    });
    seq.forEach((_, i) => {
      const t = setTimeout(() => {
        arrowOpacitiesRef.current[i]!.value = withTiming(1, { duration: P.arrowRevealMs });
        arrowScalesRef.current[i]!.value = withSpring(1);
        setRevealedCount(i + 1);
      }, i * P.sequenceStepMs);
      revealTimersRef.current.push(t);
    });
    const doneT = setTimeout(() => {
      setInputReady(true);
      const first = seq[0];
      if (!first) return;
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 350 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      setStatusHint(
        `Step 1/${seq.length}: ⬅️=RIGHT hand, ➡️=LEFT hand — tap ${handLabel(first.expectedHand)}!`,
      );
      speakTTS(`Tap ${handLabel(first.expectedHand)} hand!`, 0.78).catch(() => {});
    }, seq.length * P.sequenceStepMs + P.sequenceRevealGapMs);
    revealTimersRef.current.push(doneT);
  }, [kickOffOpacity]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    const seq = buildSequence();
    setSequence(seq);
    sequenceRef.current = seq;
    roundCompleteRef.current = false;
    setSuccessToast(false);
    setWarnVisible(false);
    setRoundActive(true);
    revealSequence(seq);
  }, [buildSequence, revealSequence]);

  startRoundPlayRef.current = startRoundPlay;

  const handleHand = useCallback(
    (hand: Hand) => {
      if (!roundActiveRef.current || !inputReady || roundCompleteRef.current || doneRef.current) return;
      const seq = sequenceRef.current;
      const idx = stepRef.current;
      if (idx >= seq.length) return;
      const item = seq[idx];

      if (hand !== item.expectedHand) {
        const scale = hand === 'left' ? leftScale : rightScale;
        scale.value = withSequence(withSpring(0.88), withSpring(1));
        showWarn(ttsWrong);
        setStepIndex(0);
        stepRef.current = 0;
        setInputReady(false);
        setStatusHint('Watch again…');
        revealSequence(seq);
        return;
      }

      const scale = hand === 'left' ? leftScale : rightScale;
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      const next = idx + 1;
      if (next >= seq.length) {
        completeRound();
        return;
      }
      setStepIndex(next);
      stepRef.current = next;
      setStatusHint(`Step ${next + 1}/${seq.length} — tap ${handLabel(seq[next]!.expectedHand)}!`);
    },
    [completeRound, inputReady, leftScale, revealSequence, rightScale, showWarn, ttsWrong],
  );

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    setInputReady(false);
    setSequence([]);
    roundTimerRef.current = setTimeout(() => startRoundPlayRef.current(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, ttsIntro, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
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

  const slotX = (i: number) => {
    const w = playW.current;
    const slots = [0.2, 0.5, 0.8];
    return w * slots[i] - 40;
  };

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
              {round}/{P.sequenceRounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
        <View style={[styles.roundTrack, { borderColor: T.accent }]}>
          <View style={[styles.roundFill, { width: `${(round / P.sequenceRounds) * 100}%`, backgroundColor: T.accent }]} />
        </View>
        <View style={styles.headerDeco}>
          <Text style={styles.decoEmoji}>1</Text>
          <Text style={[styles.decoArrow, { color: T.accent }]}>→</Text>
          <Text style={styles.decoEmoji}>2</Text>
          <Text style={[styles.decoArrow, { color: T.accent }]}>→</Text>
          <Text style={styles.decoEmoji}>3</Text>
        </View>
      </View>

      <Animated.View style={[styles.playAreaWrap, playShakeStyle]}>
      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, styles.playAreaThemed]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        <ArrowChainPlayArea
          roundActive={roundActive}
          showGuide={round <= 2}
          chainKey={chainKey}
          revealedCount={revealedCount}
          sequenceLength={sequence.length}
          stepIndex={stepIndex}
          inputReady={inputReady}
        />

        {roundActive && (
          <View style={styles.seqRow}>
            {sequence.map((item, i) => (
              <SeqArrowSlot
                key={item.id}
                opacity={arrowOpacities[i]}
                scale={arrowScales[i]}
                left={slotX(i)}
                emoji={arrowEmoji(item.direction)}
                active={inputReady && stepIndex === i}
                accent={T.accent}
                themed
              />
            ))}
          </View>
        )}

        {roundActive && inputReady && (
          <View style={styles.handsRow}>
            <TouchableOpacity onPress={() => handleHand('left')} activeOpacity={0.85}>
              <Animated.View
                style={[
                  styles.hand,
                  { backgroundColor: T.leftColor },
                  leftStyle,
                  styles.chainHand,
                  sequence[stepIndex]?.expectedHand === 'left' && styles.chainHandActive,
                ]}
              >
                <Text style={styles.handEmoji}>👈</Text>
                <Text style={styles.handLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleHand('right')} activeOpacity={0.85}>
              <Animated.View
                style={[
                  styles.hand,
                  { backgroundColor: T.rightColor },
                  rightStyle,
                  styles.chainHand,
                  sequence[stepIndex]?.expectedHand === 'right' && styles.chainHandActive,
                ]}
              >
                <Text style={styles.handEmoji}>👉</Text>
                <Text style={styles.handLabel}>RIGHT</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {kickOffVisible ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>🔗 TAP CHAIN!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
        <ResultToast text="CHAIN!" type="ok" show={successToast} />
      </View>
      </Animated.View>

      {warnVisible && (
        <View style={styles.chainWarnPill}>
          <Text style={styles.chainWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(2,44,34,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(2,44,34,0.55)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: {
    width: '70%',
    height: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(2,44,34,0.55)',
  },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  decoEmoji: { fontSize: 16, fontWeight: '900', color: '#A7F3D0' },
  decoArrow: { fontSize: 14, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'flex-end', paddingBottom: 24, overflow: 'hidden' },
  playAreaThemed: { borderWidth: 2 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '42%', fontSize: 18, fontWeight: '700', zIndex: 2 },
  seqRow: { position: 'absolute', top: 48, left: 0, right: 0, height: 90, zIndex: 4 },
  seqArrow: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainSeqArrow: {
    backgroundColor: 'rgba(2,44,34,0.92)',
    shadowColor: '#34D399',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  chainSeqArrowActive: {
    borderColor: '#FDE047',
    borderWidth: 4,
    shadowColor: '#FDE047',
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowEmoji: { fontSize: 40 },
  handsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12, zIndex: 4 },
  hand: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainHand: {
    borderColor: 'rgba(167,243,208,0.5)',
    shadowColor: '#34D399',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  chainHandActive: {
    borderColor: '#FDE047',
    borderWidth: 5,
    shadowColor: '#FDE047',
    shadowOpacity: 0.85,
    shadowRadius: 12,
    elevation: 10,
  },
  handEmoji: { fontSize: 40, marginBottom: 2 },
  handLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(2,44,34,0.92)',
    borderWidth: 2,
    borderColor: '#34D399',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#A7F3D0', letterSpacing: 1 },
  chainWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(2,44,34,0.92)',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  chainWarnText: { fontSize: 14, fontWeight: '800', color: '#A7F3D0', textAlign: 'center' },
});

export default CrossBodySequenceGame;
