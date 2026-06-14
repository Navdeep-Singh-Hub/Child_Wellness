/**
 * CameraStage — the live "mission view" for OT Level 6 posture games.
 *
 *  • Web: hosts a DOM container (nativeID) that usePoseDetectionWeb fills with
 *    the mirrored webcam <video>, plus a body-framing guide and quality glow.
 *  • Native: shows a front-camera preview when available, otherwise a friendly
 *    animated placeholder (guided mode). Overlays render on top either way.
 */
import { HERO_SHELL } from '@/components/game/occupational/level6/session1/superheroTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Conditional native camera (preview + frame processor for pose detection).
let CameraView: any = null;
let CameraTypeRef: any = null;
let VisionCamera: any = null;
if (Platform.OS !== 'web') {
  try {
    const expoCamera = require('expo-camera');
    CameraView = expoCamera.CameraView;
    CameraTypeRef = expoCamera.CameraType;
  } catch {
    // expo-camera unavailable — VisionCamera or placeholder will be shown.
  }
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    // VisionCamera unavailable without dev-client build.
  }
}

type Props = {
  previewContainerId: string;
  cameraSupported: boolean;
  hasCamera: boolean;
  present: boolean;
  isDetecting: boolean;
  calibrating: boolean;
  quality: number; // 0..1 — drives the glow color/intensity
  glowColor: string;
  hero: string;
  coachCue: string;
  children?: React.ReactNode;
  /** Native VisionCamera device (APK pose detection). */
  visionDevice?: unknown;
  frameProcessor?: unknown;
  onCameraLayout?: (event: LayoutChangeEvent) => void;
  cameraIsActive?: boolean;
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
  present,
  isDetecting,
  calibrating,
  quality,
  glowColor,
  hero,
  coachCue,
  children,
  visionDevice,
  frameProcessor,
  onCameraLayout,
  cameraIsActive = true,
}) => {
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

  const showLivePreview = cameraSupported && hasCamera;
  const showNativePoseCamera =
    Platform.OS !== 'web' && showLivePreview && visionDevice && frameProcessor && VisionCamera;

  return (
    <View style={styles.stage}>
      {/* Camera / placeholder layer */}
      {Platform.OS === 'web' ? (
        // react-native-web maps nativeID → DOM id; the hook injects <video> here.
        <View nativeID={previewContainerId} style={styles.previewFill} />
      ) : showNativePoseCamera ? (
        <VisionCamera
          style={styles.previewFill}
          device={visionDevice}
          isActive={cameraIsActive}
          frameProcessor={frameProcessor}
          onLayout={onCameraLayout}
          frameProcessorFps={12}
        />
      ) : showLivePreview && CameraView ? (
        <CameraView style={styles.previewFill} facing={CameraTypeRef ? CameraTypeRef.front : 'front'} />
      ) : (
        <LinearGradient colors={['#1E1B4B', '#4C1D95', '#312E81']} style={styles.previewFill}>
          <Animated.Text style={[styles.placeholderHero, heroFloat]}>{hero}</Animated.Text>
          <Text style={styles.placeholderText}>Guided Mode</Text>
        </LinearGradient>
      )}

      {/* Body framing guide */}
      <View pointerEvents="none" style={styles.guideWrap}>
        <View style={styles.guideOval} />
      </View>

      {/* Quality glow border */}
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

      {/* Game overlays (meters, crown, stars, lights) */}
      <View pointerEvents="box-none" style={styles.overlay}>
        {children}
      </View>

      {/* Status pill */}
      <View style={styles.statusRow} pointerEvents="none">
        {cameraSupported ? (
          <View style={[styles.statusPill, { backgroundColor: present ? 'rgba(52,211,153,0.92)' : 'rgba(251,113,133,0.92)' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {calibrating ? 'Calibrating…' : present ? 'Tracking you' : 'Find your body'}
            </Text>
          </View>
        ) : (
          <View style={[styles.statusPill, { backgroundColor: 'rgba(167,139,250,0.92)' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Guided mode</Text>
          </View>
        )}
      </View>

      {/* Coaching cue */}
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
