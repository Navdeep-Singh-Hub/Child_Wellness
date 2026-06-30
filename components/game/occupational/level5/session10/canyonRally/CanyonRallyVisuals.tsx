import React from 'react';
import { StyleSheet, View } from 'react-native';

export function CanyonRallyBackdrop({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.canyonLayer, { bottom: '8%', backgroundColor: `${accent}22` }]} />
      <View style={[styles.canyonLayer, { bottom: '18%', backgroundColor: `${accent}15`, height: 40 }]} />
    </>
  );
}

const styles = StyleSheet.create({
  canyonLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
