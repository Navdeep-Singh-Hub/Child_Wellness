/**
 * Snack cave play area for Monster Munch (OT L4 S1 Game 2).
 */
import { MONSTER_MUNCH_THEME as T } from '@/components/game/occupational/level4/session1/monsterMunch/monsterMunchTheme';
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
  fullnessPct: number;
  munchKey: number;
  plateFood: string;
};

export const FeedMonsterPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  fullnessPct,
  munchKey,
  plateFood,
}) => {
  const mouthOpen = useSharedValue(0.35);
  const monsterBounce = useSharedValue(0);
  const glowPulse = useSharedValue(0.5);
  const arrowX = useSharedValue(0);
  const eyeWiggle = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    eyeWiggle.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 800 }),
        withTiming(-3, { duration: 800 }),
      ),
      -1,
      true,
    );
    mouthOpen.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, glowPulse, eyeWiggle, mouthOpen]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  useEffect(() => {
    if (!munchKey) return;
    mouthOpen.value = withSequence(
      withSpring(0.95, { damping: 8, stiffness: 280 }),
      withTiming(0.35, { duration: 400 }),
    );
    monsterBounce.value = withSequence(
      withSpring(-8, { damping: 6, stiffness: 200 }),
      withSpring(0, { damping: 10, stiffness: 160 }),
    );
  }, [munchKey, mouthOpen, monsterBounce]);

  const mushroomGlow = useAnimatedStyle(() => ({
    opacity: 0.35 + glowPulse.value * 0.45,
  }));

  const mouthStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.65 + mouthOpen.value * 0.75 }],
  }));

  const monsterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: monsterBounce.value }],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: eyeWiggle.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.92 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.caveDark, T.caveMid, T.caveFloor]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={`stal-${i}`}
          style={[
            styles.stalactite,
            {
              left: `${6 + i * 20}%`,
              height: 18 + (i % 3) * 10,
              opacity: 0.25 + (i % 2) * 0.1,
            },
          ]}
        />
      ))}

      <View style={styles.caveFloor} />

      {[0, 1, 2].map((i) => (
        <Animated.View
          key={`shroom-${i}`}
          style={[
            styles.mushroom,
            { left: `${12 + i * 28}%`, bottom: 14 + (i % 2) * 6 },
            mushroomGlow,
          ]}
        >
          <View style={styles.mushroomCap} />
          <View style={styles.mushroomStem} />
        </Animated.View>
      ))}

      <View style={styles.snackCounter}>
        <LinearGradient colors={['#B45309', T.plateWood, '#78350F']} style={styles.counterTop}>
          <Text style={styles.counterLabel}>SNACK BAR</Text>
          <View style={styles.plate}>
            <Text style={styles.plateFood}>{plateFood}</Text>
          </View>
        </LinearGradient>
        <View style={styles.counterLeg} />
        <View style={styles.counterLegRight} />
      </View>

      <View style={styles.crumbsPath}>
        {['·', '·', '·', '·', '·', '·'].map((c, i) => (
          <Text key={`crumb-${i}`} style={[styles.crumb, { opacity: 0.2 + (i % 3) * 0.15 }]}>
            {c}
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.monsterZone, monsterStyle]}>
        <View style={styles.hungerRow}>
          <Text style={styles.hungerLabel}>FULLNESS</Text>
          <View style={styles.hungerTrack}>
            <View style={[styles.hungerFill, { width: `${Math.min(100, fullnessPct)}%` }]} />
          </View>
        </View>

        <View style={styles.monsterHead}>
          <Animated.View style={[styles.eyeRow, eyeStyle]}>
            <View style={styles.eye}>
              <View style={styles.pupil} />
            </View>
            <View style={styles.eye}>
              <View style={[styles.pupil, { marginLeft: 2 }]} />
            </View>
          </Animated.View>
          <Animated.View style={[styles.mouth, mouthStyle]}>
            <View style={styles.toothRow}>
              <View style={styles.tooth} />
              <View style={styles.tooth} />
              <View style={styles.tooth} />
            </View>
            <View style={styles.tongue} />
          </Animated.View>
        </View>
        <View style={styles.monsterBody}>
          <Text style={styles.bellyEmoji}>👹</Text>
        </View>
        <Text style={styles.feedMe}>FEED ME!</Text>
      </Animated.View>

      <Animated.View style={[styles.feedArrow, arrowStyle]}>
        <Text style={styles.feedArrowText}>➜</Text>
        <Text style={styles.feedArrowHint}>Slide the snack</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  stalactite: {
    position: 'absolute',
    top: 0,
    width: 14,
    backgroundColor: 'rgba(167,139,250,0.35)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  caveFloor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(167,139,250,0.2)',
  },
  mushroom: {
    position: 'absolute',
    alignItems: 'center',
  },
  mushroomCap: {
    width: 22,
    height: 14,
    borderRadius: 11,
    backgroundColor: T.mushroom,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  mushroomStem: {
    width: 8,
    height: 10,
    backgroundColor: 'rgba(221,214,254,0.55)',
    borderRadius: 3,
    marginTop: -2,
  },
  snackCounter: {
    position: 'absolute',
    left: '5%',
    top: '28%',
    width: '24%',
    height: '48%',
    alignItems: 'center',
  },
  counterTop: {
    width: '100%',
    height: '72%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(252,211,77,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  counterLabel: {
    position: 'absolute',
    top: 8,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: T.snackGold,
  },
  plate: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  plateFood: { fontSize: 28 },
  counterLeg: {
    position: 'absolute',
    bottom: 0,
    left: '18%',
    width: 8,
    height: '28%',
    backgroundColor: '#78350F',
    borderRadius: 2,
  },
  counterLegRight: {
    position: 'absolute',
    bottom: 0,
    right: '18%',
    width: 8,
    height: '28%',
    backgroundColor: '#78350F',
    borderRadius: 2,
  },
  crumbsPath: {
    position: 'absolute',
    left: '32%',
    right: '32%',
    top: '52%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crumb: { fontSize: 22, color: T.snackGold, fontWeight: '900' },
  monsterZone: {
    position: 'absolute',
    right: '4%',
    top: '16%',
    width: '30%',
    height: '72%',
    alignItems: 'center',
  },
  hungerRow: {
    width: '100%',
    marginBottom: 6,
    alignItems: 'center',
  },
  hungerLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: T.accentPink,
    letterSpacing: 1,
    marginBottom: 3,
  },
  hungerTrack: {
    width: '90%',
    height: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  hungerFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: T.monsterGreen,
  },
  monsterHead: {
    width: '88%',
    aspectRatio: 1.1,
    backgroundColor: T.monsterBody,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(244,114,182,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    shadowColor: T.accentPink,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
  },
  eye: {
    width: 22,
    height: 26,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E1033',
  },
  pupil: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E1033',
  },
  mouth: {
    width: '72%',
    backgroundColor: '#1E1033',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T.accent,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  toothRow: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    gap: 6,
  },
  tooth: {
    width: 8,
    height: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tongue: {
    width: '60%',
    height: '40%',
    backgroundColor: T.accentPink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 2,
  },
  monsterBody: {
    marginTop: -6,
    width: '75%',
    height: 36,
    backgroundColor: '#5B21B6',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  bellyEmoji: { fontSize: 20, marginTop: -4 },
  feedMe: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '900',
    color: T.snackGold,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  feedArrow: {
    position: 'absolute',
    left: '30%',
    top: '46%',
    alignItems: 'center',
  },
  feedArrowText: {
    fontSize: 30,
    color: T.accentPink,
    fontWeight: '900',
  },
  feedArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(254,243,199,0.9)',
  },
});
