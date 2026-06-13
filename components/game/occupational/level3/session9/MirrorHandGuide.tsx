import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HandSide } from './mirrorUtils';

type Props = {
  visible: boolean;
  screenSide: HandSide;
};

export function MirrorHandGuide({ visible, screenSide }: Props) {
  if (!visible) return null;
  const childSide = screenSide === 'left' ? 'right' : 'left';
  return (
    <View style={styles.wrap}>
      <Text style={styles.screen}>
        Trainer: {screenSide === 'left' ? '⬅️' : '➡️'} {screenSide.toUpperCase()}
      </Text>
      <Text style={styles.mirror}>
        🪞 You raise: {childSide === 'left' ? '⬅️' : '➡️'} {childSide.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 12, alignSelf: 'center', alignItems: 'center', zIndex: 3 },
  screen: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  mirror: { fontSize: 15, fontWeight: '900', color: '#7C3AED', marginTop: 4 },
});
