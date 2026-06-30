/**
 * Builder Session 4 — Game 1: Prism Color Row
 * Tap the BLUE object among colored tiles.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, PRISM_PICK_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ITEMS = [
  { id: 'red', label: 'RED', color: '#EF4444', emoji: '🔴' },
  { id: 'blue', label: 'BLUE', color: '#3B82F6', emoji: '🔵' },
  { id: 'yellow', label: 'YELLOW', color: '#FBBF24', emoji: '🟡' },
] as const;

const CORRECT_ID = 'blue';

function ColorTile({
  label,
  emoji,
  color,
  onPress,
  state,
  disabled,
}: {
  label: string;
  emoji: string;
  color: string;
  onPress: () => void;
  state: 'idle' | 'wrong' | 'correct';
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    if (state === 'correct') {
      scale.value = withSequence(withSpring(1.1, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : 'rgba(0,0,0,0.12)';

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: color, borderColor },
          state === 'correct' && styles.tileCorrectRing,
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.tileEmoji}>{emoji}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ColorRecognitionGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ColorRecognitionGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: ColorRecognitionGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Tap the BLUE object on the prism color row!');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (id: string) => {
      if (locked) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      if (id === CORRECT_ID) {
        setLocked(true);
        setTileState((s) => ({ ...s, [id]: 'correct' }));
        speakBuilderHint('Correct! You found the blue object!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [id]: 'wrong' }));
      speakBuilderHint('Try again. Tap the blue one!');
      setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Blue Found!"
          subtitle="You spotted blue on the prism row!"
          badgeEmoji="🔵"
          variant="indigo"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...T.gradient]}
        locations={[...T.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <MountainWorkshopBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.targetPill}>
            <Text style={styles.targetPillText}>Target: BLUE</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint('Tap the blue object!')}>
              <Text style={styles.prompt}>Tap the BLUE object 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Color Prism Row</Text>
          <View style={styles.row}>
            {ITEMS.map((item) => (
              <ColorTile
                key={item.id}
                label={item.label}
                emoji={item.emoji}
                color={item.color}
                onPress={() => handleTap(item.id)}
                state={tileState[item.id] ?? 'idle'}
                disabled={locked}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  targetPill: {
    backgroundColor: 'rgba(219, 234, 254, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  targetPillText: { fontSize: 12, fontWeight: '900', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  tile: {
    width: 96,
    height: 108,
    borderRadius: 20,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileCorrectRing: { borderColor: T.tileCorrect, borderWidth: 5 },
  tileEmoji: { fontSize: 40, marginBottom: 4 },
  tileLabel: { fontSize: 13, fontWeight: '900', color: '#1F2937' },
});
