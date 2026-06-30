import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GALLERY } from './theme';

const { width: W } = Dimensions.get('window');

export function GalleryBackground() {
  const beam = useSharedValue(0.3);

  useEffect(() => {
    beam.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [beam]);

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: beam.value,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[GALLERY.velvet, GALLERY.velvetLight, GALLERY.wallDark]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.spotlight, spotlightStyle]} />
      <View style={styles.frameDecorLeft} />
      <View style={styles.frameDecorRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  spotlight: {
    position: 'absolute',
    top: 0,
    left: W * 0.2,
    width: W * 0.6,
    height: '55%',
    backgroundColor: GALLERY.spotlight,
    borderBottomLeftRadius: W,
    borderBottomRightRadius: W,
  },
  frameDecorLeft: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    width: 40,
    height: 50,
    borderWidth: 3,
    borderColor: GALLERY.frameGold,
    opacity: 0.25,
  },
  frameDecorRight: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 32,
    height: 40,
    borderWidth: 3,
    borderColor: GALLERY.frameGold,
    opacity: 0.2,
  },
});
