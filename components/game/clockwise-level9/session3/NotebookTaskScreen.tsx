// Notebook Task Screen - Write sentence and draw clock
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { speakInstruction, stopAllAudio } from '../../clockwise/utils/audio';
import { CLOCK_TIME_SESSION3, NOTEBOOK_CLOCK_TIME_SESSION3, NOTEBOOK_SENTENCE_SESSION3 } from './gameData';

interface NotebookTaskScreenProps {
  onNext: () => void;
  onBack: () => void;
}

function ClockExample() {
  const clockSize = 120;
  const center = clockSize / 2;
  const radius = clockSize / 2 - 10;
  
  const hour = 3;
  const hourAngle = ((hour % 12) * 30 - 90) * (Math.PI / 180);
  const hourHandLength = radius * 0.5;
  const hourHandX = center + hourHandLength * Math.cos(hourAngle);
  const hourHandY = center + hourHandLength * Math.sin(hourAngle);

  const minuteAngle = -90 * (Math.PI / 180);
  const minuteHandLength = radius * 0.7;
  const minuteHandX = center + minuteHandLength * Math.cos(minuteAngle);
  const minuteHandY = center + minuteHandLength * Math.sin(minuteAngle);

  return (
    <View style={styles.clockExampleContainer}>
      <Svg width={clockSize} height={clockSize}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="2"
        />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, index) => {
          const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
          const x1 = center + (radius - 8) * Math.cos(angle);
          const y1 = center + (radius - 8) * Math.sin(angle);
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
              strokeWidth="1"
            />
          );
        })}
        <Line
          x1={center}
          y1={center}
          x2={hourHandX}
          y2={hourHandY}
          stroke="#DC2626"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke="#1E293B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Circle cx={center} cy={center} r="4" fill="#1E293B" />
      </Svg>
    </View>
  );
}

export default function NotebookTaskScreen({ onNext, onBack }: NotebookTaskScreenProps) {
  useEffect(() => {
    speakInstruction(
      `Write the sentence: ${NOTEBOOK_SENTENCE_SESSION3}. Then draw a clock showing ${NOTEBOOK_CLOCK_TIME_SESSION3}.`
    ).catch(() => {});
    return () => stopAllAudio();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Notebook Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📝 Your Task</Text>
          <View style={styles.taskSection}>
            <Text style={styles.taskNumber}>1.</Text>
            <Text style={styles.taskText}>Write the sentence:</Text>
          </View>
          <View style={styles.sentenceExample}>
            <Text style={styles.sentenceText}>{NOTEBOOK_SENTENCE_SESSION3}</Text>
          </View>
          <View style={styles.taskSection}>
            <Text style={styles.taskNumber}>2.</Text>
            <Text style={styles.taskText}>Draw a clock showing {NOTEBOOK_CLOCK_TIME_SESSION3}</Text>
          </View>
          <View style={styles.clockGuideContainer}>
            <Text style={styles.guideLabel}>Guide:</Text>
            <Text style={styles.guideText}>Hour hand → {CLOCK_TIME_SESSION3.hourHandPosition}</Text>
            <Text style={styles.guideText}>Minute hand → {CLOCK_TIME_SESSION3.minuteHandPosition}</Text>
            <View style={styles.clockExampleWrapper}>
              <ClockExample />
            </View>
          </View>
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• Write the sentence clearly</Text>
          <Text style={styles.tipText}>• Draw a circle for the clock face</Text>
          <Text style={styles.tipText}>• Make sure the hour hand points to {CLOCK_TIME_SESSION3.hourHandPosition}</Text>
          <Text style={styles.tipText}>• Make sure the minute hand points to {CLOCK_TIME_SESSION3.minuteHandPosition}</Text>
          <Text style={styles.tipText}>• Take your time!</Text>
        </Animated.View>

        {/* Next Button */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
          <Pressable onPress={onNext} style={styles.nextButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>I'm Done! 📸</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  taskSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C9EFF',
    marginRight: 12,
    minWidth: 30,
  },
  taskText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    lineHeight: 28,
  },
  sentenceExample: {
    marginLeft: 42,
    marginBottom: 20,
  },
  sentenceText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C9EFF',
    letterSpacing: 1,
  },
  clockGuideContainer: {
    marginLeft: 42,
    marginTop: 16,
    alignItems: 'center',
  },
  guideLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  clockExampleWrapper: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
  },
  clockExampleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
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
