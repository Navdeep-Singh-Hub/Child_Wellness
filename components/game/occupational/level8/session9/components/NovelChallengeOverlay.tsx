/**
 * NovelChallengeOverlay — shows a novel move card (or "?" surprise), teaser
 * hint, match progress and accuracy / flow meters over the camera.
 */
import type { NovelChallenge } from '@/components/game/occupational/level8/session9/novelChallenge';
import type { NovelGameTheme } from '@/components/game/occupational/level8/session9/novelTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  theme: NovelGameTheme;
  challenge: NovelChallenge | null;
  revealed: boolean;
  roundActive: boolean;
  matched: boolean;
  matchProgress: number;
  score: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

export const NovelChallengeOverlay: React.FC<Props> = ({
  theme,
  challenge,
  revealed,
  roundActive,
  matched,
  matchProgress,
  score,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const mysteryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  const accent = matched ? '#34D399' : theme.accent;
  const showMystery = theme.surpriseReveal && !revealed;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.cardWrap}>
        <View style={[styles.card, { borderColor: accent }]}>
          {showMystery ? (
            <Animated.View style={mysteryStyle}>
              <Text style={styles.mysteryIcon}>❓</Text>
              <Text style={styles.mysteryLabel}>SURPRISE MOVE</Text>
            </Animated.View>
          ) : challenge ? (
            <>
              <Text style={styles.cardLabel}>NOVEL MOVE</Text>
              <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.teaser}>{challenge.teaser}</Text>
            </>
          ) : null}
        </View>
      </View>

      {!!banner && (
        <View style={styles.bannerWrap}>
          <View
            style={[
              styles.banner,
              { borderColor: theme.accent, backgroundColor: roundActive ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)' },
            ]}
          >
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        </View>
      )}

      {matched && roundActive && (
        <View style={styles.matchWrap}>
          <Text style={styles.matchText}>✓ Novel move nailed!</Text>
        </View>
      )}

      <View style={styles.meterPanel}>
        <View style={styles.pipRow}>
          {Array.from({ length: totalRounds }, (_, i) => (
            <View
              key={i}
              style={[styles.pip, i < round ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]}
            />
          ))}
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>NOVEL</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.round(clamp01(matched ? Math.max(score, matchProgress) : score) * 100)}%`,
                  backgroundColor: matched ? '#34D399' : theme.accent,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>FLOW</Text>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${Math.round(clamp01(quality) * 100)}%`, backgroundColor: '#34D399' }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrap: { position: 'absolute', top: 10, alignSelf: 'center', width: '90%' },
  card: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  cardLabel: { color: '#FDE68A', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  mysteryIcon: { fontSize: 56, textAlign: 'center' },
  mysteryLabel: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  challengeIcon: { fontSize: 48, marginTop: 4 },
  challengeName: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 },
  teaser: { color: '#FEF3C7', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  bannerWrap: { position: 'absolute', top: '54%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  matchWrap: { position: 'absolute', top: '46%', alignSelf: 'center' },
  matchText: { color: '#34D399', fontSize: 20, fontWeight: '900' },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 48 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default NovelChallengeOverlay;
