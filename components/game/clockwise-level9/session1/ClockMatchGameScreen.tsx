// Game 4: Match the Time - Tap the clock showing 1:00
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { playSoundEffect, speakClockTime, speakInstruction, speakFeedback, stopAllAudio } from '../../clockwise/utils/audio';
import { CLOCK_OPTIONS_SESSION1 } from './gameData';

interface ClockMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

function AnalogClock({ hour, minute, size = 150 }: { hour: number; minute: number; size?: number }) {
  const clockSize = size;
  const center = clockSize / 2;
  const radius = clockSize / 2 - 15;
  
  const hourAngle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
  const hourHandLength = radius * 0.5;
  const hourHandX = center + hourHandLength * Math.cos(hourAngle);
  const hourHandY = center + hourHandLength * Math.sin(hourAngle);

  const minuteAngle = -90 * (Math.PI / 180);
  const minuteHandLength = radius * 0.7;
  const minuteHandX = center + minuteHandLength * Math.cos(minuteAngle);
  const minuteHandY = center + minuteHandLength * Math.sin(minuteAngle);

  return (
    <View style={styles.clockContainer}>
      <Svg width={clockSize} height={clockSize}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="3"
        />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, index) => {
          const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
          const x1 = center + (radius - 10) * Math.cos(angle);
          const y1 = center + (radius - 10) * Math.sin(angle);
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <Line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1E293B"
              strokeWidth="2"
            />
          );
        })}
        <Line
          x1={center}
          y1={center}
          x2={hourHandX}
          y2={hourHandY}
          stroke="#DC2626"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke="#1E293B"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx={center} cy={center} r="6" fill="#1E293B" />
      </Svg>
    </View>
  );
}

export default function ClockMatchGameScreen({ onComplete, onBack }: ClockMatchGameScreenProps) {
  const [selectedClock, setSelectedClock] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const buttonScales = CLOCK_OPTIONS_SESSION1.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Tap the clock showing 1:00').then(() => {
      setTimeout(() => {
        speakClockTime(1).catch(() => {});
      }, 500);
    });
    return () => stopAllAudio();
  }, []);

  const handleClockSelect = async (time: string) => {
    if (selectedClock || completed) return;

    const index = CLOCK_OPTIONS_SESSION1.findIndex(c => c.time === time);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedClock(time);
    const option = CLOCK_OPTIONS_SESSION1.find(c => c.time === time);
    const isCorrect = option?.correct || false;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! You found 1 o\'clock!');
      
      setTimeout(() => {
        setCompleted(true);
      }, 2000);
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedClock(null);
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Match the Time</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the clock showing 1:00</Text>
      </View>

      {/* Clock Options */}
      <View style={styles.clocksContainer}>
        {CLOCK_OPTIONS_SESSION1.map((option, index) => {
          const isSelected = selectedClock === option.time;
          const isCorrect = option.correct;
          const showResult = selectedClock !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          let borderColor = '#C7D2FE';
          if (showResult) {
            if (isSelected && isCorrect) {
              borderColor = '#22C55E';
            } else if (isSelected && !isCorrect) {
              borderColor = '#EF4444';
            }
          }

          return (
            <Animated.View key={option.time} entering={FadeInDown.delay(index * 100)} style={buttonAnimatedStyle}>
              <Pressable
                onPress={() => handleClockSelect(option.time)}
                disabled={completed}
                style={[styles.clockButton, { borderColor }]}
              >
                <AnalogClock hour={option.hour} minute={option.minute} size={150} />
                <Text style={styles.clockTimeText}>{option.time}</Text>
                {showResult && isSelected && (
                  <View style={styles.resultIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={32}
                      color={isCorrect ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
          <Pressable onPress={onComplete} style={styles.nextButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  clocksContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  clockButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    minWidth: 180,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockTimeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
