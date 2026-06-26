/**
 * Public marketing landing — unauthenticated homepage
 */
import LoginButton from '@/app/comonents/login';
import { HomeAmbientBackground } from '@/components/home/HomeAmbientBackground';
import { HOME_COLORS, HOME_GRADIENTS, HOME_SHADOW, HOME_TYPE } from '@/constants/homeDesign';
import { images } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'grid' as const,
    title: 'AAC Grid',
    description: 'Visual symbols that grow with your child’s voice',
    gradient: ['#E0F2FE', '#BAE6FD'] as [string, string],
    accent: '#0284C7',
    delay: 100,
  },
  {
    icon: 'game-controller' as const,
    title: 'Therapy Games',
    description: 'Camera-guided activities for real skill building',
    gradient: ['#EDE9FE', '#DDD6FE'] as [string, string],
    accent: '#7C3AED',
    delay: 180,
  },
  {
    icon: 'trending-up' as const,
    title: 'Progress',
    description: 'See growth across sessions, levels, and skills',
    gradient: ['#D1FAE5', '#A7F3D0'] as [string, string],
    accent: '#059669',
    delay: 260,
  },
  {
    icon: 'flame' as const,
    title: 'Daily Streaks',
    description: 'Gentle motivation through consistent practice',
    gradient: ['#FFEDD5', '#FED7AA'] as [string, string],
    accent: '#EA580C',
    delay: 340,
  },
];

export function HomePublicLanding() {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <SafeAreaView style={styles.root}>
      <HomeAmbientBackground />
      <Animated.View style={[styles.header, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <View style={styles.brand}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.logoWrap}>
            <Image source={images.logo} style={styles.logo} />
          </LinearGradient>
          <View>
            <Text style={styles.brandName}>Child Wellness</Text>
            <Text style={styles.brandTag}>Play · Learn · Grow</Text>
          </View>
        </View>
        <LoginButton />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }] }}>
          <Text style={styles.heroTitle}>
            Your child&apos;s wellness journey, beautifully guided
          </Text>
          <Text style={styles.heroSub}>
            AAC communication, occupational therapy games, and progress tracking — designed for calm, focused learning.
          </Text>
        </Animated.View>

        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <FeatureTile key={f.title} {...f} />
          ))}
        </View>

        <Animated.View style={{ opacity: fade }}>
          <LinearGradient colors={[...HOME_GRADIENTS.ctaPublic]} style={[styles.cta, HOME_SHADOW.glow('#7C3AED')]}>
            <View style={styles.ctaIcon}>
              <Ionicons name="sparkles" size={30} color="#FFF" />
            </View>
            <Text style={styles.ctaTitle}>Begin your journey</Text>
            <Text style={styles.ctaSub}>
              Join families building communication, movement, and confidence — one session at a time.
            </Text>
            <View style={styles.ctaBtn}>
              <LoginButton />
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureTile({
  icon,
  title,
  description,
  gradient,
  accent,
  delay,
}: (typeof FEATURES)[number]) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 650,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, enter]);

  return (
    <Animated.View
      style={{
        width: (width - 52) / 2,
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      <Pressable style={styles.featurePress}>
        <LinearGradient colors={gradient} style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: `${accent}18` }]}>
            <Ionicons name={icon} size={28} color={accent} />
          </View>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDesc}>{description}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HOME_COLORS.mesh1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...HOME_SHADOW.soft,
  },
  logo: { width: 32, height: 32 },
  brandName: { fontSize: 18, fontWeight: '900', color: HOME_COLORS.ink, letterSpacing: -0.3 },
  brandTag: { fontSize: 12, fontWeight: '700', color: HOME_COLORS.inkMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  heroTitle: {
    ...HOME_TYPE.display,
    fontSize: width < 380 ? 30 : 36,
    color: HOME_COLORS.ink,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 14,
    lineHeight: width < 380 ? 36 : 42,
  },
  heroSub: {
    ...HOME_TYPE.body,
    color: HOME_COLORS.inkMuted,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 28 },
  featurePress: { borderRadius: 24, overflow: 'hidden', ...HOME_SHADOW.soft },
  featureCard: { padding: 18, minHeight: 168, borderRadius: 24 },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: { fontSize: 17, fontWeight: '800', color: HOME_COLORS.ink, marginBottom: 6 },
  featureDesc: { fontSize: 13, color: HOME_COLORS.inkMuted, lineHeight: 19, fontWeight: '600' },
  cta: { borderRadius: 32, padding: 28, alignItems: 'center' },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 10, letterSpacing: -0.5 },
  ctaSub: { fontSize: 15, color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  ctaBtn: { width: '100%', alignItems: 'center' },
});
