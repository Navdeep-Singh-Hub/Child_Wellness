/**
 * TrafficLight — Green / Yellow / Red command light for Sit Tall Freeze.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export type LightState = 'green' | 'yellow' | 'red' | 'off';

type Props = { state: LightState };

const LABEL: Record<LightState, string> = {
  green: 'SIT TALL!',
  yellow: 'GET READY…',
  red: 'FREEZE!',
  off: 'Watch the light',
};

const Lamp: React.FC<{ color: string; on: boolean }> = ({ color, on }) => {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(on ? 1 : 0.18, { duration: 150 }),
    transform: [{ scale: withTiming(on ? 1.08 : 0.9, { duration: 150 }) }],
  }));
  return <Animated.View style={[styles.lamp, { backgroundColor: color, shadowColor: color }, style]} />;
};

export const TrafficLight: React.FC<Props> = ({ state }) => {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.housing}>
        <Lamp color="#34D399" on={state === 'green'} />
        <Lamp color="#FBBF24" on={state === 'yellow'} />
        <Lamp color="#FB7185" on={state === 'red'} />
      </View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>{LABEL[state]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 16, alignSelf: 'center', alignItems: 'center' },
  housing: {
    backgroundColor: 'rgba(15,12,41,0.8)',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: 'rgba(196,181,253,0.4)',
  },
  lamp: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  labelPill: {
    marginTop: 8,
    backgroundColor: 'rgba(124,58,237,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  labelText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
