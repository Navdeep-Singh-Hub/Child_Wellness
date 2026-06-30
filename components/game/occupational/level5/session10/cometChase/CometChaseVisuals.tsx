import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CometChaseBackdrop({ accent }: { accent: string }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.cometStreak,
            { top: `${18 + i * 16}%`, opacity: 0.15 + i * 0.05, backgroundColor: accent },
          ]}
        />
      ))}
      <Text style={[styles.backdropEmoji, { top: '10%', right: '12%' }]}>☄️</Text>
    </>
  );
}

const styles = StyleSheet.create({
  cometStreak: { position: 'absolute', left: '5%', right: '30%', height: 3, borderRadius: 2 },
  backdropEmoji: { position: 'absolute', fontSize: 28, opacity: 0.45 },
});
