/**
 * Game 4: Tap Correct Shape — "Tap the CIRCLE" / "Tap the TRIANGLE". Correct = green glow + sound, wrong = shake.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const SHAPES = ['circle', 'triangle', 'square'] as const;
type ShapeType = (typeof SHAPES)[number];

const LABELS: Record<ShapeType, string> = {
  circle: 'CIRCLE',
  triangle: 'TRIANGLE',
  square: 'SQUARE',
};

export function TapCorrectShapeGame({
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
  const [target, setTarget] = useState<ShapeType>('circle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongShake, setWrongShake] = useState<ShapeType | null>(null);

  const layout = useMemo(() => {
    const w = Dimensions.get('window').width - 48;
    const positions: { type: ShapeType; x: number; y: number }[] = [];
    const indices = [0, 1, 2].sort(() => Math.random() - 0.5);
    const cols = 2;
    const box = Math.min(w / 2 - 24, 120);
    const startX = 24 + (w - box * 2 - 24) / 2;
    const startY = 80;
    indices.forEach((i, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      positions.push({
        type: SHAPES[i],
        x: startX + col * (box + 24) + box / 2,
        y: startY + row * (box + 24) + box / 2,
      });
    });
    return { box, positions, target: SHAPES[indices[0]] as ShapeType };
  }, []);

  const handleTap = (type: ShapeType) => {
    if (type === layout.target) {
      setShowConfetti(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 1500);
    } else {
      setWrongShake(type);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
      setTimeout(() => setWrongShake(null), 400);
    }
  };

  return (
    <GameContainerGrip
      title="Tap the Shape"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="👆"
      mascotHint={`Tap the ${LABELS[layout.target]}!`}
      onBack={onBack}
    >
      <View style={styles.outer}>
        <Text style={styles.prompt}>Tap the {LABELS[layout.target]}</Text>
        <View style={styles.grid}>
          {layout.positions.map((item) => (
            <ShapeButton
              key={item.type}
              type={item.type}
              centerX={item.x}
              centerY={item.y}
              size={layout.box}
              onPress={() => handleTap(item.type)}
              isCorrect={item.type === layout.target}
              isShake={wrongShake === item.type}
            />
          ))}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

function ShapeButton({
  type,
  centerX,
  centerY,
  size,
  onPress,
  isCorrect,
  isShake,
}: {
  type: ShapeType;
  centerX: number;
  centerY: number;
  size: number;
  onPress: () => void;
  isCorrect: boolean;
  isShake: boolean;
}) {
  const translateX = Animated.useSharedValue(0);

  React.useEffect(() => {
    if (isShake) {
      translateX.value = withSequence(
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 40 }),
        withTiming(-6, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
    }
  }, [isShake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const half = size / 2;
  return (
    <Pressable onPress={onPress} style={[styles.shapeWrap, { left: centerX - half, top: centerY - half, width: size, height: size }]}>
      <Animated.View style={[styles.shapeInner, animatedStyle, isCorrect && styles.shapeCorrect]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {type === 'circle' && (
            <Circle cx={size/2} cy={size/2} r={size/2 - 10} fill="#5B21B6" stroke={isCorrect ? '#22C55E' : 'transparent'} strokeWidth={6} />
          )}
          {type === 'triangle' && (
            <Path d={`M ${size/2} 10 L ${size-10} ${size-10} L 10 ${size-10} Z`} fill="#5B21B6" stroke={isCorrect ? '#22C55E' : 'transparent'} strokeWidth={6} />
          )}
          {type === 'square' && (
            <Rect x={10} y={10} width={size-20} height={size-20} fill="#5B21B6" stroke={isCorrect ? '#22C55E' : 'transparent'} strokeWidth={6} />
          )}
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#5B21B6', textAlign: 'center', marginBottom: 24 },
  grid: { flex: 1, minHeight: 280 },
  shapeWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  shapeInner: { borderRadius: 20 },
  shapeCorrect: { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 20 },
});
