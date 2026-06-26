/**
 * Shared intro + HUD primitives for OT L5 Session 2 themed games.
 */
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type Session2ThemeTokens = {
  sky: readonly string[];
  title: string;
  subtitle: string;
  accent: string;
  accentDark: string;
  hudGlass: string;
  hudBorder: string;
  cue: string;
};

export type IntroConfig = {
  theme: Session2ThemeTokens;
  emoji: string;
  title: string;
  tagline: string;
  body: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  backdrop?: React.ReactNode;
  floatEmoji?: string;
};

export function Session2Intro({
  config,
  onStart,
  onBack,
}: {
  config: IntroConfig;
  onStart: () => void;
  onBack: () => void;
}) {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [float]);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [0, -12]) }],
  }));

  return (
    <View style={styles.introRoot}>
      <LinearGradient colors={[...config.theme.sky]} style={StyleSheet.absoluteFillObject} />
      {config.backdrop}
      <Animated.View style={[styles.introFloat, floatStyle]}>
        <Text style={styles.introFloatEmoji}>{config.floatEmoji ?? config.emoji}</Text>
      </Animated.View>
      <View style={[styles.introCard, { borderColor: config.theme.hudBorder }]}>
        <Text style={styles.introEmoji}>{config.emoji}</Text>
        <Text style={[styles.introTitle, { color: config.theme.title }]}>{config.title}</Text>
        <Text style={[styles.introTagline, { color: config.theme.subtitle }]}>{config.tagline}</Text>
        <Text style={styles.introBody}>{config.body}</Text>
        <View style={styles.chipRow}>
          {config.chips.map((c) => (
            <View key={c} style={[styles.chip, { borderColor: `${config.theme.accent}44` }]}>
              <Text style={[styles.chipText, { color: config.theme.subtitle }]}>{c}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={[...config.startGradient]} style={styles.startGrad}>
            <Text style={styles.startText}>{config.startLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.introBack}>
          <Text style={[styles.introBackText, { color: config.theme.subtitle }]}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function Session2HUD({
  theme,
  gameTitle,
  emoji,
  round,
  totalRounds,
  score,
  scoreLabel,
  hint,
  showHint,
  extra,
}: {
  theme: Session2ThemeTokens;
  gameTitle: string;
  emoji: string;
  round: number;
  totalRounds: number;
  score: number;
  scoreLabel: string;
  hint?: string;
  showHint?: boolean;
  extra?: React.ReactNode;
}) {
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 52, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="box-none">
      <Glass {...glassProps} style={[styles.hudGlass, { borderColor: theme.hudBorder, backgroundColor: Platform.OS === 'android' ? theme.hudGlass : 'transparent' }]}>
        <View style={styles.hudRow}>
          <View>
            <Text style={[styles.hudLbl, { color: theme.subtitle }]}>ROUND</Text>
            <Text style={[styles.hudRound, { color: theme.title }]}>
              {round}<Text style={styles.hudTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudMid}>
            <Text style={[styles.hudTitle, { color: theme.title }]}>{emoji} {gameTitle}</Text>
            <View style={styles.dots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < round - 1 && { backgroundColor: theme.accent, borderColor: theme.accentDark },
                    i === round - 1 && { backgroundColor: theme.accent, borderColor: theme.accentDark, transform: [{ scale: 1.25 }] },
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={[styles.scoreBox, { borderColor: `${theme.accentDark}55` }]}>
            <Text style={[styles.scoreLbl, { color: theme.accentDark }]}>{scoreLabel}</Text>
            <Text style={[styles.scoreVal, { color: theme.title }]}>{score}</Text>
          </View>
        </View>
        {extra}
        {showHint && hint ? <Text style={[styles.hudHint, { color: theme.cue }]}>{hint}</Text> : null}
      </Glass>
    </View>
  );
}

export function RoundCountdownOverlay({
  onDone,
  accent,
}: {
  onDone: () => void;
  accent: string;
}) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'GO!'] as const;
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (step >= steps.length) {
      onDoneRef.current();
      return;
    }
    scale.value = 0.35;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 11, stiffness: 180 });
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 200 }));
    const delay = step === steps.length - 1 ? 650 : 750;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, steps.length, scale, opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  if (step >= steps.length) return null;
  const isGo = steps[step] === 'GO!';

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, { borderColor: accent }, isGo && { backgroundColor: accent }, anim]}>
        <Text style={[styles.cdText, isGo && { color: '#1e1b4b', fontSize: 34 }]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  introRoot: { flex: 1 },
  introFloat: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  introFloatEmoji: { fontSize: 48 },
  introCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  introEmoji: { fontSize: 38 },
  introTitle: { fontSize: 30, fontWeight: '900', marginTop: 4 },
  introTagline: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 12 },
  introBody: { fontSize: 15, lineHeight: 22, color: '#475569', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 },
  chip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipText: { fontSize: 12, fontWeight: '700' },
  startBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 15, alignItems: 'center' },
  startText: { fontSize: 17, fontWeight: '900', color: '#fff' },
  introBack: { paddingVertical: 6 },
  introBackText: { fontSize: 15, fontWeight: '700' },

  hudWrap: { paddingHorizontal: 10, paddingTop: 44, zIndex: 20 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLbl: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  hudRound: { fontSize: 24, fontWeight: '900' },
  hudTotal: { fontSize: 14, fontWeight: '700' },
  hudMid: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  hudTitle: { fontSize: 14, fontWeight: '900', marginBottom: 5 },
  dots: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 130 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(148,163,184,0.35)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.5)' },
  scoreBox: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.45)' },
  scoreLbl: { fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  scoreVal: { fontSize: 22, fontWeight: '900' },
  hudHint: { marginTop: 8, textAlign: 'center', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 30 },
  cdBubble: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  cdText: { fontSize: 48, fontWeight: '900', color: '#0f172a' },
});
