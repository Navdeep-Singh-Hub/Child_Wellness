import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

type Props = {
  number: number | null;
  visible: boolean;
  success?: boolean;
};

export function JumpCountBadge({ number, visible, success }: Props) {
  if (!visible || number === null) return null;
  const isTwo = number === 2;
  const bg = success === true ? '#DCFCE7' : success === false ? '#FEE2E2' : isTwo ? '#FEF9C3' : '#F3F4F6';
  const color = success === true ? '#15803D' : success === false ? '#B91C1C' : isTwo ? '#A16207' : '#4B5563';

  return (
    <Animated.View entering={ZoomIn.duration(220)} exiting={FadeOut.duration(160)} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
        <Text style={[styles.number, { color }]}>{number}</Text>
        {isTwo ? <Text style={[styles.hint, { color }]}>JUMP!</Text> : <Text style={[styles.hint, { color }]}>WAIT</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '18%', zIndex: 5 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 44, fontWeight: '900' },
  hint: { fontSize: 12, fontWeight: '800', marginTop: -4 },
});
