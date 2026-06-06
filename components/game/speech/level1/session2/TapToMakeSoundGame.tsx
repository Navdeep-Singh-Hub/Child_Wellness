import {
  cleanupSounds,
  playSound as playGameSound,
  preloadSounds,
  stopAllSpeech,
} from '@/utils/soundPlayer';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGlowLoop } from '@/utils/animatedGlowLoop';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredTaps?: number;
};

const INSTRUMENT_SIZE = 160;
type InstrumentType = 'drum' | 'bell' | 'horn';
type SoundKey = 'drum' | 'bell' | 'beep';

let scheduledSpeechTimers: Array<ReturnType<typeof setTimeout>> = [];

function clearScheduledSpeech() {
  scheduledSpeechTimers.forEach((t) => clearTimeout(t));
  scheduledSpeechTimers = [];
  try {
    stopTTS();
  } catch {}
}

function speak(text: string, rate = DEFAULT_TTS_RATE) {
  try {
    clearScheduledSpeech();
    speakTTS(text, rate);
  } catch (e) {
    console.warn('speak error', e);
  }
}

const INSTRUMENTS = [
  {
    type: 'drum' as InstrumentType,
    emoji: '🥁',
    name: 'drum',
    color: ['#EF4444', '#DC2626'] as [string, string],
    glow: '#FCA5A5',
    soundKey: 'drum' as SoundKey,
    soundWord: 'Boom!',
  },
  {
    type: 'bell' as InstrumentType,
    emoji: '🔔',
    name: 'bell',
    color: ['#FBBF24', '#F59E0B'] as [string, string],
    glow: '#FDE68A',
    soundKey: 'bell' as SoundKey,
    soundWord: 'Ding!',
  },
  {
    type: 'horn' as InstrumentType,
    emoji: '📯',
    name: 'horn',
    color: ['#3B82F6', '#2563EB'] as [string, string],
    glow: '#93C5FD',
    soundKey: 'beep' as SoundKey,
    soundWord: 'Toot!',
  },
];

export const TapToMakeSoundGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredTaps = 5,
}) => {
  const [hits, setHits] = useState(0);
  const [currentInstrument, setCurrentInstrument] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSoundWord, setShowSoundWord] = useState(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const instrumentScale = useRef(new Animated.Value(1)).current;
  const instrumentRotation = useRef(new Animated.Value(0)).current;
  const instrumentGlow = useRef(new Animated.Value(0.5)).current;
  const soundWaveScale = useRef(new Animated.Value(0)).current;
  const soundWaveOpacity = useRef(new Animated.Value(0)).current;

  const activeInstruments = INSTRUMENTS;
  const instrumentGlowLoop = useMemo(() => createGlowLoop(instrumentGlow), [instrumentGlow]);

  useEffect(() => {
    preloadSounds();
    instrumentGlowLoop.start();
    const instrument = activeInstruments[currentInstrument];
    speak(`Tap the ${instrument.name}!`);
    return () => {
      instrumentGlowLoop.stop();
      clearScheduledSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount intro only
  }, [instrumentGlowLoop]);

  const playSoundForInstrument = useCallback(async (soundKey: SoundKey) => {
    try {
      await playGameSound(soundKey, 0.9, 1.0);
    } catch (e) {
      console.warn('Error playing sound:', soundKey, e);
      throw e;
    }
  }, []);

  const handleInstrumentPlay = useCallback(
    async (instrumentIndex: number) => {
      if (isPlaying) return;

      setIsPlaying(true);
      const instrument = activeInstruments[instrumentIndex];

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      try {
        await playSoundForInstrument(instrument.soundKey);
      } catch {
        speak(instrument.soundWord);
      }

      setShowSoundWord(true);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(instrumentScale, {
            toValue: 1.2,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(instrumentRotation, {
            toValue: 10,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(instrumentScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(instrumentRotation, {
            toValue: -10,
            duration: 100,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(instrumentRotation, {
          toValue: 0,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      soundWaveScale.setValue(0);
      soundWaveOpacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(soundWaveScale, {
          toValue: 2.5,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(soundWaveOpacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      const nextHits = hits + 1;
      setHits(nextHits);
      setShowRoundSuccess(true);

      setTimeout(() => {
        setShowRoundSuccess(false);
        setShowSoundWord(false);
        setIsPlaying(false);
      }, 2500);

      if (nextHits > 0 && nextHits % 2 === 0) {
        setTimeout(() => {
          const nextInstrument = (currentInstrument + 1) % activeInstruments.length;
          setCurrentInstrument(nextInstrument);
          const newInstrument = activeInstruments[nextInstrument];
          speak(`Tap the ${newInstrument.name}!`);
        }, 2000);
      }

      if (nextHits >= requiredTaps) {
        setGameFinished(true);
        setShowRoundSuccess(false);
      }
    },
    [
      isPlaying,
      currentInstrument,
      hits,
      requiredTaps,
      activeInstruments,
      playSoundForInstrument,
      instrumentScale,
      instrumentRotation,
      soundWaveScale,
      soundWaveOpacity,
    ],
  );

  const handleInstrumentTap = () => {
    handleInstrumentPlay(currentInstrument);
  };

  const progressDots = Array.from({ length: requiredTaps }, (_, i) => i < hits);
  const instrument = activeInstruments[currentInstrument];

  const glowRingStyle = {
    opacity: instrumentGlow.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0.35, 0.75],
    }),
  };

  if (gameFinished) {
    const accuracyPct = hits >= requiredTaps ? 100 : Math.round((hits / requiredTaps) * 100);
    const xpAwarded = hits * 10;
    return (
      <CongratulationsScreen
        message="Great Sounds!"
        showButtons={true}
        correct={hits}
        total={requiredTaps}
        accuracy={accuracyPct}
        xpAwarded={xpAwarded}
        onContinue={() => {
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={() => {
          clearScheduledSpeech();
          stopTTS();
          stopAllSpeech();
          cleanupSounds();
          onBack();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FEF3C7', '#FDE68A', '#FCD34D']} style={styles.gradient}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              clearScheduledSpeech();
              stopAllSpeech();
              cleanupSounds();
              onBack();
            }}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Tap to Make Sound</Text>
            <Text style={styles.subtitle}>
              Tap the {instrument.name} to hear it play! {instrument.emoji}
            </Text>
          </View>
        </View>

        <View style={styles.playArea}>
          <Animated.View
            style={[
              styles.soundWave,
              {
                transform: [{ scale: soundWaveScale }],
                opacity: soundWaveOpacity,
                borderColor: instrument.glow,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.soundWave,
              styles.soundWaveInner,
              {
                transform: [
                  {
                    scale: soundWaveScale.interpolate({
                      inputRange: [0, 2.5],
                      outputRange: [0, 2],
                    }),
                  },
                ],
                opacity: soundWaveOpacity.interpolate({
                  inputRange: [0, 0.8],
                  outputRange: [0, 0.48],
                }),
                borderColor: instrument.glow,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.instrumentContainer,
              {
                transform: [
                  { scale: instrumentScale },
                  {
                    rotate: instrumentRotation.interpolate({
                      inputRange: [-10, 10],
                      outputRange: ['-10deg', '10deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.glowRing, { borderColor: instrument.glow }, glowRingStyle]}
            />
            <Pressable onPress={handleInstrumentTap} hitSlop={40} style={styles.instrumentPressable}>
              <LinearGradient
                colors={instrument.color}
                style={styles.instrument}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.instrumentEmoji}>{instrument.emoji}</Text>
                {showSoundWord && (
                  <View style={styles.soundWordBadge}>
                    <Text style={styles.soundWordText}>{instrument.soundWord}</Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {hits === 0 && !isPlaying && (
            <View style={styles.instructionBadge}>
              <Text style={styles.instructionText}>👆 Tap the {instrument.name}!</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔊 Sound Association • 🎵 Cause–Sound Mapping • 👂 Listening + Initiation
          </Text>
          <View style={styles.progressRow}>
            {progressDots.map((filled, idx) => (
              <View
                key={idx}
                style={[styles.progressDot, filled && styles.progressDotFilled]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {hits >= requiredTaps ? '🎊 Amazing! You did it! 🎊' : `Taps: ${hits} / ${requiredTaps}`}
          </Text>
        </View>
      </LinearGradient>

      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  playArea: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  soundWave: {
    position: 'absolute',
    width: INSTRUMENT_SIZE,
    height: INSTRUMENT_SIZE,
    borderRadius: INSTRUMENT_SIZE / 2,
    borderWidth: 3,
    zIndex: 1,
  },
  soundWaveInner: {
    transform: [{ scale: 0.85 }],
  },
  instrumentContainer: {
    zIndex: 100,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: INSTRUMENT_SIZE + 24,
    height: INSTRUMENT_SIZE + 24,
    borderRadius: (INSTRUMENT_SIZE + 24) / 2,
    borderWidth: 4,
  },
  instrumentPressable: {
    width: INSTRUMENT_SIZE,
    height: INSTRUMENT_SIZE,
  },
  instrument: {
    width: INSTRUMENT_SIZE,
    height: INSTRUMENT_SIZE,
    borderRadius: INSTRUMENT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 12,
  },
  instrumentEmoji: {
    fontSize: 90,
  },
  soundWordBadge: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  soundWordText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 1,
  },
  instructionBadge: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  instructionText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 2,
    borderTopColor: '#FCD34D',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  progressDotFilled: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
    transform: [{ scale: 1.2 }],
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
});
