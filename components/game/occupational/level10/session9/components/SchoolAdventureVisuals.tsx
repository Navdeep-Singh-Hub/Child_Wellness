/** Campus quest backdrop — School Adventure */
import { SCHOOL_ADVENTURE_THEME } from '@/components/game/occupational/level10/session9/schoolAdventureTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { participatePhase?: boolean };

export const SchoolAdventureVisuals: React.FC<Props> = ({ participatePhase = false }) => {
  const bell = useSharedValue(0);

  useEffect(() => {
    bell.value = withRepeat(
      withTiming(1, { duration: participatePhase ? 900 : 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [bell, participatePhase]);

  const schoolStyle = useAnimatedStyle(() => ({
    opacity: participatePhase ? 0.26 + bell.value * 0.14 : 0.1 + bell.value * 0.08,
    transform: [{ scaleY: 0.94 + bell.value * 0.08 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SCHOOL_ADVENTURE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.schoolGlow, schoolStyle]}>
        <Text style={styles.schoolEmoji}>🏫</Text>
      </Animated.View>
      {SCHOOL_ADVENTURE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${9 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  schoolGlow: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(186,230,253,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolEmoji: { fontSize: 30 },
  decor: { position: 'absolute', fontSize: 16 },
});
