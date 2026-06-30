import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LEDGER } from './theme';

export function LedgerBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.cover, { backgroundColor: LEDGER.cover }]} />
      <View style={[styles.page, { backgroundColor: LEDGER.page }]}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={[styles.line, { top: 40 + i * 26 }]} />
        ))}
      </View>
      <View style={[styles.ribbon, { backgroundColor: LEDGER.ribbon }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { flex: 1 },
  page: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    bottom: 24,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  line: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: LEDGER.pageLine,
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 36,
    width: 24,
    height: 70,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },
});
