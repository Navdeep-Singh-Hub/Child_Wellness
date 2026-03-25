// Notebook Task Screen - Write CAT, DOG, BAT and draw symmetrical butterfly
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../builder/utils/audio';

interface NotebookTaskScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function NotebookTaskScreen({ onNext, onBack }: NotebookTaskScreenProps) {
  useEffect(() => {
    speakInstruction(
      'Write the words CAT, DOG, and BAT. Then draw a symmetrical butterfly with both wings matching.'
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
            <Text style={styles.taskText}>Write these words:</Text>
          </View>
          <View style={styles.wordExamples}>
            <Text style={styles.wordExample}>CAT</Text>
            <Text style={styles.wordExample}>DOG</Text>
            <Text style={styles.wordExample}>BAT</Text>
          </View>
          <View style={styles.taskSection}>
            <Text style={styles.taskNumber}>2.</Text>
            <Text style={styles.taskText}>Draw a symmetrical butterfly</Text>
          </View>
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Example:</Text>
            <View style={styles.butterflyExample}>
              <Text style={styles.butterflyEmoji}>🦋</Text>
            </View>
            <Text style={styles.exampleHint}>Both wings should look the same!</Text>
          </View>
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• Write neatly and spell correctly</Text>
          <Text style={styles.tipText}>• Draw a butterfly with matching wings</Text>
          <Text style={styles.tipText}>• Make sure both wings are symmetrical</Text>
          <Text style={styles.tipText}>• Take your time and be careful!</Text>
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
  wordExamples: {
    marginLeft: 42,
    marginBottom: 20,
    gap: 12,
  },
  wordExample: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C9EFF',
    letterSpacing: 4,
  },
  exampleContainer: {
    marginTop: 16,
    marginLeft: 42,
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  butterflyExample: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  butterflyEmoji: {
    fontSize: 80,
  },
  exampleHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontStyle: 'italic',
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
