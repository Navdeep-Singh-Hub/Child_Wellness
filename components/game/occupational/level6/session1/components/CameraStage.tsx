/**
 * CameraStage — the live "mission view" for OT Level 6 posture games.
 */
import { HERO_SHELL } from '@/components/game/occupational/level6/session1/superheroTheme';
import type { MediapipePoseSolution } from '@/hooks/poseDetectionTypes';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

let CameraView: any = null;
let CameraTypeRef: any = null;
let MediapipeCamera: React.ComponentType<{
  style?: object;
  solution: MediapipePoseSolution;
  activeCamera?: 'front' | 'back';
  resizeMode?: 'cover' | 'contain';
}> | null = null;

if (Platform.OS !== 'web') {
  try {
    const expoCamera = require('expo-camera');
    CameraView = expoCamera.CameraView;
    CameraTypeRef = expoCamera.CameraType;
  } catch {
    // expo-camera preview fallback unavailable.
  }
  try {
    MediapipeCamera = require('react-native-mediapipe-posedetection').MediapipeCamera;
  } catch {
    // MediapipeCamera unavailable without native build.
  }
}

type Props = {
  previewContainerId: string;
  cameraSupported: boolean;
  hasCamera: boolean;
  permissionGranted?: boolean;
  present: boolean;
  isDetecting: boolean;
  calibrating: boolean;
  quality: number;
  glowColor: string;
  hero: string;
  coachCue: string;
  children?: React.ReactNode;
  mediapipeSolution?: MediapipePoseSolution | null;
};

const qualityColor = (q: number) => {
  if (q >= 0.8) return HERO_SHELL.good;
  if (q >= 0.55) return HERO_SHELL.gold;
  return HERO_SHELL.warn;
};

export const CameraStage: React.FC<Props> = ({
  previewContainerId,
  cameraSupported,
  hasCamera,
  permissionGranted: permissionGrantedProp,
  present,
  calibrating,
  quality,
  hero,
  coachCue,
  children,
  mediapipeSolution,
}) => {
  const permissionGranted = permissionGrantedProp ?? hasCamera;
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.35,
    borderColor: present ? qualityColor(quality) : 'rgba(196,181,253,0.4)',
  }));

  const heroFloat = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 + pulse.value * 12 }],
  }));

  const showMediapipeCamera =
    Platform.OS !== 'web' &&
    cameraSupported &&
    permissionGranted &&
    Boolean(mediapipeSolution && MediapipeCamera);

  const showExpoPreview =
    Platform.OS !== 'web' &&
    cameraSupported &&
    permissionGranted &&
    !showMediapipeCamera &&
    CameraView;

  const showGuidedPlaceholder = !showMediapipeCamera && !showExpoPreview;

  return (
    <View style={styles.stage}>
      {Platform.OS === 'web' ? (
        <View nativeID={previewContainerId} style={styles.previewFill} />
      ) : showMediapipeCamera && mediapipeSolution && MediapipeCamera ? (
        <MediapipeCamera
          style={styles.previewFill}
          solution={mediapipeSolution}
          activeCamera="front"
          resizeMode="cover"
        />
      ) : showExpoPreview ? (
        <CameraView style={styles.previewFill} facing={CameraTypeRef ? CameraTypeRef.front : 'front'} />
      ) : (
        <LinearGradient colors={['#1E1B4B', '#4C1D95', '#312E81']} style={styles.previewFill}>
          <Animated.Text style={[styles.placeholderHero, heroFloat]}>{hero}</Animated.Text>
          <Text style={styles.placeholderText}>
            {cameraSupported && !permissionGranted ? 'Allow camera to start' : 'Guided Mode'}
          </Text>
        </LinearGradient>
      )}

      <View pointerEvents="none" style={styles.guideWrap}>
        <View style={styles.guideOval} />
      </View>

      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

      <View pointerEvents="box-none" style={styles.overlay}>
        {children}
      </View>

      <View style={styles.statusRow} pointerEvents="none">
        {cameraSupported && permissionGranted ? (
          <View style={[styles.statusPill, { backgroundColor: present ? 'rgba(52,211,153,0.92)' : 'rgba(251,113,133,0.92)' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {calibrating ? 'Calibrating…' : present ? 'Tracking you' : 'Find your body'}
            </Text>
          </View>
        ) : cameraSupported ? (
          <View style={[styles.statusPill, { backgroundColor: 'rgba(251,191,36,0.92)' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Camera needed</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, { backgroundColor: 'rgba(167,139,250,0.92)' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Guided mode</Text>
          </View>
        )}
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
    borderColor: HERO_SHELL.stageBorder,
    backgroundColor: HERO_SHELL.stageBg,
    position: 'relative',
  },
  previewFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' } as any,
  placeholderHero: { fontSize: 90 },
  placeholderText: { color: '#C4B5FD', fontSize: 15, fontWeight: '800', marginTop: 8, letterSpacing: 1 },
  guideWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  guideOval: {
    width: '58%',
    height: '78%',
    borderRadius: 200,
    borderWidth: 2,
    borderColor: 'rgba(253,224,71,0.35)',
    borderStyle: 'dashed',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 4,
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  statusRow: { position: 'absolute', top: 12, right: 12, flexDirection: 'row' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
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
    borderColor: HERO_SHELL.glassBorder,
  },
  cueText: { color: '#FDE68A', fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
