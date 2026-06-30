/**
 * Neon city highway play area for Lane Cross (OT L4 S1 Game 3).
 */
import { LANE_CROSS_THEME as T } from '@/components/game/occupational/level4/session1/laneCross/laneCrossTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  isDragging: boolean;
  crossKey: number;
  parkedCars: number;
};

const SKYLINE_BLOCKS = [
  { left: '4%', w: 28, h: 52 },
  { left: '14%', w: 22, h: 68 },
  { left: '24%', w: 34, h: 44 },
  { left: '38%', w: 20, h: 58 },
  { left: '52%', w: 30, h: 72 },
  { left: '66%', w: 24, h: 48 },
  { left: '78%', w: 32, h: 62 },
  { left: '90%', w: 26, h: 50 },
];

export const RoadCrossingPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  crossKey,
  parkedCars,
}) => {
  const dashOffset = useSharedValue(0);
  const lightGlow = useSharedValue(0.4);
  const arrowX = useSharedValue(0);
  const parkPulse = useSharedValue(0.5);
  const neonFlicker = useSharedValue(1);

  useEffect(() => {
    if (!roundActive) return;
    dashOffset.value = withRepeat(
      withTiming(24, { duration: 700, easing: Easing.linear }),
      -1,
      false,
    );
    lightGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    parkPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.45, { duration: 800 }),
      ),
      -1,
      true,
    );
    neonFlicker.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 120 }),
        withTiming(1, { duration: 80 }),
        withTiming(0.92, { duration: 200 }),
        withTiming(1, { duration: 1600 }),
      ),
      -1,
      false,
    );
  }, [roundActive, dashOffset, lightGlow, parkPulse, neonFlicker]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(16, { duration: 550, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  useEffect(() => {
    if (!crossKey) return;
    lightGlow.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [crossKey, lightGlow]);

  const dashStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dashOffset.value }],
  }));

  const parkGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + parkPulse.value * 0.55,
  }));

  const neonStyle = useAnimatedStyle(() => ({
    opacity: neonFlicker.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.95 : 0,
  }));

  const greenBulbStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + lightGlow.value * 0.6,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#0B1220', T.asphalt, T.asphaltLight]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.skylineRow}>
        {SKYLINE_BLOCKS.map((b, i) => (
          <View
            key={`bld-${i}`}
            style={[
              styles.building,
              { left: b.left, width: b.w, height: b.h },
            ]}
          >
            {[0, 1, 2].map((w) => (
              <View
                key={`win-${i}-${w}`}
                style={[
                  styles.window,
                  { opacity: (i + w) % 2 === 0 ? 0.7 : 0.25, top: 8 + w * 14 },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <Animated.View style={[styles.neonSign, neonStyle]}>
        <Text style={styles.neonText}>LANE CROSS</Text>
      </Animated.View>

      <View style={styles.roadSurface}>
        <View style={[styles.roadEdge, styles.roadEdgeTop]} />
        <View style={[styles.roadEdge, styles.roadEdgeBottom]} />

        {[-1, 0, 1].map((lane) => (
          <View
            key={`lane-bg-${lane}`}
            style={[
              styles.laneBand,
              { top: `${30 + lane * 14}%` },
            ]}
          />
        ))}

        <Animated.View style={[styles.dashContainer, dashStyle]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={`dash-${i}`} style={[styles.laneDash, { top: i * 28 }]} />
          ))}
        </Animated.View>

        <View style={styles.crosswalk}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={`cw-${i}`} style={[styles.crosswalkStripe, { left: `${18 + i * 14}%` }]} />
          ))}
        </View>
      </View>

      <View style={styles.trafficLight}>
        <View style={styles.lightPole} />
        <View style={styles.lightBox}>
          <View style={[styles.bulb, styles.bulbRed, { opacity: isDragging ? 0.25 : 0.9 }]} />
          <View style={[styles.bulb, styles.bulbAmber, { opacity: 0.3 }]} />
          <Animated.View style={[styles.bulb, styles.bulbGreen, greenBulbStyle]} />
        </View>
      </View>

      <View style={styles.startZone}>
        <Text style={styles.zoneTag}>START</Text>
        <View style={styles.parkingLines}>
          <View style={styles.pLine} />
          <View style={[styles.pLine, { marginLeft: 14 }]} />
        </View>
      </View>

      <View style={styles.parkZone}>
        <Animated.View style={[styles.parkGlow, parkGlowStyle]} />
        <Text style={styles.zoneTagPark}>PARK</Text>
        <Text style={styles.parkIcon}>🅿️</Text>
        <View style={styles.parkedRow}>
          {Array.from({ length: Math.min(5, parkedCars) }).map((_, i) => (
            <Text key={`parked-${i}`} style={styles.parkedCar}>
              {i % 2 === 0 ? '🚗' : '🚙'}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.streetLampLeft}>
        <View style={styles.lampPole} />
        <View style={styles.lampGlow} />
      </View>
      <View style={styles.streetLampRight}>
        <View style={styles.lampPole} />
        <View style={styles.lampGlow} />
      </View>

      <Animated.View style={[styles.driveArrow, arrowStyle]}>
        <Text style={styles.driveArrowText}>➜</Text>
        <Text style={styles.driveArrowHint}>Steer across</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  skylineRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '22%',
  },
  building: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: T.skyline,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.12)',
    alignItems: 'center',
  },
  window: {
    width: 6,
    height: 8,
    backgroundColor: T.windowLit,
    borderRadius: 1,
    position: 'absolute',
  },
  neonSign: {
    position: 'absolute',
    top: '19%',
    alignSelf: 'center',
    left: '28%',
    right: '28%',
    alignItems: 'center',
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.45)',
    borderRadius: 6,
    backgroundColor: 'rgba(8,145,178,0.15)',
  },
  neonText: {
    color: T.neonCyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: T.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  roadSurface: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: '24%',
    height: '62%',
    backgroundColor: T.asphalt,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  roadEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.laneWhite,
    opacity: 0.5,
  },
  roadEdgeTop: { top: 0 },
  roadEdgeBottom: { bottom: 0 },
  laneBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '14%',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dashContainer: {
    position: 'absolute',
    left: '48%',
    top: -12,
    width: 4,
    height: '120%',
  },
  laneDash: {
    position: 'absolute',
    width: 4,
    height: 16,
    backgroundColor: T.laneMark,
    borderRadius: 2,
    opacity: 0.8,
  },
  crosswalk: {
    position: 'absolute',
    left: '38%',
    right: '38%',
    top: '38%',
    height: '24%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.35,
  },
  crosswalkStripe: {
    width: 8,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  trafficLight: {
    position: 'absolute',
    left: '3%',
    top: '34%',
    alignItems: 'center',
  },
  lightPole: {
    width: 4,
    height: 36,
    backgroundColor: '#4B5563',
    borderRadius: 2,
  },
  lightBox: {
    width: 18,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    gap: 3,
  },
  bulb: { width: 10, height: 10, borderRadius: 5 },
  bulbRed: { backgroundColor: '#EF4444' },
  bulbAmber: { backgroundColor: T.accentAmber },
  bulbGreen: { backgroundColor: '#22C55E' },
  startZone: {
    position: 'absolute',
    left: '8%',
    top: '38%',
    width: '18%',
    height: '34%',
    borderWidth: 2,
    borderColor: T.neonCyan,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  parkZone: {
    position: 'absolute',
    right: '8%',
    top: '34%',
    width: '20%',
    height: '42%',
    borderWidth: 2,
    borderColor: T.accentAmber,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,191,36,0.08)',
    overflow: 'hidden',
  },
  parkGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentAmber,
  },
  zoneTag: {
    position: 'absolute',
    top: 8,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.neonCyan,
  },
  zoneTagPark: {
    position: 'absolute',
    top: 8,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentAmber,
  },
  parkingLines: {
    flexDirection: 'row',
    opacity: 0.4,
  },
  pLine: {
    width: 2,
    height: 20,
    backgroundColor: T.neonCyan,
  },
  parkIcon: { fontSize: 28, marginTop: 8 },
  parkedRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
  },
  parkedCar: { fontSize: 10 },
  streetLampLeft: {
    position: 'absolute',
    left: '22%',
    bottom: '12%',
    alignItems: 'center',
  },
  streetLampRight: {
    position: 'absolute',
    right: '22%',
    bottom: '12%',
    alignItems: 'center',
  },
  lampPole: {
    width: 3,
    height: 28,
    backgroundColor: '#6B7280',
  },
  lampGlow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(253,224,71,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.35)',
    marginBottom: -4,
  },
  driveArrow: {
    position: 'absolute',
    left: '32%',
    top: '48%',
    alignItems: 'center',
  },
  driveArrowText: {
    fontSize: 30,
    color: T.neonCyan,
    fontWeight: '900',
    textShadowColor: T.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  driveArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(226,232,240,0.9)',
  },
});
