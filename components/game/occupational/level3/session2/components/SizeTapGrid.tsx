import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { TapObject } from '@/components/game/occupational/level3/session2/scaleUtils';

type Props = {
  objects: TapObject[];
  showCue: boolean;
  highlightTarget: 'big' | 'small' | null;
  bigColor: string;
  smallColor: string;
  onPick: (id: string) => void;
  disabled?: boolean;
};

export function SizeTapGrid({
  objects,
  showCue,
  highlightTarget,
  bigColor,
  smallColor,
  onPick,
  disabled,
}: Props) {
  return (
    <View style={styles.row}>
      {objects.map((obj) => (
        <TapCircle
          key={obj.id}
          obj={obj}
          showCue={showCue}
          highlight={
            showCue &&
            highlightTarget !== null &&
            (highlightTarget === 'big' ? obj.isLargest : obj.isSmallest)
          }
          color={obj.isLargest ? bigColor : obj.isSmallest ? smallColor : '#94A3B8'}
          onPress={() => onPick(obj.id)}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

function TapCircle({
  obj,
  showCue,
  highlight,
  color,
  onPress,
  disabled,
}: {
  obj: TapObject;
  showCue: boolean;
  highlight: boolean;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      disabled={disabled || !showCue}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 14 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.circle,
          anim,
          {
            width: obj.size,
            height: obj.size,
            borderRadius: obj.size / 2,
            backgroundColor: color,
          },
          highlight && styles.highlight,
        ]}
      >
        <Text style={[styles.label, { fontSize: obj.size > 80 ? 16 : 11 }]}>
          {obj.isLargest ? 'BIG' : obj.isSmallest ? 'S' : ''}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  highlight: {
    borderColor: '#10B981',
    borderWidth: 4,
  },
  label: { fontWeight: '900', color: '#fff' },
});
