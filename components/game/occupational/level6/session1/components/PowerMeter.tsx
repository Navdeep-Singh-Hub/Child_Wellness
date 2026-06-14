/**
 * PowerMeter — vertical energy bar for Superhero Power Sit.
 * Fills as the child sits tall, drains when they slouch.
 */
import { HERO_SHELL } from '@/components/game/occupational/level6/session1/superheroTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = { power: number; charging: boolean; accent: string };

export const PowerMeter: React.FC<Props> = ({ power, charging, accent }) => {
  const fillStyle = useAnimatedStyle(() => ({
    height: withTiming(`${Math.max(0, Math.min(100, power))}%`, { duration: 160 }),
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>POWER</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          <LinearGradient
            colors={[accent, HERO_SHELL.gold, '#FEF3C7']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Text style={[styles.bolt, { opacity: charging ? 1 : 0.4 }]}>⚡</Text>
      </View>
      <Text style={styles.value}>{Math.round(power)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, top: 18, bottom: 18, width: 66, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#FDE68A', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  track: {
    flex: 1,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,12,41,0.6)',
    borderWidth: 2,
    borderColor: HERO_SHELL.glassBorder,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fillWrap: { width: '100%', overflow: 'hidden' },
  bolt: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 26 },
  value: { color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 6 },
});
