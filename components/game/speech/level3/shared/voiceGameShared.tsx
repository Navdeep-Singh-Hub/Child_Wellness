import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech as clearTtsScheduled, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VOICE_ACTIVE_THRESHOLD = 0.22;
export const VOICE_LOUD_THRESHOLD = 0.45;
export const DEFAULT_VOICE_ROUNDS = 3;

let speechTimers: ReturnType<typeof setTimeout>[] = [];

export function clearGameSpeech() {
  speechTimers.forEach((t) => clearTimeout(t));
  speechTimers = [];
  clearTtsScheduled();
  try {
    stopTTS();
  } catch {}
}

export function speakGame(text: string, rate = DEFAULT_TTS_RATE) {
  clearGameSpeech();
  speakTTS(text, rate);
}

export function scheduleGameSpeech(text: string, delayMs: number, rate = DEFAULT_TTS_RATE) {
  const t = setTimeout(() => speakGame(text, rate), delayMs);
  speechTimers.push(t);
}

type VoiceCtx = ReturnType<typeof useVoiceLevel>;

export function VoiceMicBanner({ voice }: { voice: VoiceCtx }) {
  if (voice.status === 'active') return null;

  const message =
    voice.status === 'requesting'
      ? 'Starting microphone…'
      : voice.status === 'denied'
        ? 'Microphone access denied. Allow mic in settings to play.'
        : voice.status === 'error'
          ? voice.error ?? 'Microphone error'
          : 'Allow microphone to use your voice';

  return (
    <View style={styles.micBanner}>
      {voice.status === 'requesting' ? (
        <ActivityIndicator color="#2563EB" />
      ) : (
        <Ionicons name="mic-off" size={20} color="#B45309" />
      )}
      <Text style={styles.micBannerText}>{message}</Text>
      {(voice.status === 'denied' || voice.status === 'error' || voice.status === 'idle') && (
        <Pressable
          style={styles.micRetry}
          onPress={() => {
            clearGameSpeech();
            void voice.start();
          }}
        >
          <Text style={styles.micRetryText}>Enable mic</Text>
        </Pressable>
      )}
    </View>
  );
}

export function VoiceLevelBar({ level, accent }: { level: number; accent: string }) {
  const widthPct = `${Math.round(level * 100)}%` as `${number}%`;
  return (
    <View style={styles.meterWrap}>
      <Ionicons name="mic" size={18} color={accent} />
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: widthPct, backgroundColor: accent }]} />
      </View>
      <Text style={styles.meterLabel}>{level >= VOICE_ACTIVE_THRESHOLD ? 'Voice!' : 'Make a sound'}</Text>
    </View>
  );
}

/** Pass voice from shell via render prop pattern — helper hook for games that own shell */
export function useVoiceGameSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);

  const finishGame = useCallback(
    async (accuracy: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
      setFinalStats({ accuracy, totalStars: stars });
      setGameFinished(true);
      try {
        await logGameAndAward({
          type: gameId,
          correct: rounds,
          total: rounds,
          accuracy,
          xpAwarded: stars * 15,
          durationMs: rounds * 30000,
          skillTags: ['voice-activation', 'vocal-play', 'vowel-sounds', 'bilabial-sounds', 'syllables', 'animal-sounds', 'sound-sequences', 'meaningful-words', 'listen-repeat', 'two-part-verbal', 'fluent-speech'],
        });
      } catch (e) {
        console.warn('[voice game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      const accuracy = Math.min(100, 70 + round * 10);
      void finishGame(accuracy);
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
    }, 1400);
  }, [round, rounds, finishGame]);

  return {
    round,
    rounds,
    showRoundSuccess,
    gameFinished,
    finalStats,
    completeRound,
    setGameFinished,
  };
}

export function VoiceGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message="Amazing voice work!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearGameSpeech();
              onBack();
            }}
            onContinue={() => {
              clearGameSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

/** Render-prop shell: children receive live voice levels */
export function VoiceGameFrame(props: Omit<VoiceGameShellProps, 'children'> & {
  children: (voice: VoiceCtx) => React.ReactNode;
}) {
  const { children, micEnabled = true, ...shell } = props;
  const voice = useVoiceLevel({ enabled: micEnabled });

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
        <View style={styles.playArea}>{children(voice)}</View>
        {shell.showMeter !== false && voice.status === 'active' && (
          <VoiceLevelBar level={voice.level} accent={shell.accent} />
        )}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  backText: { marginLeft: 4, fontWeight: '700', color: '#0F172A', fontSize: 15 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  micBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
  },
  micBannerText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '600' },
  micRetry: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  micRetryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  playArea: { flex: 1, padding: 12 },
  meterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  meterTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 8 },
  meterLabel: { fontSize: 12, fontWeight: '700', color: '#334155', minWidth: 88 },
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
