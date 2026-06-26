import { HOME_COLORS, HOME_SHADOW, HOME_TYPE, getTimeGreeting } from '@/constants/homeDesign';
import { images } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from './GlassSurface';

type Props = {
  firstName?: string | null;
  levelLabel?: string;
  onLogoPress: () => void;
  scrollY: Animated.Value;
};

export function HomeGreetingHeader({ firstName, levelLabel, onLogoPress, scrollY }: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const { headline, subline } = getTimeGreeting(firstName);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const opacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: 'clamp' });
  const translateY = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, -24], extrapolate: 'clamp' });

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
      <Animated.View
        style={{
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
            },
          ],
        }}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            <Pressable
              onPress={onLogoPress}
              style={({ pressed }) => [styles.logoBtn, pressed && { transform: [{ scale: 0.96 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Child Wellness logo"
            >
              <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.logoGradient}>
                <Image source={images.logo} style={styles.logo} />
              </LinearGradient>
            </Pressable>
            <View style={styles.copy}>
              <Text style={styles.headline}>{headline}</Text>
              <Text style={styles.subline}>{subline}</Text>
            </View>
          </View>
          {levelLabel ? (
            <GlassSurface style={styles.badge} glow={HOME_COLORS.amber}>
              <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={StyleSheet.absoluteFill} />
              <View style={styles.badgeInner}>
                <Ionicons name="trophy" size={16} color={HOME_COLORS.amberDeep} />
                <Text style={styles.badgeText}>{levelLabel}</Text>
              </View>
            </GlassSurface>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoBtn: { ...HOME_SHADOW.soft },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
  },
  logo: { width: 34, height: 34, resizeMode: 'contain' },
  copy: { flex: 1 },
  headline: { ...HOME_TYPE.display, color: HOME_COLORS.ink, fontSize: 28 },
  subline: { ...HOME_TYPE.caption, color: HOME_COLORS.inkMuted, marginTop: 6 },
  badge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, minWidth: 108 },
  badgeInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#92400E' },
});
