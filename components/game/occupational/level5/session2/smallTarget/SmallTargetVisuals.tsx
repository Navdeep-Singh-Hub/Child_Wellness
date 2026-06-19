/** Archery Range visuals — OT L5 S2 Game 3 */
import { SMALL_TARGET_THEME as T } from '@/components/game/occupational/level5/session2/smallTarget/smallTargetTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function ArcheryRangeBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.woodWall}>
        <LinearGradient colors={['#92400E', '#78350F', '#451A03']} style={StyleSheet.absoluteFillObject} />
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.woodGrain, { top: `${i * 12.5}%` }]} />
        ))}
      </View>
      <View style={styles.floor} />
      <View style={styles.distanceMarks}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.mark, { opacity: 0.15 + n * 0.1 }]} />
        ))}
      </View>
    </View>
  );
}

export function BullseyeTarget({ x, y, scale, showCrosshair }: { x: number; y: number; scale: number; showCrosshair?: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const S = 36;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - S, top: y - S, width: S * 2, height: S * 2, transform: [{ scale }] }}>
      {showCrosshair && (
        <>
          <View style={[styles.crossH, { top: S - 1 }]} />
          <View style={[styles.crossV, { left: S - 1 }]} />
        </>
      )}
      <Animated.View style={[styles.ringOuter, ringStyle]} />
      <View style={styles.ringMid} />
      <View style={styles.ringInner} />
      <View style={styles.center} />
    </View>
  );
}

export function HitRipple({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [visible, t]);
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 40,
    top: y - 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FACC15',
    opacity: 1 - t.value,
    transform: [{ scale: 0.5 + t.value * 1.2 }],
  }));
  if (!visible) return null;
  return <Animated.View pointerEvents="none" style={style} />;
}

const styles = StyleSheet.create({
  woodWall: { position: 'absolute', top: 0, left: 0, right: 0, height: '75%', borderBottomWidth: 4, borderBottomColor: '#451A03' },
  woodGrain: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', backgroundColor: '#A16207' },
  distanceMarks: { position: 'absolute', bottom: '22%', alignSelf: 'center', flexDirection: 'row', gap: 24 },
  mark: { width: 60, height: 3, backgroundColor: '#FDE68A', borderRadius: 2 },
  crossH: { position: 'absolute', left: 4, right: 4, height: 2, backgroundColor: 'rgba(250,204,21,0.5)' },
  crossV: { position: 'absolute', top: 4, bottom: 4, width: 2, backgroundColor: 'rgba(250,204,21,0.5)' },
  ringOuter: { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', backgroundColor: '#EF4444', left: 0, top: 0 },
  ringMid: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', left: 12, top: 12 },
  ringInner: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF4444', left: 22, top: 22 },
  center: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#FACC15', left: 30, top: 30 },
});
