import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  obstacleX: SharedValue<number>;
  showObstacle: boolean;
  obstacleEmoji?: string;
  lilyY?: number;
};

export function LilyPadTrack({ obstacleX, showObstacle, obstacleEmoji = '🪨', lilyY = 72 }: Props) {
  const obstacleStyle = useAnimatedStyle(() => ({
    left: `${obstacleX.value}%`,
    top: `${lilyY - 6}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }],
  }));

  return (
    <View style={styles.track} pointerEvents="none">
      <View style={[styles.lily, { top: `${lilyY}%` }]}>
        <Text style={styles.lilyEmoji}>🪷</Text>
      </View>
      <View style={[styles.lily, styles.lilyRight, { top: `${lilyY}%` }]}>
        <Text style={styles.lilyEmoji}>🪷</Text>
      </View>
      {showObstacle && (
        <Animated.View style={[styles.obstacle, obstacleStyle]}>
          <Text style={styles.obstacleEmoji}>{obstacleEmoji}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { ...StyleSheet.absoluteFillObject },
  lily: { position: 'absolute', left: '18%', transform: [{ translateX: -28 }] },
  lilyRight: { left: '82%' },
  lilyEmoji: { fontSize: 48, opacity: 0.85 },
  obstacle: { position: 'absolute', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  obstacleEmoji: { fontSize: 52 },
});
