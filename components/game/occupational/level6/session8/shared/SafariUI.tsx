/**
 * Dedicated UI chrome for OT Level 6 Session 8 animal-walk games
 */
import type { AnimalGameTheme } from '@/components/game/occupational/level6/session8/safariTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export function SafariHUD({ theme, stepIndex, totalSteps, coins }: {
  theme: AnimalGameTheme; stepIndex: number; totalSteps: number; coins: number;
}) {
  const S = theme.shell;
  const pop = useSharedValue(1);
  const prev = useRef(coins);
  useEffect(() => { if (coins > prev.current) pop.value = withSpring(1.2, {}, () => { pop.value = withSpring(1); }); prev.current = coins; }, [coins, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <View style={styles.hud}>
      <Text style={[styles.realm, { color: S.subtitleColor }]}>{S.realmLabel}</Text>
      <Text style={[styles.title, { color: S.titleColor }]}>{theme.emoji} {theme.title}</Text>
      <Text style={[styles.subtitle, { color: S.subtitleColor }]}>{theme.subtitle}</Text>
      <View style={styles.statsRow}>
        <View style={[styles.pill, { borderColor: S.statBorder, backgroundColor: S.glassBg }]}>
          <Text style={[styles.lbl, { color: S.statLabel }]}>TRAIL</Text>
          <Text style={[styles.val, { color: S.statValue }]}>{stepIndex}/{totalSteps}</Text>
        </View>
        <Animated.View style={[styles.pill, { borderColor: S.statBorder, backgroundColor: S.glassBg }, bump]}>
          <Text style={styles.coin}>{theme.collectible}</Text>
          <Text style={[styles.val, { color: S.statValue }]}>{coins}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

export function SafariIntroPanel({ theme, introText, errorText, cameraSupported, hasCamera, onStart, onRetry, onGuided }: {
  theme: AnimalGameTheme; introText?: string; errorText?: string;
  cameraSupported: boolean; hasCamera: boolean;
  onStart: () => void; onRetry: () => void; onGuided: () => void;
}) {
  const S = theme.shell;
  const cardOp = useSharedValue(0);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 500 }); }, [cardOp]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value }));
  const defaultIntro = cameraSupported
    ? hasCamera ? 'Stand back so the camera sees your whole body — clear some floor space to move!' : 'Starting camera…'
    : 'Guided mode: follow the coach and do your animal walk!';
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
      ) : (
        <>
          <Text style={[styles.body, { color: S.subtitleColor }]}>{introText ?? defaultIntro}</Text>
          <Pressable style={[styles.primary, { opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]} disabled={cameraSupported && !hasCamera} onPress={onStart}>
            <LinearGradient colors={[theme.accent, theme.accentDeep]} style={styles.primaryGrad}>
              <Text style={styles.primaryTxt}>{theme.startLabel}</Text>
            </LinearGradient>
          </Pressable>
          {cameraSupported && (
            <Pressable onPress={onGuided}><Text style={[styles.link, { color: S.statLabel }]}>No camera? Play guided mode</Text></Pressable>
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hud: { alignItems: 'center', marginTop: 4 },
  realm: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 22, fontWeight: '900', marginTop: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  lbl: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  val: { fontSize: 15, fontWeight: '900' },
  coin: { fontSize: 14 },
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
