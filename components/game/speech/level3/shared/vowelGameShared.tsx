import { useJawDetection } from '@/hooks/useJawDetection';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  VoiceLevelBar,
  VoiceMicBanner,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import {
  calculateRoundness,
  isRoundOoo,
  isSmileEee,
  isWideOpenA,
} from '@/components/game/speech/level3/shared/mouthMetrics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
};

export type VowelSense = {
  voiceLevel: number;
  voiceActive: boolean;
  ratio: number;
  isOpen: boolean;
  isDetecting: boolean;
  smileAmount: number;
  cheekExpansion: number;
  roundness: number;
  wideOpenA: boolean;
  smileEee: boolean;
  roundOoo: boolean;
  previewContainerId?: string;
  hasCamera: boolean;
};

export function useVowelGameHooks(micEnabled = true) {
  const voice = useVoiceLevel({ enabled: micEnabled });
  const jaw = useJawDetection(Platform.OS === 'web');

  const ext = jaw as {
    smileAmount?: number;
    cheekExpansion?: number;
    landmarks?: Parameters<typeof calculateRoundness>[0];
    previewContainerId?: string;
  };

  const ratio = jaw.ratio || 0;
  const smileAmount = ext.smileAmount ?? 0;
  const cheekExpansion = ext.cheekExpansion ?? 0;
  const landmarks = ext.landmarks;
  const roundness = calculateRoundness(landmarks);

  const sense: VowelSense = useMemo(
    () => ({
      voiceLevel: voice.level,
      voiceActive: voice.status === 'active',
      ratio,
      isOpen: jaw.isOpen || false,
      isDetecting: jaw.isDetecting || false,
      smileAmount,
      cheekExpansion,
      roundness,
      wideOpenA: isWideOpenA(ratio, jaw.isOpen || false),
      smileEee: isSmileEee(smileAmount, ratio, jaw.isOpen || false, cheekExpansion),
      roundOoo: isRoundOoo(landmarks, ratio, roundness),
      previewContainerId: ext.previewContainerId,
      hasCamera: jaw.hasCamera || false,
    }),
    [
      voice.level,
      voice.status,
      ratio,
      jaw.isOpen,
      jaw.isDetecting,
      smileAmount,
      cheekExpansion,
      roundness,
      landmarks,
      ext.previewContainerId,
      jaw.hasCamera,
    ],
  );

  return { voice, sense };
}

export function voiceOnlyMatch(level: number, active: boolean, minLevel = VOICE_ACTIVE_THRESHOLD) {
  return active && level >= minLevel;
}

export function vowelMatch(
  sense: VowelSense,
  shape: 'A' | 'E' | 'O',
  holdMs: number,
  holdStartRef: React.MutableRefObject<number | null>,
): { progress: number; matched: boolean } {
  const now = Date.now();
  let shapeOk = false;
  if (shape === 'A') shapeOk = sense.wideOpenA;
  else if (shape === 'E') shapeOk = sense.smileEee;
  else shapeOk = sense.roundOoo;

  const voiceOk = voiceOnlyMatch(sense.voiceLevel, sense.voiceActive);
  const useShape = Platform.OS === 'web' && sense.isDetecting;
  const ok = useShape ? shapeOk && voiceOk : voiceOk;

  if (!ok) {
    holdStartRef.current = null;
    return { progress: 0, matched: false };
  }
  if (!holdStartRef.current) holdStartRef.current = now;
  const held = now - holdStartRef.current;
  return { progress: Math.min(1, held / holdMs), matched: held >= holdMs };
}

type ShellProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  progress: number;
  progressTotal: number;
  roundLabel?: string;
  showCamera?: boolean;
  children: (sense: VowelSense) => React.ReactNode;
};

export function VowelGameFrame({
  children,
  showCamera = true,
  ...shell
}: ShellProps) {
  const { voice, sense } = useVowelGameHooks(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={shell.gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: shell.accent }]}>
          <TouchableOpacity
            onPress={() => {
              voice.stop();
              clearGameSpeech();
              shell.onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${shell.accent}22` }]}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{shell.title}</Text>
            <Text style={styles.subtitle}>{shell.subtitle}</Text>
          </View>
        </View>

        <VoiceMicBanner voice={voice} />
        <View style={styles.playArea}>
          {showCamera && (
            <WebCameraPreview
              previewContainerId={sense.previewContainerId}
              isDetecting={sense.isDetecting}
            />
          )}
          {children(sense)}
        </View>
        {voice.status === 'active' && <VoiceLevelBar level={voice.level} accent={shell.accent} />}
        <View style={styles.footer}>
          <Text style={styles.skills}>{shell.skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: shell.progressTotal }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { borderColor: shell.accent },
                  i < shell.progress && { backgroundColor: shell.accent },
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {shell.roundLabel ?? `Progress: ${shell.progress} / ${shell.progressTotal}`}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function WebCameraPreview({
  previewContainerId,
  isDetecting,
}: {
  previewContainerId?: string;
  isDetecting: boolean;
}) {
  if (Platform.OS !== 'web' || !previewContainerId) return null;
  return (
    <View style={camStyles.wrap} pointerEvents="none">
      <View style={camStyles.box} nativeID={previewContainerId} collapsable={false}>
        {!isDetecting && <Text style={camStyles.loading}>Camera…</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 2,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10 },
  backText: { marginLeft: 4, fontWeight: '700', color: '#0F172A', fontSize: 15 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  playArea: { flex: 1, padding: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
  },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
});

const camStyles = StyleSheet.create({
  wrap: { position: 'absolute', top: 4, right: 4, zIndex: 5 },
  box: {
    width: 96,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: { color: '#fff', fontSize: 10 },
});
