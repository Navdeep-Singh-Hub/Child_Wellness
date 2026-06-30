/** Multi-Object Tracking visuals — OT L5 Session 8 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { MultiTrackBackdropId } from '@/components/game/occupational/level5/session8/multiTrackThemes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function MultiTrackBackdrop({ theme, backdrop }: { theme: Session2ThemeTokens; backdrop: MultiTrackBackdropId }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'radar' && <RadarGrid accent={theme.accent} />}
      {backdrop === 'duel' && <DuelArena accent={theme.accent} />}
      {backdrop === 'storm' && <StormField accent={theme.accent} />}
      {backdrop === 'focus' && <FocusGrid accent={theme.accent} />}
      {backdrop === 'sequence' && <SequenceStage accent={theme.accent} />}
    </View>
  );
}

function RadarGrid({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.radarRing, { borderColor: `${accent}44` }]} />
      <View style={[styles.radarRing, { width: '55%', height: '55%', borderColor: `${accent}33` }]} />
      <View style={[styles.radarSweep, { backgroundColor: `${accent}22` }]} />
    </>
  );
}

function DuelArena({ accent }: { accent: string }) {
  return (
    <>
      <View style={styles.duelLine} />
      <View style={[styles.duelCorner, { top: '20%', left: '15%', borderColor: accent }]} />
      <View style={[styles.duelCorner, { bottom: '20%', right: '15%', borderColor: accent }]} />
    </>
  );
}

function StormField({ accent }: { accent: string }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.windStreak, { top: `${15 + i * 12}%`, opacity: 0.1 + (i % 2) * 0.08, backgroundColor: accent }]} />
      ))}
    </>
  );
}

function FocusGrid({ accent }: { accent: string }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={[styles.gridDot, { left: `${(i % 4) * 25 + 12}%`, top: `${Math.floor(i / 4) * 22 + 18}%`, borderColor: `${accent}33` }]} />
      ))}
    </>
  );
}

function SequenceStage({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.seqLane, { top: '28%', borderColor: `${accent}55` }]} />
      <View style={[styles.seqLane, { top: '62%', borderColor: `${accent}33` }]} />
    </>
  );
}

export type TargetZoneLayout = {
  upper: { x: number; y: number; size: number };
  lower: { x: number; y: number; size: number };
};

export function TargetZoneBoxes({ zones, accent }: { zones: TargetZoneLayout; accent: string }) {
  return (
    <>
      {(['upper', 'lower'] as const).map((key) => {
        const zone = zones[key];
        const half = zone.size / 2;
        return (
          <View
            key={key}
            pointerEvents="none"
            style={[
              styles.targetZone,
              {
                left: zone.x - half,
                top: zone.y - half,
                width: zone.size,
                height: zone.size,
                borderColor: accent,
                backgroundColor: `${accent}18`,
              },
            ]}
          />
        );
      })}
    </>
  );
}

export function isObjectInTargetZone(
  objX: number,
  objY: number,
  zones: TargetZoneLayout,
  objectSize: number,
): boolean {
  const pad = objectSize * 0.15;
  for (const key of ['upper', 'lower'] as const) {
    const zone = zones[key];
    const half = zone.size / 2;
    if (
      objX >= zone.x - half + pad &&
      objX <= zone.x + half - pad &&
      objY >= zone.y - half + pad &&
      objY <= zone.y + half - pad
    ) {
      return true;
    }
  }
  return false;
}

export function buildTargetZones(width: number, height: number, zoneSize = 92): TargetZoneLayout {
  return {
    upper: { x: width * 0.5, y: height * 0.28, size: zoneSize },
    lower: { x: width * 0.5, y: height * 0.72, size: zoneSize },
  };
}

export function TrackOrb({
  size,
  color,
  emoji,
  scale = 1,
  dimmed,
  pulse,
}: {
  size: number;
  color: string;
  emoji: string;
  scale?: number;
  dimmed?: boolean;
  pulse?: boolean;
}) {
  const breathe = useSharedValue(1);
  useEffect(() => {
    if (pulse) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
  }, [pulse, breathe]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value * scale }] }));

  return (
    <Animated.View
      style={[
        styles.orb,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: dimmed ? 0.7 : 1, shadowColor: color },
        anim,
      ]}
    >
      <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  radarRing: { position: 'absolute', alignSelf: 'center', top: '18%', width: '75%', aspectRatio: 1, borderRadius: 9999, borderWidth: 2 },
  radarSweep: { position: 'absolute', alignSelf: 'center', top: '18%', width: '38%', aspectRatio: 1, borderTopRightRadius: 9999 },
  duelLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  duelCorner: { position: 'absolute', width: 40, height: 40, borderWidth: 2, borderRadius: 8 },
  windStreak: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2 },
  gridDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.06)' },
  seqLane: { position: 'absolute', left: '8%', right: '8%', height: 3, borderRadius: 2, borderWidth: 1, borderStyle: 'dashed' },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  targetZone: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 10,
    borderStyle: 'dashed',
    zIndex: 1,
  },
});
