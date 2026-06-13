import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChainMove } from './mirrorUtils';
import { CHAIN_EMOJIS } from './mirrorUtils';

type Props = {
  moves: ChainMove[];
  accent: string;
  currentStep?: number;
};

export function SequenceStrip({ moves, accent, currentStep }: Props) {
  if (moves.length === 0) return null;
  return (
    <View style={[styles.wrap, { borderColor: accent }]}>
      {moves.map((m, i) => (
        <View key={`${m}-${i}`} style={[styles.item, currentStep === i && styles.itemActive]}>
          <Text style={styles.emoji}>{CHAIN_EMOJIS[m]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginBottom: 14,
  },
  item: { opacity: 0.65 },
  itemActive: { opacity: 1, transform: [{ scale: 1.12 }] },
  emoji: { fontSize: 34 },
});
