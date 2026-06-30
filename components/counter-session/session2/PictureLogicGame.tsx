/**
 * Counter Session 2 — Game 4: Odd One Out Observatory — car does not belong
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
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { ODD_ONE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { CountCornerBackground } from '../CountCornerBackground';

const ITEMS = [
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'banana', label: 'Banana', emoji: '🍌' },
  { id: 'car', label: 'Car', emoji: '🚗' },
];
const CORRECT_ID = 'car';

export function PictureLogicGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [celebrating, setCelebrating] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint(
      'Which one does NOT belong? Apple, banana, car. Tap the one that is different.'
    );
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Which one is not like the others?');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speakCounterHint('Correct! The car does not belong!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setWrongId(id);
        triggerWrong();
        setTimeout(() => setWrongId(null), 600);
      }
    },
    [onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Odd One Spotted!"
          subtitle="The car is not a fruit!"
          badgeEmoji="🧠"
          variant="ocean"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <CountCornerBackground />

      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Quest {currentStep} · {progressPct}%
            </Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Which one is different from the fruits?')}>
                <Text style={styles.prompt}>Find the odd one 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.displayCard}>
          <Text style={styles.displayLabel}>Look through the scope</Text>
          <View style={styles.previewRow}>
            {ITEMS.map((item) => (
              <View key={item.id} style={styles.previewBox}>
                <Text style={styles.previewEmoji}>{item.emoji}</Text>
                <Text style={styles.previewLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.tapLabel}>Tap the one that does NOT belong</Text>
        <Animated.View style={[styles.optionsRow, shakeStyle]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={({ pressed }) => [
                styles.optionBtn,
                wrongId === item.id && styles.optionWrong,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
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
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...COUNTER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  stepPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
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
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...COUNTER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink },
  displayCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 18,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.card,
  },
  displayLabel: { fontSize: 13, fontWeight: '800', color: T.inkMuted, marginBottom: 14, textTransform: 'uppercase' },
  previewRow: { flexDirection: 'row', gap: 20 },
  previewBox: { alignItems: 'center' },
  previewEmoji: { fontSize: 36 },
  previewLabel: { fontSize: 12, fontWeight: '700', color: T.inkMuted, marginTop: 4 },
  tapLabel: { fontSize: 15, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 24, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingHorizontal: 20 },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.tileBorder,
    backgroundColor: T.tile,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  optionWrong: { borderColor: '#EF4444', backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  optionEmoji: { fontSize: 40, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '800', color: T.ink },
});
