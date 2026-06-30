/**
 * Forest trail backdrop for Back Track (OT L4 S2 Game 3).
 */
import { BACK_TRACK_THEME as T } from '@/components/game/occupational/level4/session2/backTrack/backTrackTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  roundActive: boolean;
  variantLabel: string;
  arriveKey: number;
};

const TREES = [
  { left: '4%', h: 48 },
  { left: '18%', h: 62 },
  { left: '82%', h: 56 },
  { left: '92%', h: 44 },
];

export const BackTrackPlayArea: React.FC<Props> = ({ roundActive, variantLabel, arriveKey }) => {
  const firefly = useSharedValue(0.3);
  const campGlow = useSharedValue(0.5);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    firefly.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    campGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.4, { duration: 900 })),
      -1,
      true,
    );
  }, [roundActive, firefly, campGlow]);

  useEffect(() => {
    if (!arriveKey) return;
    flash.value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 500 }));
  }, [arriveKey, flash]);

  const fireflyStyle = useAnimatedStyle(() => ({ opacity: 0.3 + firefly.value * 0.55 }));
  const campStyle = useAnimatedStyle(() => ({ opacity: 0.35 + campGlow.value * 0.5 }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value * 0.4 }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.forestDark, T.forestMid, T.moss]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.arriveFlash, flashStyle]} pointerEvents="none" />

      {TREES.map((tr, i) => (
        <View key={`tree-${i}`} style={[styles.tree, { left: tr.left, height: tr.h }]}>
          <View style={styles.treeCanopy} />
          <View style={styles.treeTrunk} />
        </View>
      ))}

      {[0, 1, 2, 3, 4].map((i) => (
        <Animated.View
          key={`fly-${i}`}
          style={[
            styles.firefly,
            fireflyStyle,
            {
              left: `${15 + i * 16}%`,
              top: `${25 + (i % 3) * 18}%`,
            },
          ]}
        />
      ))}

      <View style={styles.mossFloor} />

      <View style={styles.startPost}>
        <Text style={styles.postLabel}>TRAIL START</Text>
        <Text style={styles.postEmoji}>🌲</Text>
      </View>

      <View style={styles.homeCamp}>
        <Animated.View style={[styles.campGlow, campStyle]} />
        <Text style={styles.campEmoji}>🏕️</Text>
        <Text style={styles.campLabel}>HOME</Text>
      </View>

      {variantLabel ? (
        <View style={styles.variantBadge}>
          <Text style={styles.variantText}>{variantLabel} PATH</Text>
        </View>
      ) : null}

      <View style={styles.footprints}>
        {['👣', '·', '👣', '·', '👣'].map((f, i) => (
          <Text key={`fp-${i}`} style={[styles.footprint, { opacity: 0.2 + (i % 2) * 0.15 }]}>
            {f}
          </Text>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  arriveFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.pathGlow,
  },
  tree: {
    position: 'absolute',
    bottom: '14%',
    width: 36,
    alignItems: 'center',
    opacity: 0.55,
  },
  treeCanopy: {
    width: 34,
    height: 28,
    borderRadius: 17,
    backgroundColor: '#14532D',
    marginBottom: -4,
  },
  treeTrunk: {
    width: 8,
    height: 16,
    backgroundColor: '#78350F',
    borderRadius: 2,
  },
  firefly: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.lantern,
    shadowColor: T.lantern,
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  mossFloor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '16%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(163,230,53,0.15)',
  },
  startPost: {
    position: 'absolute',
    right: '6%',
    top: '22%',
    width: '20%',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(163,230,53,0.35)',
    borderRadius: 10,
    backgroundColor: 'rgba(4,47,46,0.55)',
  },
  postLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: T.pathGlow,
  },
  postEmoji: { fontSize: 22, marginTop: 4 },
  homeCamp: {
    position: 'absolute',
    left: '5%',
    top: '24%',
    width: '22%',
    height: '38%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentAmber,
    borderRadius: 12,
    backgroundColor: 'rgba(4,47,46,0.5)',
    overflow: 'hidden',
  },
  campGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentAmber,
  },
  campEmoji: { fontSize: 30, zIndex: 2 },
  campLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accentAmber,
    zIndex: 2,
  },
  variantBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    left: '32%',
    right: '32%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(163,230,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(163,230,53,0.35)',
    alignItems: 'center',
  },
  variantText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.pathGlow,
  },
  footprints: {
    position: 'absolute',
    left: '25%',
    right: '25%',
    top: '58%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footprint: { fontSize: 12, color: T.pathGlow },
});
