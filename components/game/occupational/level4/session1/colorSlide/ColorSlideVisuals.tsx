/**
 * Paint studio play area for Color Slide (OT L4 S1 Game 4).
 */
import type { DragColor } from '@/components/game/occupational/level4/session1/shared/dragUtils';
import { DRAG_COLORS } from '@/components/game/occupational/level4/session1/shared/dragUtils';
import { COLOR_SLIDE_THEME as T } from '@/components/game/occupational/level4/session1/colorSlide/colorSlideTheme';
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
  dragColor: DragColor;
  splashKey: number;
  matchedCount: number;
};

const SPLATTER_SPOTS = [
  { top: '8%', left: '6%', size: 22, color: '#EF4444', rot: '-12deg' },
  { top: '12%', right: '8%', size: 18, color: '#3B82F6', rot: '18deg' },
  { bottom: '14%', left: '10%', size: 16, color: '#10B981', rot: '8deg' },
  { bottom: '10%', right: '12%', size: 20, color: '#F59E0B', rot: '-20deg' },
];

export const ColorMatchPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  dragColor,
  splashKey,
  matchedCount,
}) => {
  const beltShift = useSharedValue(0);
  const bucketGlow = useSharedValue(0.5);
  const arrowX = useSharedValue(0);
  const splashScale = useSharedValue(0);
  const dripY = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    beltShift.value = withRepeat(
      withTiming(12, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    bucketGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dripY.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 1100 }),
        withTiming(0, { duration: 1100 }),
      ),
      -1,
      true,
    );
  }, [roundActive, beltShift, bucketGlow, dripY]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 580, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 580, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  useEffect(() => {
    if (!splashKey) return;
    splashScale.value = withSequence(
      withSpring(1.2, { damping: 7, stiffness: 220 }),
      withTiming(0, { duration: 450 }),
    );
  }, [splashKey, splashScale]);

  const beltStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: beltShift.value }],
  }));

  const bucketGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + bucketGlow.value * 0.45,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.92 : 0,
  }));

  const splashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splashScale.value }],
    opacity: splashScale.value > 0.05 ? 0.85 : 0,
  }));

  const dripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dripY.value }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.canvasWhite, T.studioCream, '#FDF2F8']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {SPLATTER_SPOTS.map((s, i) => (
        <View
          key={`splatter-${i}`}
          style={[
            styles.splatter,
            {
              top: s.top,
              left: s.left,
              right: s.right,
              width: s.size,
              height: s.size * 0.75,
              backgroundColor: s.color,
              transform: [{ rotate: s.rot }],
              opacity: 0.14,
            },
          ]}
        />
      ))}

      <View style={styles.studioShelf}>
        <Text style={styles.shelfLabel}>PAINT STUDIO</Text>
      </View>

      <View style={styles.paletteWall}>
        {DRAG_COLORS.map((c) => (
          <View
            key={c.name}
            style={[
              styles.swatch,
              { backgroundColor: c.hex },
              c.name === dragColor.name && styles.swatchActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.conveyorFrame}>
        <View style={styles.conveyorRail} />
        <Animated.View style={[styles.conveyorBelt, beltStyle]}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={`seg-${i}`} style={styles.beltSegment} />
          ))}
        </Animated.View>
        <View style={[styles.conveyorRail, { bottom: 0, top: undefined }]} />
      </View>

      <View style={styles.paletteStation}>
        <View style={styles.easel}>
          <View style={styles.easelLeg} />
          <View style={styles.easelLegRight} />
        </View>
        <View style={[styles.paletteBoard, { borderColor: `${dragColor.hex}88` }]}>
          <Text style={styles.paletteLabel}>PICK</Text>
          {!isDragging && (
            <View style={[styles.paletteBlob, { backgroundColor: `${dragColor.hex}44` }]}>
              <Text style={styles.paletteEmoji}>{dragColor.emoji}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bucketStation}>
        <Animated.View style={[styles.bucketGlow, bucketGlowStyle, { backgroundColor: dragColor.hex }]} />
        <View style={[styles.bucket, { borderColor: dragColor.hex }]}>
          <View style={[styles.bucketLiquid, { backgroundColor: `${dragColor.hex}55` }]} />
          <Animated.View style={[styles.paintDrip, dripStyle, { backgroundColor: dragColor.hex }]} />
          <Text style={styles.bucketEmoji}>{dragColor.emoji}</Text>
        </View>
        <Text style={[styles.bucketLabel, { color: dragColor.hex }]}>MATCH</Text>
        <View style={styles.matchedDots}>
          {Array.from({ length: Math.min(5, matchedCount) }).map((_, i) => (
            <View key={`dot-${i}`} style={[styles.matchedDot, { backgroundColor: dragColor.hex }]} />
          ))}
        </View>
      </View>

      <Animated.View style={[styles.splashBurst, splashStyle, { backgroundColor: dragColor.hex }]} />

      <Animated.View style={[styles.slideArrow, arrowStyle]}>
        <Text style={[styles.slideArrowText, { color: dragColor.hex }]}>➜</Text>
        <Text style={styles.slideArrowHint}>Same color!</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  splatter: {
    position: 'absolute',
    borderRadius: 999,
  },
  studioShelf: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    height: 22,
    backgroundColor: T.studioWood,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  shelfLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFBEB',
  },
  paletteWall: {
    position: 'absolute',
    top: 36,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    opacity: 0.55,
  },
  swatchActive: {
    opacity: 1,
    transform: [{ scale: 1.25 }],
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  conveyorFrame: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '42%',
    height: '22%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  conveyorRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: T.conveyor,
    borderRadius: 2,
    opacity: 0.5,
  },
  conveyorBelt: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  beltSegment: {
    width: 28,
    height: 10,
    backgroundColor: 'rgba(120,113,108,0.25)',
    borderRadius: 2,
  },
  paletteStation: {
    position: 'absolute',
    left: '6%',
    top: '30%',
    width: '22%',
    height: '48%',
    alignItems: 'center',
  },
  easel: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: '55%',
  },
  easelLeg: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: 3,
    height: '100%',
    backgroundColor: T.studioWood,
    transform: [{ rotate: '-8deg' }],
  },
  easelLegRight: {
    position: 'absolute',
    bottom: 0,
    right: '20%',
    width: 3,
    height: '100%',
    backgroundColor: T.studioWood,
    transform: [{ rotate: '8deg' }],
  },
  paletteBoard: {
    width: '92%',
    height: '72%',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  paletteLabel: {
    position: 'absolute',
    top: 8,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: T.paintLabel,
  },
  paletteBlob: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  paletteEmoji: { fontSize: 26 },
  bucketStation: {
    position: 'absolute',
    right: '6%',
    top: '28%',
    width: '24%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    transform: [{ scale: 1.08 }],
  },
  bucket: {
    width: '78%',
    height: '72%',
    borderWidth: 3,
    borderRadius: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  bucketLiquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  paintDrip: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 14,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  bucketEmoji: { fontSize: 30, zIndex: 2 },
  bucketLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  matchedDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  matchedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.75,
  },
  splashBurst: {
    position: 'absolute',
    right: '16%',
    top: '40%',
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.35,
  },
  slideArrow: {
    position: 'absolute',
    left: '30%',
    top: '46%',
    alignItems: 'center',
  },
  slideArrowText: {
    fontSize: 30,
    fontWeight: '900',
  },
  slideArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: T.paintLabel,
  },
});
