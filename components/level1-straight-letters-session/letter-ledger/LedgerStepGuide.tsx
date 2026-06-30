import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LEDGER } from './theme';

interface LedgerStepGuideProps {
  phase: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: 'Write a letter', icon: '✏️' },
  { n: 2, label: 'Photograph page', icon: '📷' },
  { n: 3, label: 'Record in ledger', icon: '📒' },
];

export function LedgerStepGuide({ phase }: LedgerStepGuideProps) {
  return (
    <View style={styles.wrap}>
      {STEPS.map((s) => (
        <View key={s.n} style={styles.step}>
          <View style={[styles.dot, phase >= s.n && styles.dotActive]}>
            <Text style={styles.dotIcon}>{s.icon}</Text>
          </View>
          <Text style={[styles.label, phase >= s.n && styles.labelActive]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 6 },
  step: { flex: 1, alignItems: 'center' },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30,58,95,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: { backgroundColor: '#DBEAFE', borderColor: LEDGER.accent },
  dotIcon: { fontSize: 18 },
  label: { fontSize: 10, fontWeight: '600', color: LEDGER.textMuted, textAlign: 'center' },
  labelActive: { color: LEDGER.textDark, fontWeight: '800' },
});
