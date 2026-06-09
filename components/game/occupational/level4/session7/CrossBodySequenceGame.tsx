/**
 * Cross-body arrow sequence core for OT Level 4 Session 7.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  ArrowDirection,
  Hand,
  arrowEmoji,
  crossBodyHand,
  handLabel,
  randomDirection,
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
}> = ({ opacity, scale, left, emoji, active, accent }) => {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[styles.seqArrow, style, { left, borderColor: active ? accent : 'rgba(255,255,255,0.5)' }]}
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

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const sequenceRef = useRef<SeqItem[]>([]);
  const stepRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playW = useRef(360);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const arrowOpacity0 = useSharedValue(0);
  const arrowOpacity1 = useSharedValue(0);
  const arrowOpacity2 = useSharedValue(0);
  const arrowScale0 = useSharedValue(0.5);
  const arrowScale1 = useSharedValue(0.5);
  const arrowScale2 = useSharedValue(0.5);
  const arrowOpacities = [arrowOpacity0, arrowOpacity1, arrowOpacity2];
  const arrowScales = [arrowScale0, arrowScale1, arrowScale2];

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

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    revealTimersRef.current.forEach((t) => clearTimeout(t));
    revealTimersRef.current = [];
    arrowOpacities.forEach((o) => cancelAnimation(o));
    arrowScales.forEach((s) => cancelAnimation(s));
  }, [arrowOpacities, arrowScales]);

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
    },
    [playWarn],
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
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore]);

  const buildSequence = useCallback((): SeqItem[] => {
    const slots = [0.2, 0.5, 0.8].slice(0, P.sequenceLength);
    return slots.map((pct, id) => {
      const dir = randomDirection();
      return { id, direction: dir, expectedHand: crossBodyHand(dir) };
    });
  }, []);

  const revealSequence = useCallback(
    (seq: SeqItem[]) => {
      setRevealedCount(0);
      setStepIndex(0);
      setInputReady(false);
      seq.forEach((_, i) => {
        arrowOpacities[i].value = 0;
        arrowScales[i].value = 0.5;
      });
      seq.forEach((_, i) => {
        const t = setTimeout(() => {
          arrowOpacities[i].value = withTiming(1, { duration: P.arrowRevealMs });
          arrowScales[i].value = withSpring(1);
          setRevealedCount(i + 1);
        }, i * P.sequenceStepMs);
        revealTimersRef.current.push(t);
      });
      const doneT = setTimeout(() => {
        setInputReady(true);
        setStatusHint(`Step 1/${seq.length} — use ${handLabel(seq[0].expectedHand)}!`);
        speakTTS('Follow the sequence!', 0.78).catch(() => {});
      }, seq.length * P.sequenceStepMs + P.sequenceRevealGapMs);
      revealTimersRef.current.push(doneT);
    },
    [arrowOpacities, arrowScales],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    const seq = buildSequence();
    setSequence(seq);
    sequenceRef.current = seq;
    setRoundActive(true);
    roundCompleteRef.current = false;
    speakTTS(ttsCue, 0.78).catch(() => {});
    revealSequence(seq);
  }, [buildSequence, revealSequence, ttsCue]);

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
        showWarn(`Use your ${handLabel(item.expectedHand)} hand!`);
        setStepIndex(0);
        stepRef.current = 0;
        setStatusHint(`Restart — step 1/${seq.length}`);
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
      setStatusHint(`Step ${next + 1}/${seq.length} — use ${handLabel(seq[next].expectedHand)}!`);
    },
    [completeRound, inputReady, leftScale, rightScale, showWarn],
  );

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers]);

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
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

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
              />
            ))}
          </View>
        )}

        {roundActive && inputReady && (
          <View style={styles.handsRow}>
            <TouchableOpacity onPress={() => handleHand('left')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.handEmoji}>👈</Text>
                <Text style={styles.handLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleHand('right')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.handEmoji}>👉</Text>
                <Text style={styles.handLabel}>RIGHT</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {roundActive && !inputReady && revealedCount > 0 && (
          <Text style={[styles.revealText, { color: T.subtitleColor }]}>Watch the sequence…</Text>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'flex-end', paddingBottom: 24 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '42%', fontSize: 18, fontWeight: '700' },
  seqRow: { position: 'absolute', top: 48, left: 0, right: 0, height: 90 },
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
  arrowEmoji: { fontSize: 40 },
  revealText: { position: 'absolute', alignSelf: 'center', top: '55%', fontSize: 16, fontWeight: '700' },
  handsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  hand: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: { fontSize: 40, marginBottom: 2 },
  handLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
});

export default CrossBodySequenceGame;
