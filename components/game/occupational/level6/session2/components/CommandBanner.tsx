/**
 * CommandBanner — a royal command card for Soldier Stand, and a MOVE/FREEZE
 * signal for Freeze & Balance.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

type Props = { label: string; cue?: string; tone: 'command' | 'move' | 'freeze'; pulseKey?: number };

const TONE_COLORS: Record<Props['tone'], string> = {
  command: 'rgba(180,83,9,0.92)',
  move: 'rgba(109,40,217,0.92)',
  freeze: 'rgba(14,116,144,0.95)',
};

export const CommandBanner: React.FC<Props> = ({ label, cue, tone, pulseKey = 0 }) => {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    if (pulseKey > 0) scale.value = withSequence(withTiming(1.18, { duration: 160 }), withTiming(1, { duration: 220 }));
  }, [pulseKey, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { backgroundColor: TONE_COLORS[tone] }, style]}>
      <Text style={styles.label}>{label}</Text>
      {!!cue && <Text style={styles.cue}>{cue}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    maxWidth: '90%',
  },
  label: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  cue: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2, opacity: 0.92, textAlign: 'center' },
});
