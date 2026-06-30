/** Command beacon HUD backdrop — Mission Update */
import { MISSION_UPDATE_THEME } from '@/components/game/occupational/level10/session3/missionUpdateTheme';
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

type Props = { updateFlash?: boolean };

export const MissionUpdateVisuals: React.FC<Props> = ({ updateFlash = false }) => {
  const scan = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    scan.value = withRepeat(
      withTiming(1, { duration: updateFlash ? 450 : 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: updateFlash ? 350 : 1800, easing: Easing.linear }),
      -1,
      false,
    );
  }, [pulse, scan, updateFlash]);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: updateFlash ? 0.3 + scan.value * 0.35 : 0.1 + scan.value * 0.12,
    transform: [{ translateY: scan.value * 120 }],
  }));

  const hudStyle = useAnimatedStyle(() => ({
    opacity: updateFlash ? 0.85 : 0.5,
    borderColor: updateFlash ? 'rgba(245,158,11,0.8)' : 'rgba(56,189,248,0.35)',
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MISSION_UPDATE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.scanBeam, scanStyle]} />
      <Animated.View style={[styles.hudFrame, hudStyle]} />
      {MISSION_UPDATE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${4 + (i * 13) % 86}%`, top: `${8 + (i % 5) * 16}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.consoleBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  scanBeam: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  hudFrame: {
    position: 'absolute',
    top: 48,
    left: 12,
    right: 12,
    bottom: 36,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  consoleBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56,189,248,0.3)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
