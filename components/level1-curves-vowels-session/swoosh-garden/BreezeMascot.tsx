import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GARDEN } from './theme';

interface BreezeMascotProps {
  hint: string;
}

export function BreezeMascot({ hint }: BreezeMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>🦋</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.name}>Breeze</Text>
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
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: GARDEN.flower,
  },
  emoji: { fontSize: 24 },
  bubble: {
    flex: 1,
    backgroundColor: GARDEN.panel,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: GARDEN.panelBorder,
  },
  name: { fontSize: 11, fontWeight: '800', color: GARDEN.accent, letterSpacing: 0.8, marginBottom: 2 },
  hint: { fontSize: 14, fontWeight: '600', color: GARDEN.textDark, lineHeight: 20 },
});
