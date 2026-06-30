import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EagleEyeQuestBackdrop({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.crownRing, { borderColor: `${accent}55` }]} />
      <Text style={[styles.backdropEmoji, { top: '10%', alignSelf: 'center' }]}>👑</Text>
      <Text style={[styles.backdropEmoji, { bottom: '12%', left: '15%' }]}>🦅</Text>
      <Text style={[styles.backdropEmoji, { bottom: '12%', right: '15%' }]}>⭐</Text>
    </>
  );
}

const styles = StyleSheet.create({
  backdropEmoji: { position: 'absolute', fontSize: 28, opacity: 0.45 },
  crownRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
});
