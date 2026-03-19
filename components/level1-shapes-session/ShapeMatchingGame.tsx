/**
 * Game 3: Shape Matching — drag circle and triangle to matching outlines. Snap correct, shake wrong.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const { width: SCREEN_W } = Dimensions.get('window');
const BOX = 90;
const SNAP_DIST = 50;

type ShapeType = 'circle' | 'triangle';

interface OutlineLayout {
  type: ShapeType;
  x: number;
  y: number;
}

interface DraggableLayout {
  type: ShapeType;
  x: number;
  y: number;
}

const OUTLINES: OutlineLayout[] = [
  { type: 'circle', x: SCREEN_W - 80, y: 140 },
  { type: 'triangle', x: SCREEN_W - 80, y: 260 },
];

const DRAGGABLES: DraggableLayout[] = [
  { type: 'circle', x: 60, y: 140 },
  { type: 'triangle', x: 60, y: 260 },
];

export function ShapeMatchingGame({
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
  const [positions, setPositions] = useState<Record<ShapeType, { x: number; y: number }>>({
    circle: { x: DRAGGABLES[0].x, y: DRAGGABLES[0].y },
    triangle: { x: DRAGGABLES[1].x, y: DRAGGABLES[1].y },
  });
  const [matched, setMatched] = useState<Set<ShapeType>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState<ShapeType | null>(null);
  const shakeX = React.useRef({ circle: 0, triangle: 0 }).current;

  const trySnap = (type: ShapeType, x: number, y: number) => {
    const outline = OUTLINES.find((o) => o.type === type)!;
    const dist = Math.hypot(x - outline.x, y - outline.y);
    if (dist <= SNAP_DIST) {
      setPositions((p) => ({ ...p, [type]: { x: outline.x, y: outline.y } }));
      setMatched((m) => new Set([...m, type]));
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      if (matched.size + 1 >= 2) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1500);
      }
    } else {
      setShake(type);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
      setTimeout(() => setShake(null), 500);
    }
  };

  return (
    <GameContainerGrip
      title="Shape Matching"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔷"
      mascotHint="Drag each shape to its outline!"
      onBack={onBack}
    >
      <View style={styles.outer}>
        <View style={styles.row}>
          <Text style={styles.sideLabel}>Shapes</Text>
          <Text style={styles.sideLabel}>Match here</Text>
        </View>
        {(['circle', 'triangle'] as const).map((type) => (
          <DraggableShape
            key={type}
            type={type}
            x={positions[type].x}
            y={positions[type].y}
            onEnd={(x, y) => trySnap(type, x, y)}
            disabled={matched.has(type)}
            isShake={shake === type}
          />
        ))}
        {OUTLINES.map((o) => (
          <View key={o.type} style={[styles.outlineWrap, { left: o.x - BOX / 2, top: o.y - BOX / 2 }]} pointerEvents="none">
            {o.type === 'circle' ? (
              <Svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
                <Circle cx={BOX/2} cy={BOX/2} r={BOX/2 - 4} stroke="#5B21B6" strokeWidth={3} fill="none" />
              </Svg>
            ) : (
              <Svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
                <Path d={`M ${BOX/2} 8 L ${BOX-8} ${BOX-8} L 8 ${BOX-8} Z`} stroke="#5B21B6" strokeWidth={3} fill="none" />
              </Svg>
            )}
          </View>
        ))}
        <View style={styles.starsRow}>
          {[0, 1].map((i) => (
            <Text key={i} style={styles.star}>{matched.size > i ? '⭐' : '☆'}</Text>
          ))}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

function DraggableShape({
  type,
  x,
  y,
  onEnd,
  disabled,
  isShake,
}: {
  type: ShapeType;
  x: number;
  y: number;
  onEnd: (x: number, y: number) => void;
  disabled: boolean;
  isShake: boolean;
}) {
  const translateX = Animated.useSharedValue(0);
  const translateY = Animated.useSharedValue(0);
  const offsetX = Animated.useSharedValue(x);
  const offsetY = Animated.useSharedValue(y);

  React.useEffect(() => {
    offsetX.value = x;
    offsetY.value = y;
    translateX.value = 0;
    translateY.value = 0;
  }, [x, y, disabled]);

  React.useEffect(() => {
    if (isShake) {
      translateX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isShake]);

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const newX = offsetX.value + e.translationX;
      const newY = offsetY.value + e.translationY;
      runOnJS(onEnd)(newX, newY);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value - BOX / 2 + translateX.value },
      { translateY: offsetY.value - BOX / 2 + translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.draggable, style]}>
        {type === 'circle' ? (
          <Svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
            <Circle cx={BOX/2} cy={BOX/2} r={BOX/2 - 6} fill="#5B21B6" opacity={0.9} />
          </Svg>
        ) : (
          <Svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
            <Path d={`M ${BOX/2} 12 L ${BOX-12} ${BOX-12} L 12 ${BOX-12} Z`} fill="#5B21B6" opacity={0.9} />
          </Svg>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, minHeight: 320 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 8 },
  sideLabel: { fontSize: 14, fontWeight: '700', color: '#5B21B6' },
  outlineWrap: { position: 'absolute', width: BOX, height: BOX },
  draggable: { position: 'absolute', width: BOX, height: BOX, zIndex: 10 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 24 },
  star: { fontSize: 32 },
});
