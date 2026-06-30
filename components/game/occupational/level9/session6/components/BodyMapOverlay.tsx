/** Body Map overlay — OT L9 S6 Game 3 */
import type { BodyMapTheme } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import { BODY_AWARENESS_SHELL } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import type { BodyMapZoneRound, ResistanceZoneStatus } from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
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
  theme: BodyMapTheme;
  roundDef: BodyMapZoneRound;
  mapPower: number;
  zoneActivation: number;
  targetPower: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  illuminateProgress: number;
  illuminating: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  mappedCount: number;
  atlasProgress: number;
  banner: string;
  quality: number;
  bandHalf: number;
};

const ZONE_SLOTS = [12, 24, 36, 48, 58, 68, 78, 88];

export function BodyMapOverlay({
  theme,
  roundDef,
  mapPower,
  zoneActivation,
  targetPower,
  zoneStatus,
  holdProgress,
  illuminateProgress,
  illuminating,
  previewing,
  roundActive,
  round,
  totalRounds,
  mappedCount,
  atlasProgress,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const scanBeam = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1020, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1020, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive) {
      scanBeam.value = withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.2, { duration: 280 })),
        -1,
        false,
      );
    } else {
      scanBeam.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, scanBeam]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.38,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scanBeam.value * 0.55,
  }));

  const powerPct = Math.round(mapPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const zonePct = Math.round(zoneActivation * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;
  const activeY = ZONE_SLOTS[roundDef.mapSlot] ?? 50;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`atlas-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          MAP {powerPct}% · TARGET {targetPct}% · ZONE {zonePct}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? BODY_AWARENESS_SHELL.good : theme.zone }]}>
            {inZone ? 'MAPPING' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Zone {round + 1}/{totalRounds}
          </Text>
        </View>
        <Text style={styles.zoneLabel}>{roundDef.label}</Text>
      </View>

      <View style={styles.zonesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.zoneDot, { opacity: i < mappedCount ? 1 : 0.25 }]}>
            {i < mappedCount ? theme.zones[i % theme.zones.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.atlasWrap}>
        <Text style={styles.atlasLabel}>🧠 ATLAS {Math.round(atlasProgress * 100)}%</Text>
        <View style={styles.atlasBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.atlasFill, { width: `${atlasProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.silhouetteWrap}>
          <View style={styles.silhouette}>
            <Text style={styles.silhouetteHead}>🙂</Text>
            <View style={styles.silhouetteTorso} />
            <View style={styles.silhouetteLegs} />
            {ZONE_SLOTS.map((y, i) => (
              <View
                key={i}
                style={[
                  styles.mapZone,
                  {
                    top: `${y}%`,
                    backgroundColor:
                      i < mappedCount
                        ? 'rgba(52,211,153,0.55)'
                        : i === roundDef.mapSlot
                          ? 'rgba(56,189,248,0.45)'
                          : 'rgba(255,255,255,0.08)',
                    borderColor: i === roundDef.mapSlot ? theme.zone : 'rgba(255,255,255,0.15)',
                  },
                ]}
              />
            ))}
            <Animated.View style={[styles.scanLine, scanStyle, { top: `${activeY}%` }]} />
          </View>
          <View style={styles.zoneCard}>
            <Text style={styles.zoneEmoji}>{roundDef.icon}</Text>
            <Text style={styles.zoneName}>{roundDef.name}</Text>
            {roundActive && inZone && !illuminating && (
              <View style={styles.holdRing}>
                <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
              </View>
            )}
          </View>
        </View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewZone}>Mapping effort {targetPct}%</Text>
        </View>
      )}

      {illuminating && (
        <Text style={styles.illuminateText}>ILLUMINATING {Math.round(illuminateProgress * 100)}%</Text>
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
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  hudTitle: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#7DD3FC', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: BODY_AWARENESS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  zoneLabel: { color: '#7DD3FC', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 0.6 },
  zonesRow: {
    position: 'absolute',
    top: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,25,41,0.55)',
    borderRadius: 16,
  },
  zoneDot: { fontSize: 14 },
  atlasWrap: { position: 'absolute', top: '20%', left: 14, right: 14 },
  atlasLabel: { color: '#7DD3FC', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  atlasBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  atlasFill: { height: '100%', borderRadius: 4 },
  silhouetteWrap: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  silhouette: {
    width: 72,
    height: 168,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(125,211,252,0.45)',
    backgroundColor: 'rgba(12,74,110,0.45)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  silhouetteHead: { fontSize: 22, marginTop: 10 },
  silhouetteTorso: {
    width: 28,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.35)',
    marginTop: 4,
  },
  silhouetteLegs: {
    width: 34,
    height: 52,
    borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.25)',
    marginTop: 4,
  },
  mapZone: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#38BDF8',
  },
  zoneCard: { alignItems: 'center', minWidth: 110 },
  zoneEmoji: { fontSize: 48 },
  zoneName: { color: '#E0F2FE', fontSize: 13, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  holdRing: {
    marginTop: 10,
    width: 100,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: BODY_AWARENESS_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#E0F2FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewZone: { color: '#7DD3FC', fontSize: 12, fontWeight: '900', marginTop: 4 },
  illuminateText: {
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
