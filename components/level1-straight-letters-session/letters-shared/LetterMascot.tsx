import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LetterMascotProps {
  emoji: string;
  name: string;
  hint: string;
  accent: string;
  bubbleBg: string;
  bubbleBorder: string;
  nameColor: string;
  hintColor: string;
}

export function LetterMascot({
  emoji,
  name,
  hint,
  accent,
  bubbleBg,
  bubbleBorder,
  nameColor,
  hintColor,
}: LetterMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.avatar, { borderColor: accent, backgroundColor: bubbleBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: bubbleBg, borderColor: bubbleBorder }]}>
        <Text style={[styles.name, { color: nameColor }]}>{name}</Text>
        <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emoji: { fontSize: 24 },
  bubble: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  name: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 2 },
  hint: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
