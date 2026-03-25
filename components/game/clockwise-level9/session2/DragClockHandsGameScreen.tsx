// Game 4: Drag Clock Hands - Set the clock to 2:00
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { playSoundEffect, speakClockTime, speakInstruction, speakFeedback, stopAllAudio } from '../../clockwise/utils/audio';
import { CLOCK_TIME_SESSION2 } from './gameData';

interface DragClockHandsGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const CLOCK_SIZE = 300;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const CLOCK_RADIUS = CLOCK_SIZE / 2 - 30;

function DraggableClock({ targetHour, targetMinute, onCorrect }: { targetHour: number; targetMinute: number; onCorrect: () => void }) {
  const [hourAngle, setHourAngle] = useState(-30); // Start at 2 o'clock position
  const [minuteAngle, setMinuteAngle] = useState(-90); // Start at 12 o'clock position
  const [draggingHour, setDraggingHour] = useState(false);
  const [draggingMinute, setDraggingMinute] = useState(false);
  const [completed, setCompleted] = useState(false);

  const targetHourAngleDeg = (targetHour % 12) * 30 - 90; // -30 for 2 o'clock
  const targetMinuteAngleDeg = -90; // -90 for 12 o'clock

  const hourHandLength = CLOCK_RADIUS * 0.5;
  const minuteHandLength = CLOCK_RADIUS * 0.7;

  const hourHandX = CLOCK_CENTER + hourHandLength * Math.cos(hourAngle * (Math.PI / 180));
  const hourHandY = CLOCK_CENTER + hourHandLength * Math.sin(hourAngle * (Math.PI / 180));
  const minuteHandX = CLOCK_CENTER + minuteHandLength * Math.cos(minuteAngle * (Math.PI / 180));
  const minuteHandY = CLOCK_CENTER + minuteHandLength * Math.sin(minuteAngle * (Math.PI / 180));

  const checkCorrect = () => {
    if (completed) return;
    
    const hourDiff = Math.abs(hourAngle - targetHourAngleDeg);
    const hourCorrect = hourDiff < 15 || hourDiff > 345;
    
    const minuteDiff = Math.abs(minuteAngle - targetMinuteAngleDeg);
    const minuteCorrect = minuteDiff < 15 || minuteDiff > 345;
    
    if (hourCorrect && minuteCorrect) {
      setCompleted(true);
      onCorrect();
    }
  };

  const getAngleFromTouch = (x: number, y: number) => {
    const dx = x - CLOCK_CENTER;
    const dy = y - CLOCK_CENTER;
    // atan2 gives angle from positive x-axis, convert to clock angle (12 o'clock = -90)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Convert to clock coordinate system (12 o'clock is -90 degrees)
    angle = angle - 90;
    // Normalize to -180 to 180 range
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      if (completed) return false;
      const { locationX, locationY } = evt.nativeEvent;
      
      // Check if touch is near hour hand
      const hourDist = Math.sqrt(
        Math.pow(locationX - hourHandX, 2) + Math.pow(locationY - hourHandY, 2)
      );
      if (hourDist < 50) {
        setDraggingHour(true);
        return true;
      }
      
      // Check if touch is near minute hand
      const minuteDist = Math.sqrt(
        Math.pow(locationX - minuteHandX, 2) + Math.pow(locationY - minuteHandY, 2)
      );
      if (minuteDist < 50) {
        setDraggingMinute(true);
        return true;
      }
      
      return false;
    },
    onMoveShouldSetPanResponder: () => draggingHour || draggingMinute,
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const angle = getAngleFromTouch(locationX, locationY);
      
      if (draggingHour) {
        setHourAngle(angle);
      } else if (draggingMinute) {
        setMinuteAngle(angle);
      }
    },
    onPanResponderRelease: () => {
      setDraggingHour(false);
      setDraggingMinute(false);
      setTimeout(checkCorrect, 100);
    },
  });

  return (
    <View style={styles.clockWrapper} {...panResponder.panHandlers}>
      <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
        <Circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={CLOCK_RADIUS}
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="4"
        />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, index) => {
          const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
          const x1 = CLOCK_CENTER + (CLOCK_RADIUS - 15) * Math.cos(angle);
          const y1 = CLOCK_CENTER + (CLOCK_RADIUS - 15) * Math.sin(angle);
          const x2 = CLOCK_CENTER + CLOCK_RADIUS * Math.cos(angle);
          const y2 = CLOCK_CENTER + CLOCK_RADIUS * Math.sin(angle);
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
          x1={CLOCK_CENTER}
          y1={CLOCK_CENTER}
          x2={hourHandX}
          y2={hourHandY}
          stroke="#DC2626"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Line
          x1={CLOCK_CENTER}
          y1={CLOCK_CENTER}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke="#1E293B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="8" fill="#1E293B" />
      </Svg>
      {completed && (
        <View style={styles.successOverlay}>
          <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
        </View>
      )}
    </View>
  );
}

export default function DragClockHandsGameScreen({ onComplete, onBack }: DragClockHandsGameScreenProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    speakInstruction('Set the clock to 2:00').then(() => {
      setTimeout(() => {
        speakClockTime(CLOCK_TIME_SESSION2.hour).catch(() => {});
      }, 500);
    });
    return () => stopAllAudio();
  }, []);

  const handleCorrect = async () => {
    await playSoundEffect('correct');
    await speakFeedback('Perfect! You set the clock to 2 o\'clock!');
    setTimeout(() => {
      setCompleted(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Drag Clock Hands</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Set the clock to 2:00</Text>
        <Text style={styles.instructionSubtext}>Drag the hour hand to 2 and minute hand to 12</Text>
      </View>

      {/* Clock */}
      <View style={styles.clockContainer}>
        <DraggableClock
          targetHour={CLOCK_TIME_SESSION2.hour}
          targetMinute={CLOCK_TIME_SESSION2.minute}
          onCorrect={handleCorrect}
        />
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
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  clockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  clockWrapper: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: CLOCK_SIZE / 2,
    padding: 20,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: CLOCK_SIZE / 2,
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
