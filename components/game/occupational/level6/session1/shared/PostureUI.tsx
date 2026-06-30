/**
 * Dedicated UI chrome for OT Level 6 Session 1 posture games
 */
import type { PostureGameTheme } from '@/components/game/occupational/level6/session1/superheroTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export function PostureHUD({ theme, round, totalRounds, score, coins }: {
  theme: PostureGameTheme; round: number; totalRounds: number; score: number; coins: number;
}) {
  const S = theme.shell;
  const pop = useSharedValue(1);
  useEffect(() => { pop.value = withSpring(1.2, {}, () => { pop.value = withSpring(1); }); }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <View style={styles.hud}>
      <Text style={[styles.academy, { color: S.subtitleColor }]}>{S.academyLabel}</Text>
      <Text style={[styles.title, { color: S.titleColor }]}>{theme.emoji} {theme.title}</Text>
      <Text style={[styles.subtitle, { color: S.subtitleColor }]}>{theme.subtitle}</Text>
      <View style={styles.statsRow}>
        <View style={[styles.pill, { borderColor: S.statBorder, backgroundColor: S.glassBg }]}>
          <Text style={[styles.lbl, { color: S.statLabel }]}>ROUND</Text>
          <Text style={[styles.val, { color: S.statValue }]}>{round}/{totalRounds}</Text>
        </View>
        <Animated.View style={[styles.pill, { borderColor: S.statBorder, backgroundColor: S.glassBg }, bump]}>
          <Text style={styles.star}>⭐</Text>
          <Text style={[styles.val, { color: S.statValue }]}>{score}</Text>
        </Animated.View>
        <View style={[styles.pill, { borderColor: S.statBorder, backgroundColor: S.glassBg }]}>
          <Text style={styles.coin}>🪙</Text>
          <Text style={[styles.val, { color: S.statValue }]}>{coins}</Text>
        </View>
      </View>
    </View>
  );
}

export function PostureIntroPanel({ theme, introText, errorText, cameraSupported, permissionGranted, hasCamera, onStart, onRetry, onGuided }: {
  theme: PostureGameTheme; introText?: string; errorText?: string;
  cameraSupported: boolean; permissionGranted: boolean; hasCamera: boolean;
  onStart: () => void; onRetry: () => void; onGuided: () => void;
}) {
  const S = theme.shell;
  const cardOp = useSharedValue(0);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 500 }); }, [cardOp]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value }));
  return (
    <Animated.View style={[styles.introCard, { backgroundColor: S.glassBg, borderColor: S.glassBorder }, cardAnim]}>
      <Text style={{ fontSize: 40 }}>{theme.emoji}</Text>
      <View style={styles.chips}>{theme.chips.map((c) => (
        <View key={c} style={[styles.chip, { borderColor: `${theme.accent}44` }]}><Text style={{ fontSize: 11, fontWeight: '700', color: S.subtitleColor }}>{c}</Text></View>
      ))}</View>
      {errorText ? (
        <>
          <Text style={styles.err}>{errorText}</Text>
          <View style={styles.btnRow}>
            <Pressable style={[styles.primary, { backgroundColor: theme.accent }]} onPress={onRetry}><Text style={styles.primaryTxt}>Retry Camera</Text></Pressable>
            <Pressable style={styles.secondary} onPress={onGuided}><Text style={styles.secondaryTxt}>Play Guided</Text></Pressable>
          </View>
        </>
      ) : !cameraSupported ? (
        <>
          <Text style={[styles.body, { color: S.subtitleColor }]}>{introText}</Text>
          <Pressable style={[styles.primary, { backgroundColor: theme.accent }]} onPress={onGuided}>
            <Text style={styles.primaryTxt}>{theme.hero} Play Guided Mode</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.body, { color: S.subtitleColor }]}>
            {introText ?? (!permissionGranted ? 'Tap Start — you will be asked to allow camera access.' : hasCamera ? 'Sit where the camera can see your head and shoulders.' : 'Loading body tracking…')}
          </Text>
          <Pressable style={[styles.primary, { backgroundColor: theme.accent }]} onPress={onStart}>
            <LinearGradient colors={[theme.accent, theme.accentDeep]} style={styles.primaryGrad}>
              <Text style={styles.primaryTxt}>{theme.startLabel}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onGuided}><Text style={[styles.link, { color: S.statLabel }]}>No camera? Play guided mode</Text></Pressable>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hud: { alignItems: 'center', marginTop: 4 },
  academy: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  lbl: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  val: { fontSize: 15, fontWeight: '900' },
  star: { fontSize: 14 }, coin: { fontSize: 14 },
  introCard: { borderRadius: 24, borderWidth: 1.5, padding: 20, alignItems: 'center', gap: 10, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  body: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  err: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10 },
  primary: { borderRadius: 18, overflow: 'hidden', width: '100%' },
  primaryGrad: { paddingVertical: 14, alignItems: 'center' },
  primaryTxt: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  secondary: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)' },
  secondaryTxt: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  link: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: 4 },
});
