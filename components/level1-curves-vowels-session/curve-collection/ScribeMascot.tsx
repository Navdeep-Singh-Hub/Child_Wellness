import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CHRONICLE } from './theme';

interface ScribeMascotProps {
  hint: string;
}

export function ScribeMascot({ hint }: ScribeMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>✒️</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.name}>Scribe</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CHRONICLE.paperDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CHRONICLE.accent,
  },
  emoji: { fontSize: 22 },
  bubble: {
    flex: 1,
    backgroundColor: CHRONICLE.panel,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: CHRONICLE.panelBorder,
  },
  name: { fontSize: 11, fontWeight: '800', color: CHRONICLE.accent, letterSpacing: 0.8, marginBottom: 2 },
  hint: { fontSize: 14, fontWeight: '600', color: CHRONICLE.textDark, lineHeight: 20 },
});
