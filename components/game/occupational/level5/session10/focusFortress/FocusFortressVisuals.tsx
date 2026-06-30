import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function FocusFortressBackdrop({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.wall, { left: 0, borderColor: `${accent}44` }]} />
      <View style={[styles.wall, { right: 0, borderColor: `${accent}33` }]} />
      <Text style={[styles.backdropEmoji, { top: '8%', left: '10%' }]}>🏰</Text>
    </>
  );
}

const styles = StyleSheet.create({
  wall: {
    position: 'absolute',
    top: '15%',
    bottom: '15%',
    width: 14,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backdropEmoji: { position: 'absolute', fontSize: 28, opacity: 0.45 },
});
