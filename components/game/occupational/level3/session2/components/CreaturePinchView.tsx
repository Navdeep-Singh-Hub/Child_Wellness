import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { ScaleTarget } from '@/components/game/occupational/level3/session2/scaleUtils';

type Props = {
  emoji: string;
  target: ScaleTarget;
  targetBig: number;
  targetSmall: number;
  minScale: number;
  maxScale: number;
  baseSize: number;
  bigColor: string;
  active: boolean;
  celebrate: boolean;
  onScaleEnd: (scale: number) => void;
};

export function CreaturePinchView({
  emoji,
  target,
  targetBig,
  targetSmall,
  minScale,
  maxScale,
  baseSize,
  bigColor,
  active,
  celebrate,
  onScaleEnd,
}: Props) {
  const objScale = useSharedValue(1);
  const pinchBase = useSharedValue(1);
  const celebrateScale = useSharedValue(1);

  React.useEffect(() => {
    if (celebrate) {
      celebrateScale.value = withSpring(1.12, { damping: 8 }, () => {
        celebrateScale.value = withSpring(1);
      });
    }
  }, [celebrate, celebrateScale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: objScale.value * celebrateScale.value }],
  }));

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .enabled(active)
    .onBegin(() => {
      pinchBase.value = objScale.value;
    })
    .onUpdate((e) => {
      objScale.value = Math.max(minScale, Math.min(maxScale, pinchBase.value * e.scale));
    })
    .onEnd(() => {
      const current = objScale.value;
      onScaleEnd(current);
      objScale.value = withSpring(1);
    });

  const targetLabel = target === 'big' ? 'Stretch BIG!' : 'Pinch SMALL!';
  const targetPct = target === 'big' ? Math.round(targetBig * 100) : Math.round(targetSmall * 100);

  return (
    <GestureDetector gesture={pinch}>
      <View style={styles.wrap}>
        <View style={[styles.targetHint, { borderColor: bigColor }]}>
          <Text style={[styles.targetText, { color: bigColor }]}>{targetLabel}</Text>
          <Text style={styles.targetSub}>Goal: {targetPct}%</Text>
        </View>
        <Animated.View style={[styles.creature, anim, { width: baseSize, height: baseSize }]}>
          <View style={[styles.body, { backgroundColor: bigColor, borderRadius: baseSize / 2 }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </Animated.View>
        <Text style={styles.help}>Use two fingers to pinch or stretch</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  targetHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  targetText: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  targetSub: { fontSize: 12, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 2 },
  creature: { alignItems: 'center', justifyContent: 'center' },
  body: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  emoji: { fontSize: 72 },
  help: { fontSize: 13, fontWeight: '600', color: '#64748B' },
});
