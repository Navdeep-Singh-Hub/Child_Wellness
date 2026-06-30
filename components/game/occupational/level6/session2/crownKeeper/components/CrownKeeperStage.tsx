import { CROWN_KEEPER_THEME } from '@/components/game/occupational/level6/session2/crownKeeper/crownKeeperTheme';
import { CrownOverlay } from '@/components/game/occupational/level6/session1/components/CrownOverlay';
import { VisionTrackingView } from 'child-wellness-vision';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = {
  active: boolean;
  tracking: boolean;
  present: boolean;
  stability: number;
  safePct: number;
  coachCue: string;
  crownFallFlash: boolean;
  children?: React.ReactNode;
};

export const CrownKeeperStage: React.FC<Props> = ({
  active,
  tracking,
  present,
  stability,
  safePct,
  coachCue,
  crownFallFlash,
  children,
}) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.35,
    borderColor: present ? CROWN_KEEPER_THEME.good : CROWN_KEEPER_THEME.warn,
  }));

  return (
    <View style={styles.stage}>
      {Platform.OS === 'android' && tracking ? (
        <VisionTrackingView active={active} style={styles.previewFill} />
      ) : (
        <LinearGradient colors={['#1E1B4B', '#4C1D95', '#312E81']} style={styles.previewFill}>
          <Text style={styles.placeholderHero}>{CROWN_KEEPER_THEME.hero}</Text>
          <Text style={styles.placeholderText}>
            {Platform.OS === 'web' ? 'Web face tracking active' : 'Rebuild dev client for native tracking'}
          </Text>
        </LinearGradient>
      )}

      {crownFallFlash && <View style={styles.fallFlash} pointerEvents="none" />}

      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

      <View pointerEvents="box-none" style={styles.overlay}>
        <CrownOverlay stability={stability} safePct={safePct} />
        {children}
      </View>

      <View style={styles.statusRow} pointerEvents="none">
        <View
          style={[
            styles.statusPill,
            { backgroundColor: present ? 'rgba(52,211,153,0.92)' : 'rgba(251,113,133,0.92)' },
          ]}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{present ? 'Head tracked' : 'Face the camera'}</Text>
        </View>
      </View>

      {!!coachCue && (
        <View style={styles.cueWrap} pointerEvents="none">
          <Text style={styles.cueText}>{coachCue}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: CROWN_KEEPER_THEME.stageBorder,
    backgroundColor: CROWN_KEEPER_THEME.stageBg,
    position: 'relative',
  },
  previewFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  placeholderHero: { fontSize: 90 },
  placeholderText: { color: '#C4B5FD', fontSize: 14, fontWeight: '800', marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
  fallFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(239,68,68,0.35)' },
  glow: { ...StyleSheet.absoluteFillObject, borderRadius: 28, borderWidth: 4 },
  overlay: { ...StyleSheet.absoluteFillObject },
  statusRow: { position: 'absolute', top: 12, right: 12 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '88%',
    backgroundColor: 'rgba(15,12,41,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CROWN_KEEPER_THEME.glassBorder,
  },
  cueText: { color: CROWN_KEEPER_THEME.gold, fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
