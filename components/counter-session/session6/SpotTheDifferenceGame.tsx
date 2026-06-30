/**
 * Counter Session 6 — Game 1: Eagle Eye Deck — find 3 differences
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { EAGLE_EYE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { EagleLookoutBackground } from '../EagleLookoutBackground';

const PICTURE_LEFT = ['🍎', '🌙', '⭐', '🐱'];
const PICTURE_RIGHT = ['🍊', '☀️', '⭐', '🐕'];
const DIFFERENCE_INDICES = [0, 1, 3];

export function SpotTheDifferenceGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Find 3 differences. Look at both pictures. Tap each difference on the right.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Find what is different on the right picture.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleTap = useCallback(
    (index: number) => {
      if (found.has(index)) return;
      if (DIFFERENCE_INDICES.includes(index)) {
        setFound((prev) => {
          const next = new Set(prev).add(index);
          if (next.size >= 3) {
            speakCounterHint('You found all 3 differences!');
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              /* ignore */
            }
            setCelebrating(true);
            setTimeout(() => onComplete(), 2200);
          } else {
            speakCounterHint('Good! Find the next difference.');
          }
          return next;
        });
      } else {
        triggerWrong();
      }
    },
    [found, onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Eagle Eye!" subtitle="All 3 differences found!" badgeEmoji="🔍" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <EagleLookoutBackground />
      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Tap each difference on Picture B.')}>
                <Text style={styles.prompt}>Spot the differences 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.picturesRow}>
          <View style={styles.pictureBox}>
            <Text style={styles.pictureLabel}>Picture A</Text>
            <View style={styles.itemsRow}>
              {PICTURE_LEFT.map((emoji, i) => (
                <View key={i} style={styles.item}>
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.pictureBox}>
            <Text style={styles.pictureLabel}>Picture B</Text>
            <Animated.View style={[styles.itemsRow, shakeStyle]}>
              {PICTURE_RIGHT.map((emoji, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleTap(i)}
                  style={[styles.item, styles.tappable, found.has(i) && styles.found]}
                  accessibilityLabel={found.has(i) ? 'Found' : `Item ${i + 1}`}
                >
                  <Text style={[styles.emoji, found.has(i) && styles.foundEmoji]}>{emoji}</Text>
                  {found.has(i) ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              ))}
            </Animated.View>
          </View>
        </View>
        <Text style={styles.hint}>Tap the 3 differences in Picture B ({found.size}/3)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20, alignItems: 'center', paddingHorizontal: 12 },
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
  header: { paddingHorizontal: 8, paddingTop: 8, gap: 8, zIndex: 5, width: '100%' },
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
  picturesRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 16 },
  pictureBox: {
    flex: 1,
    backgroundColor: T.pictureBg,
    borderRadius: COUNTER_SESSION.radius.card,
    padding: 10,
    borderWidth: 3,
    borderColor: T.pictureBorder,
    ...COUNTER_SESSION.shadow.soft,
  },
  pictureLabel: { fontSize: 13, fontWeight: '800', color: T.accentDeep, marginBottom: 8, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  item: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tappable: {},
  found: { borderWidth: 3, borderColor: T.foundBorder, borderRadius: 10, backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  emoji: { fontSize: 26 },
  foundEmoji: { opacity: 0.6 },
  check: { position: 'absolute', bottom: 0, right: 2, fontSize: 12, color: T.foundBorder, fontWeight: '800' },
  hint: { fontSize: 15, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
