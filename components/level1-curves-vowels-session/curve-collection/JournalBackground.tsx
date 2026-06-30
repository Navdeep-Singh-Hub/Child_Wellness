import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CHRONICLE } from './theme';

export function JournalBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.base, { backgroundColor: CHRONICLE.paper }]} />
      <View style={styles.lines}>
        {Array.from({ length: 12 }, (_, i) => (
          <View key={i} style={[styles.line, { top: 60 + i * 28 }]} />
        ))}
      </View>
      <View style={[styles.ribbon, { backgroundColor: CHRONICLE.ribbon }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  lines: { ...StyleSheet.absoluteFillObject },
  line: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(180,83,9,0.12)',
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 32,
    width: 28,
    height: 80,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    opacity: 0.85,
  },
});
