// Game 3: Clock Introduction - Learn about 3:00
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { speakClockTime, speakInstruction, stopAllAudio } from '../../clockwise/utils/audio';
import { CLOCK_TIME_SESSION3 } from './gameData';

interface ClockIntroGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

function AnalogClock({ hour, minute }: { hour: number; minute: number }) {
  const clockSize = 250;
  const center = clockSize / 2;
  const radius = clockSize / 2 - 20;
  
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
          strokeWidth="4"
        />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, index) => {
          const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
          const x1 = center + (radius - 15) * Math.cos(angle);
          const y1 = center + (radius - 15) * Math.sin(angle);
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
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke="#1E293B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Circle cx={center} cy={center} r="8" fill="#1E293B" />
      </Svg>
    </View>
  );
}

export default function ClockIntroGameScreen({ onComplete, onBack }: ClockIntroGameScreenProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const clockScale = useSharedValue(0);
  const hourHandScale = useSharedValue(0);
  const minuteHandScale = useSharedValue(0);
  const explanationOpacity = useSharedValue(0);

  useEffect(() => {
    const initClock = async () => {
      clockScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      hourHandScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      minuteHandScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await speakClockTime(CLOCK_TIME_SESSION3.hour);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await speakInstruction(CLOCK_TIME_SESSION3.description);
      
      setShowExplanation(true);
      explanationOpacity.value = withTiming(1, { duration: 500 });
      
      setTimeout(() => {
        setShowNextButton(true);
      }, 2000);
    };

    initClock().catch(() => {});

    return () => {
      stopAllAudio();
    };
  }, []);

  const clockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clockScale.value }],
  }));

  const explanationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: explanationOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Clock Introduction</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Clock Display */}
      <Animated.View style={[styles.clockWrapper, clockAnimatedStyle]} entering={FadeInDown.delay(200)}>
        <AnalogClock hour={CLOCK_TIME_SESSION3.hour} minute={CLOCK_TIME_SESSION3.minute} />
      </Animated.View>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{CLOCK_TIME_SESSION3.time}</Text>
      </View>

      {/* Explanation */}
      {showExplanation && (
        <Animated.View style={[styles.explanationContainer, explanationAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              Minute hand → {CLOCK_TIME_SESSION3.minuteHandPosition}
            </Text>
            <Text style={styles.explanationText}>
              Hour hand → {CLOCK_TIME_SESSION3.hourHandPosition}
            </Text>
            <Text style={styles.explanationDescription}>
              {CLOCK_TIME_SESSION3.description}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Next Button */}
      {showNextButton && (
        <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
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
  clockWrapper: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 150,
    padding: 20,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  timeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#6C9EFF',
  },
  explanationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  explanationBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  explanationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanationDescription: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
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
