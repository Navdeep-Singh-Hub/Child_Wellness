import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated as RNAnimated, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { speak } from '@/utils/tts';
import { HUB_S10 } from './theme';

interface Level1CompleteCelebrationProps {
  onDone: () => void;
}

export function Level1CompleteCelebration({ onDone }: Level1CompleteCelebrationProps) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const starsAnim = useRef(new RNAnimated.Value(0)).current;
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduceMotionRef.current = !!v;
      speak('Level one complete! You have mastered capital letter writing!', 0.72);
      if (v) {
        scaleAnim.setValue(1);
        fadeAnim.setValue(1);
        starsAnim.setValue(1);
      } else {
        RNAnimated.parallel([
          RNAnimated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
          RNAnimated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start(() => {
          RNAnimated.spring(starsAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
        });
      }
    }).catch(() => {});
  }, [scaleAnim, fadeAnim, starsAnim]);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: HUB_S10.bgTop }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,191,36,0.15)' }]} />
      </View>
      <ConfettiEffect />
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <RNAnimated.View style={[styles.trophyWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.trophy}>🏆</Text>
          </RNAnimated.View>

          <RNAnimated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Level 1 Complete!</Text>
            <Text style={styles.subtitle}>You have mastered capital letter writing!</Text>
          </RNAnimated.View>

          <RNAnimated.View style={[styles.starsRow, { transform: [{ scale: starsAnim }] }]}>
            {['🌟', '⭐', '👑', '⭐', '🌟'].map((s, i) => (
              <Text key={i} style={styles.star}>{s}</Text>
            ))}
          </RNAnimated.View>

          <RNAnimated.View style={[styles.badgeBox, { opacity: fadeAnim }]}>
            <Text style={styles.badgeEmoji}>👑</Text>
            <Text style={styles.badgeTitle}>Writing Master</Text>
            <Text style={styles.badgeSub}>From scribbles to full A–Z — amazing journey!</Text>
          </RNAnimated.View>

          <Pressable onPress={onDone} style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}>
            <Text style={styles.doneBtnText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  trophyWrap: { marginBottom: 16 },
  trophy: { fontSize: 90 },
  title: { fontSize: 32, fontWeight: '900', color: HUB_S10.textLight, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 17, fontWeight: '600', color: HUB_S10.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  star: { fontSize: 36 },
  badgeBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUB_S10.accent,
    marginBottom: 28,
    width: '100%',
    maxWidth: 340,
  },
  badgeEmoji: { fontSize: 44, marginBottom: 8 },
  badgeTitle: { fontSize: 22, fontWeight: '900', color: HUB_S10.accent, marginBottom: 4 },
  badgeSub: { fontSize: 14, color: HUB_S10.textMuted, textAlign: 'center', lineHeight: 20 },
  doneBtn: { backgroundColor: HUB_S10.accent, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20 },
  doneBtnText: { color: HUB_S10.bgTop, fontSize: 20, fontWeight: '900' },
  pressed: { opacity: 0.9 },
});
