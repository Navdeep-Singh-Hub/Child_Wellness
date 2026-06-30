/**
 * Counter Session 5 — Game 1: Compass Crossing — move to the star on a grid
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { COMPASS_CROSSING_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { WindVaneBackground } from '../WindVaneBackground';

const ROWS = 3;
const COLS = 3;
const CELL_SIZE = 58;
const START = { row: 1, col: 1 };
const TARGET = { row: 0, col: 2 };

export function DirectionGame({
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
  const [pos, setPos] = useState(START);
  const [celebrating, setCelebrating] = useState(false);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Move the character to the star. Use LEFT, RIGHT, UP, and DOWN.');
    return () => stopCounterSpeech();
  }, []);

  const move = useCallback(
    (dr: number, dc: number) => {
      const row = Math.max(0, Math.min(ROWS - 1, pos.row + dr));
      const col = Math.max(0, Math.min(COLS - 1, pos.col + dc));
      setPos({ row, col });
      if (row === TARGET.row && col === TARGET.col) {
        speakCounterHint('You reached the star! Great job!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [pos, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Star Reached!" subtitle="You moved to the star!" badgeEmoji="⭐" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <WindVaneBackground />
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
              <Pressable onPress={() => speakCounterHint('Move to the star using the arrows.')}>
                <Text style={styles.prompt}>Cross to the star ⭐ 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.grid}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <View key={`${r}-${c}`} style={styles.cell}>
                {r === pos.row && c === pos.col ? (
                  <Text style={styles.character}>🧒</Text>
                ) : r === TARGET.row && c === TARGET.col ? (
                  <Text style={styles.target}>⭐</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
        <View style={styles.arrows}>
          <View style={styles.arrowRow}>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(-1, 0)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move up"
            >
              <Text style={styles.arrowText}>▲</Text>
              <Text style={styles.arrowLabel}>UP</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
          </View>
          <View style={styles.arrowRow}>
            <Pressable
              onPress={() => move(0, -1)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move left"
            >
              <Text style={styles.arrowText}>◀</Text>
              <Text style={styles.arrowLabel}>LEFT</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(0, 1)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move right"
            >
              <Text style={styles.arrowText}>▶</Text>
              <Text style={styles.arrowLabel}>RIGHT</Text>
            </Pressable>
          </View>
          <View style={styles.arrowRow}>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(1, 0)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move down"
            >
              <Text style={styles.arrowText}>▼</Text>
              <Text style={styles.arrowLabel}>DOWN</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20, alignItems: 'center' },
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
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5, width: '100%' },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: COLS * CELL_SIZE,
    height: ROWS * CELL_SIZE,
    backgroundColor: T.grid,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.gridBorder,
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden',
    ...COUNTER_SESSION.shadow.card,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.cellBorder,
  },
  character: { fontSize: 32 },
  target: { fontSize: 28 },
  arrows: { gap: 8 },
  arrowRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  arrowSpacer: { width: 74 },
  arrowBtn: {
    width: 74,
    paddingVertical: 12,
    borderRadius: COUNTER_SESSION.radius.button,
    backgroundColor: T.arrowBtn,
    borderWidth: 3,
    borderColor: T.arrowBorder,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  arrowText: { fontSize: 24, color: T.accent, marginBottom: 2 },
  arrowLabel: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
});
