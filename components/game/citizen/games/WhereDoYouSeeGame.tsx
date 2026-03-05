// Game 2: Where Do You See This?
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { SIGNS, SIGN_LOCATIONS, shuffleArray } from '../utils/gameData';

interface WhereDoYouSeeGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

// Location emoji mapping
const LOCATION_EMOJIS: Record<string, string> = {
  Door: '🚪',
  Tree: '🌳',
  Car: '🚗',
  Building: '🏢',
  Road: '🛣️',
  Park: '🌳',
};

export default function WhereDoYouSeeGame({ onComplete, onBack }: WhereDoYouSeeGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<typeof SIGN_LOCATIONS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentLocation) {
      const sign = SIGNS.find(s => s.id === currentLocation.signId);
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakInstruction(`Where do you see ${sign?.text}?`).catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentLocation]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'where-do-you-see',
      });
      return;
    }

    const location = SIGN_LOCATIONS[round % SIGN_LOCATIONS.length];
    const shuffled = shuffleArray([...location.options]);
    
    setCurrentLocation(location);
    setOptions(shuffled);
    setSelectedLocation(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleLocationSelect = async (location: string) => {
    if (!canSelect || !currentLocation) return;

    setCanSelect(false);
    setSelectedLocation(location);
    const correct = location === currentLocation.correctLocation;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedLocation(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentLocation) return null;

  const sign = SIGNS.find(s => s.id === currentLocation.signId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Where do you see this sign?</Text>
      </View>

      {/* Sign Display */}
      <View style={styles.signContainer}>
        <View style={[styles.signBox, { backgroundColor: sign?.backgroundColor || '#2563EB' }]}>
          <Text style={[styles.signText, { color: sign?.color || '#FFFFFF' }]}>
            {sign?.text}
          </Text>
        </View>
      </View>

      {/* Location Options */}
      <View style={styles.optionsContainer}>
        {options.map((location, index) => {
          const isSelected = selectedLocation === location;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleLocationSelect(location)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.locationButton,
                  cardAnimatedStyle,
                  showCorrect && styles.locationButtonCorrect,
                  showIncorrect && styles.locationButtonIncorrect,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FDE68A', '#FCD34D']}
                  style={styles.locationGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.locationEmoji}>{LOCATION_EMOJIS[location] || '📍'}</Text>
                  <Text style={styles.locationText}>{location}</Text>
                  {showCorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                  {showIncorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  signContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  signBox: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 12,
  },
  locationButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  locationButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  locationButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  locationGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  locationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
