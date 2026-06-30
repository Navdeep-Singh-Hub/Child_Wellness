/** Touch The Part overlay — OT L9 S6 Game 2 */
import type { TouchThePartTheme } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import { BODY_AWARENESS_SHELL } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import type { ResistanceZoneStatus, TouchPartRound } from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
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
  theme: TouchThePartTheme;
  roundDef: TouchPartRound;
  touchPower: number;
  proximity: number;
  targetPower: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  glowProgress: number;
  glowing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  touchedCount: number;
  mapProgress: number;
  hand: { x: number; y: number } | null;
  target: { x: number; y: number } | null;
  correctHand: boolean;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function TouchPartOverlay({
  theme,
  roundDef,
  touchPower,
  proximity,
  targetPower,
  zoneStatus,
  holdProgress,
  glowProgress,
  glowing,
  previewing,
  roundActive,
  round,
  totalRounds,
  touchedCount,
  mapProgress,
  hand,
  target,
  correctHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const glowRing = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive && proximity >= 0.45) {
      glowRing.value = withRepeat(
        withSequence(withTiming(1, { duration: 240 }), withTiming(0.3, { duration: 240 })),
        -1,
        false,
      );
    } else {
      glowRing.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, proximity, glowRing]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + pulse.value * 0.4,
  }));

  const targetGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glowRing.value * 0.55,
    transform: [{ scale: 1 + glowRing.value * 0.25 }],
  }));

  const powerPct = Math.round(touchPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const proxPct = Math.round(proximity * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`lab-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {target && (
        <Animated.View
          style={[
            styles.targetRing,
            targetGlowStyle,
            { left: `${target.x * 100}%`, top: `${target.y * 100}%`, borderColor: theme.glowPart },
          ]}
        >
          <Text style={styles.targetEmoji}>{roundDef.icon}</Text>
        </Animated.View>
      )}

      {hand && (
        <View
          style={[
            styles.handDot,
            {
              left: `${hand.x * 100}%`,
              top: `${hand.y * 100}%`,
              borderColor: correctHand ? BODY_AWARENESS_SHELL.good : BODY_AWARENESS_SHELL.warn,
            },
          ]}
        >
          <Text style={styles.handLabel}>✋</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          TOUCH {powerPct}% · TARGET {targetPct}% · NEAR {proxPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? BODY_AWARENESS_SHELL.good : zoneStatus === 'heavy' ? BODY_AWARENESS_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? BODY_AWARENESS_SHELL.good : theme.glowPart }]}>
            {inZone ? 'TOUCHING' : zoneStatus === 'heavy' ? 'TOO FIRM' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Part {round + 1}/{totalRounds}
          </Text>
        </View>
        <Text style={styles.partLabel}>
          {roundDef.label}
          {roundDef.crossBody ? ' · CROSS BODY' : ''}
        </Text>
      </View>

      <View style={styles.targetsRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.targetDot, { opacity: i < touchedCount ? 1 : 0.25 }]}>
            {i < touchedCount ? theme.targets[i % theme.targets.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.mapWrap}>
        <Text style={styles.mapLabel}>🗺️ BODY MAP {Math.round(mapProgress * 100)}%</Text>
        <View style={styles.mapBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.mapFill, { width: `${mapProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.touchCard}>
          <Text style={styles.touchEmoji}>{roundDef.icon}</Text>
          <Text style={styles.touchName}>{roundDef.name}</Text>
          <Text style={styles.handHint}>
            {roundDef.hand === 'left' ? 'LEFT HAND' : roundDef.hand === 'right' ? 'RIGHT HAND' : 'EITHER HAND'}
          </Text>
          {roundActive && inZone && !glowing && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>Touch {roundDef.label}</Text>
          <Text style={styles.previewHand}>
            {roundDef.hand === 'left' ? 'Use LEFT hand' : roundDef.hand === 'right' ? 'Use RIGHT hand' : 'Use either hand'}
          </Text>
        </View>
      )}

      {glowing && (
        <Text style={styles.glowText}>GLOWING {Math.round(glowProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? BODY_AWARENESS_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  targetRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    marginLeft: -27,
    marginTop: -27,
    borderRadius: 27,
    borderWidth: 3,
    backgroundColor: 'rgba(249,168,212,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetEmoji: { fontSize: 24 },
  handDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  handLabel: { fontSize: 12 },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  hudTitle: { color: '#EDE9FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: BODY_AWARENESS_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#C4B5FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: BODY_AWARENESS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  partLabel: { color: '#F9A8D4', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 0.6 },
  targetsRow: {
    position: 'absolute',
    top: 112,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,27,75,0.55)',
    borderRadius: 16,
  },
  targetDot: { fontSize: 14 },
  mapWrap: { position: 'absolute', top: '20%', left: 14, right: 14 },
  mapLabel: { color: '#C4B5FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  mapBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  mapFill: { height: '100%', borderRadius: 4 },
  touchCard: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  touchEmoji: { fontSize: 56 },
  touchName: { color: '#EDE9FE', fontSize: 14, fontWeight: '900', marginTop: 6 },
  handHint: { color: '#F9A8D4', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  holdRing: {
    marginTop: 12,
    width: 110,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: BODY_AWARENESS_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#EDE9FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewHand: { color: '#F9A8D4', fontSize: 12, fontWeight: '900', marginTop: 4 },
  glowText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: BODY_AWARENESS_SHELL.gold,
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
