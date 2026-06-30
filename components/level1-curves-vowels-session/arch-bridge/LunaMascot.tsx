import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOON_BRIDGE } from './theme';

interface LunaMascotProps {
  hint: string;
}

export function LunaMascot({ hint }: LunaMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>🌙</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.name}>Luna</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MOON_BRIDGE.moonGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MOON_BRIDGE.moon,
  },
  emoji: { fontSize: 24 },
  bubble: {
    flex: 1,
    backgroundColor: MOON_BRIDGE.panel,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: MOON_BRIDGE.panelBorder,
  },
  name: { fontSize: 11, fontWeight: '800', color: MOON_BRIDGE.accent, letterSpacing: 0.8, marginBottom: 2 },
  hint: { fontSize: 14, fontWeight: '600', color: MOON_BRIDGE.textLight, lineHeight: 20 },
});
