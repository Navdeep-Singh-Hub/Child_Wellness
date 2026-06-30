import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ATELIER } from './theme';

export function ChalkboardBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.base, { backgroundColor: ATELIER.board }]} />
      <View style={[styles.frame, { borderColor: ATELIER.boardEdge }]} />
      <View style={styles.tray} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  frame: { ...StyleSheet.absoluteFillObject, borderWidth: 6, margin: 8, borderRadius: 4 },
  tray: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#78350F',
    opacity: 0.7,
  },
});
