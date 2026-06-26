/** Volcano Push overlay — OT L9 S5 Game 4 */
import type { VolcanoPushTheme } from '@/components/game/occupational/level9/session5/resistanceTheme';
import { RESISTANCE_SHELL } from '@/components/game/occupational/level9/session5/resistanceTheme';
import type { ResistanceZoneStatus } from '@/components/game/occupational/level9/session5/resistanceUtils';
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
  theme: VolcanoPushTheme;
  push: number;
  form: number;
  targetPush: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  containProgress: number;
  containing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  containedCount: number;
  craterProgress: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function VolcanoPushOverlay({
  theme,
  push,
  form,
  targetPush,
  zoneStatus,
  holdProgress,
  containProgress,
  containing,
  previewing,
  roundActive,
  round,
  totalRounds,
  containedCount,
  craterProgress,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const ember = useSharedValue(0);
  const ventPress = useSharedValue(0);
  const lavaBurst = useSharedValue(0);

  useEffect(() => {
    ember.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [ember]);

  useEffect(() => {
    const ratio = Math.min(1, push / Math.max(0.35, targetPush));
    ventPress.value = withTiming(containing ? 1 : ratio * 0.55, { duration: containing ? 560 : 220 });
  }, [push, targetPush, containing, ventPress]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      lavaBurst.value = withRepeat(
        withSequence(withTiming(1, { duration: 200 }), withTiming(0.2, { duration: 200 })),
        -1,
        false,
      );
    } else {
      lavaBurst.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, lavaBurst]);

  const emberStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + ember.value * 0.38,
  }));

  const ventStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ventPress.value * 10 }, { scale: containing ? 0.92 - containProgress * 0.08 : 1 }],
  }));

  const lavaStyle = useAnimatedStyle(() => ({
    opacity: lavaBurst.value,
    transform: [{ scaleY: 0.5 + lavaBurst.value * 0.7 }],
  }));

  const pushPct = Math.round(push * 100);
  const targetPct = Math.round(targetPush * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPush - bandHalf;
  const high = targetPush + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`crater-${i}`}
          style={[styles.decor, emberStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftPalm && (
        <View style={[styles.palmDot, { left: `${leftPalm.x * 100}%`, top: `${leftPalm.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.palmLabel}>L</Text>
        </View>
      )}
      {rightPalm && (
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.lava }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          VENT {pushPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, pushPct)}%`,
                backgroundColor: inZone ? RESISTANCE_SHELL.good : zoneStatus === 'heavy' ? RESISTANCE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? RESISTANCE_SHELL.good : theme.lava }]}>
            {inZone ? 'PRESSING' : zoneStatus === 'heavy' ? 'TOO HOT' : 'TOO LOW'}
          </Text>
          <Text style={styles.roundText}>
            Vent {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.ventRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.ventDot, { opacity: i < containedCount ? 1 : 0.25 }]}>
            {i < containedCount ? theme.vents[i % theme.vents.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.craterWrap}>
        <Text style={styles.craterLabel}>🌋 CRATER {Math.round(craterProgress * 100)}%</Text>
        <View style={styles.craterBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.craterFill, { width: `${craterProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.volcanoWrap, ventStyle]}>
          <Text style={styles.volcanoEmoji}>{theme.emoji}</Text>
          <Animated.Text style={[styles.lavaEmoji, lavaStyle]}>🔥💨</Animated.Text>
          <Text style={styles.ventEmoji}>{theme.vents[round % theme.vents.length]}</Text>
          <Text style={styles.pushLabel}>PUSH DOWN</Text>
          {roundActive && inZone && !containing && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>🌋</Text>
          <Text style={styles.previewText}>Vent pressure {targetPct}%</Text>
        </View>
      )}

      {containing && (
        <Text style={styles.containText}>CONTAINING {Math.round(containProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? RESISTANCE_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  palmDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    borderRadius: 13,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#C2410C' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  hudTitle: { color: '#FFEDD5', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 8,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 5 },
  zoneBand: {
    position: 'absolute',
    top: -2,
    height: 14,
    backgroundColor: 'rgba(52,211,153,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  targetTick: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 16,
    marginLeft: -1,
    backgroundColor: RESISTANCE_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FDBA74', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: RESISTANCE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  ventRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(28,25,23,0.55)',
    borderRadius: 16,
  },
  ventDot: { fontSize: 14 },
  craterWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  craterLabel: { color: '#FDBA74', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  craterBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  craterFill: { height: '100%', borderRadius: 4 },
  volcanoWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  volcanoEmoji: { fontSize: 58 },
  lavaEmoji: { fontSize: 26, marginTop: 4 },
  ventEmoji: { fontSize: 24, marginTop: 4 },
  pushLabel: { color: '#FDBA74', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 6 },
  holdRing: {
    marginTop: 10,
    width: 110,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: RESISTANCE_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FDBA74', fontSize: 14, fontWeight: '800', marginTop: 8 },
  containText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: RESISTANCE_SHELL.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    bottom: '22%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
