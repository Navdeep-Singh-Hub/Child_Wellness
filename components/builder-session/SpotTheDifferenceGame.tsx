/**
 * Builder Session 9 — Game 1: Detail Spot Gallery
 * Find the difference between two pictures (star vs moon).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { BUILDER_SESSION, DIFF_SPOT_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PICTURE_LEFT = ['🌞', '☁️', '⭐'];
const PICTURE_RIGHT = ['🌞', '☁️', '🌙'];
const CORRECT_INDEX = 2;

function SpotTile({
  emoji,
  onPress,
  state,
  disabled,
}: {
  emoji: string;
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
      scale.value = withSequence(withSpring(1.12, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.itemBorder;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.spotItem,
          { borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={`Item ${emoji}`}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface SpotTheDifferenceGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function SpotTheDifferenceGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: SpotTheDifferenceGameProps) {
  const [itemStates, setItemStates] = useState<Record<number, 'idle' | 'wrong' | 'correct'>>({
    0: 'idle',
    1: 'idle',
    2: 'idle',
  });
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(
      'Find the difference. Look at both pictures. Tap the item in Picture B that is different.'
    );
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (index: number) => {
      if (locked) return;

      if (index === CORRECT_INDEX) {
        setItemStates((s) => ({ ...s, [index]: 'correct' }));
        setLocked(true);
        speakBuilderHint('Correct! The moon is different!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setItemStates((s) => ({ ...s, [index]: 'wrong' }));
        speakBuilderHint('Try again. Look at Picture B and find what is different.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setItemStates((s) => ({ ...s, [index]: 'idle' })), 700);
      }
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Spot Found!"
          subtitle="You found the difference!"
          badgeEmoji="🔍"
          variant="mint"
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>

          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable
                onPress={() =>
                  speakBuilderHint('Compare both pictures. Tap the different item in Picture B.')
                }
              >
                <Text style={styles.prompt}>Spot the difference 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.gallery}>
          <View style={[styles.pictureFrame, styles.frameA]}>
            <Text style={styles.frameLabel}>Picture A</Text>
            <View style={styles.itemsRow}>
              {PICTURE_LEFT.map((emoji, i) => (
                <View key={i} style={styles.staticItem}>
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.pictureFrame, styles.frameB]}>
            <Text style={styles.frameLabel}>Picture B</Text>
            <View style={styles.itemsRow}>
              {PICTURE_RIGHT.map((emoji, i) => (
                <SpotTile
                  key={i}
                  emoji={emoji}
                  onPress={() => handleTap(i)}
                  state={itemStates[i]}
                  disabled={locked}
                />
              ))}
            </View>
          </View>

          <Text style={styles.hint}>Tap the item in Picture B that is different</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20 },
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
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5, alignItems: 'center' },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
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
    width: '100%',
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  gallery: { paddingHorizontal: 20, marginTop: 12, gap: 14 },
  pictureFrame: {
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    ...BUILDER_SESSION.shadow.card,
  },
  frameA: { backgroundColor: T.frameA, borderColor: T.frameBorder },
  frameB: { backgroundColor: T.frameB, borderColor: T.accentSoft },
  frameLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.accentDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  itemsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  staticItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.item,
    borderWidth: 2,
    borderColor: T.itemBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.item,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 4 },
});
