import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function StormRelayBackdrop({ accent }: { accent: string }) {
  return (
    <>
      <Text style={[styles.backdropEmoji, { top: '12%', left: '20%' }]}>⚡</Text>
      <Text style={[styles.backdropEmoji, { top: '20%', right: '18%' }]}>🌩️</Text>
      <View style={[styles.boltLine, { backgroundColor: accent }]} />
    </>
  );
}

const styles = StyleSheet.create({
  backdropEmoji: { position: 'absolute', fontSize: 28, opacity: 0.45 },
  boltLine: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    width: 4,
    height: '15%',
    borderRadius: 2,
    opacity: 0.4,
  },
});
