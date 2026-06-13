import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function MirrorOverlay() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.line} />
      <Text style={styles.label}>🪞 MIRROR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  line: {
    position: 'absolute',
    width: 3,
    height: '100%',
    backgroundColor: 'rgba(139,92,246,0.55)',
    borderRadius: 2,
  },
  label: {
    position: 'absolute',
    top: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#6D28D9',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
