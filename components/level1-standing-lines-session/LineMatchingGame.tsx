/**
 * Game 4: Line matching — drag vertical line to correct outline; snap if correct, star reward.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

type Orientation = 'vertical' | 'horizontal' | 'slanted';
const TARGETS: { id: string; orientation: Orientation }[] = [
  { id: 'v1', orientation: 'vertical' },
  { id: 'h1', orientation: 'horizontal' },
  { id: 's1', orientation: 'slanted' },
];

const LINE_LEN = 50;

export function LineMatchingGame({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [matches, setMatches] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [layout, setLayout] = useState({ width: 300, height: 280 });

  const verticalTarget = TARGETS.find((t) => t.orientation === 'vertical')!;
  const needMatch = 1;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setLayout({ width, height });
  };

  const handleMatch = () => {
    setMatches((m) => m + 1);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onComplete();
    }, 1500);
  };

  const cx = layout.width / 2;
  const leftX = cx - 70;
  const rightX = cx + 50;
  const row1 = 90;
  const row2 = 160;
  const row3 = 230;

  const verticalLine = { x: leftX, y1: row2 - LINE_LEN / 2, y2: row2 + LINE_LEN / 2 };
  const slots = [
    { id: 'v1', x: rightX, y1: row2 - LINE_LEN / 2, y2: row2 + LINE_LEN / 2, orientation: 'vertical' as const },
    { id: 'h1', x1: rightX - LINE_LEN / 2, x2: rightX + LINE_LEN / 2, y: row1, orientation: 'horizontal' as const },
    { id: 's1', x1: rightX - 25, x2: rightX + 25, y1: row3 - 25, y2: row3 + 25, orientation: 'slanted' as const },
  ];

  const [dragX, dragY] = [useSharedValue(verticalLine.x), useSharedValue(verticalLine.y1 + LINE_LEN / 2)];
  const [slotX, slotY] = [useSharedValue(slots[0].x), useSharedValue(row2)];

  const pan = Gesture.Pan()
    .onStart(() => {
      runOnJS(setDraggedId)('v');
    })
    .onUpdate((e) => {
      dragX.value = verticalLine.x + e.translationX;
      dragY.value = row2 + e.translationY;
    })
    .onEnd((e) => {
      const dx = dragX.value - slotX.value;
      const dy = dragY.value - slotY.value;
      if (Math.hypot(dx, dy) < 55) {
        runOnJS(handleMatch)();
      } else {
        dragX.value = withSpring(verticalLine.x);
        dragY.value = withSpring(row2);
        runOnJS(setDraggedId)(null);
      }
    });

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value - verticalLine.x }, { translateY: dragY.value - row2 }],
  }));

  return (
    <GameContainerGrip
      title="Match the Line"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="↕️"
      mascotHint="Drag the vertical line to the matching slot!"
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <View style={styles.row}>
          <Text style={styles.sideLabel}>Drag from here</Text>
          <View style={styles.lineBox}>
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.draggable, animatedLineStyle]}>
                <Svg width={40} height={LINE_LEN + 20}>
                  <Line x1={20} y1={10} x2={20} y2={LINE_LEN + 10} stroke="#5B21B6" strokeWidth={6} strokeLinecap="round" />
                </Svg>
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.sideLabel}>Match here</Text>
          <View style={styles.slots}>
            {slots.map((s) => (
              <View key={s.id} style={[styles.slot, s.orientation === 'vertical' && styles.slotHighlight]}>
                {s.orientation === 'vertical' ? (
                  <Svg width={40} height={LINE_LEN + 20}>
                    <Line x1={20} y1={10} x2={20} y2={LINE_LEN + 10} stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 4" />
                  </Svg>
                ) : s.orientation === 'horizontal' ? (
                  <Svg width={LINE_LEN + 20} height={40}>
                    <Line x1={10} y1={20} x2={LINE_LEN + 10} y2={20} stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 4" />
                  </Svg>
                ) : (
                  <Svg width={60} height={60}>
                    <Line x1={10} y1={50} x2={50} y2={10} stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 4" />
                  </Svg>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.stars}>
          {Array.from({ length: needMatch }, (_, i) => (
            <Text key={i} style={[styles.star, i < matches && styles.starEarned]}>⭐</Text>
          ))}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  sideLabel: { fontSize: 14, fontWeight: '700', color: '#5B21B6', width: 100 },
  lineBox: { flex: 1, height: 80, justifyContent: 'center' },
  draggable: { position: 'absolute', left: 0, top: 0, padding: 10 },
  slots: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  slot: { padding: 12, backgroundColor: '#EDE9FE', borderRadius: 16, borderWidth: 2, borderColor: '#C4B5FD' },
  slotHighlight: { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  star: { fontSize: 28, opacity: 0.35 },
  starEarned: { opacity: 1 },
});
