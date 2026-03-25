// Notebook Task Screen - Instructions for writing and drawing
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../builder/utils/audio';

interface NotebookTaskScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function NotebookTaskScreen({ onNext, onBack }: NotebookTaskScreenProps) {
  React.useEffect(() => {
    speakInstruction('Please complete the notebook tasks. Write CAT five times, draw one circle, and draw a cat.').catch(() => {});
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
        {/* Instructions Card */}
        <View style={styles.instructionCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={48} color="#6C9EFF" />
          </View>
          <Text style={styles.instructionTitle}>Complete these tasks in your notebook:</Text>
        </View>

        {/* Task 1 */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskNumber}>1</Text>
            <Text style={styles.taskTitle}>Write CAT five times</Text>
          </View>
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleText}>CAT</Text>
            <Text style={styles.exampleText}>CAT</Text>
            <Text style={styles.exampleText}>CAT</Text>
            <Text style={styles.exampleText}>CAT</Text>
            <Text style={styles.exampleText}>CAT</Text>
          </View>
        </View>

        {/* Task 2 */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskNumber}>2</Text>
            <Text style={styles.taskTitle}>Draw one circle</Text>
          </View>
          <View style={styles.circleExample}>
            <View style={styles.circleShape} />
          </View>
        </View>

        {/* Task 3 */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskNumber}>3</Text>
            <Text style={styles.taskTitle}>Draw a cat</Text>
          </View>
          <View style={styles.catExample}>
            <Text style={styles.catEmoji}>🐱</Text>
            <Text style={styles.catHint}>Draw a picture of a cat</Text>
          </View>
        </View>

        {/* Next Button */}
        <Pressable onPress={onNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#6C9EFF', '#818CF8']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>I'm Done! Take Photo →</Text>
          </LinearGradient>
        </Pressable>
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
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C9EFF',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  exampleContainer: {
    gap: 12,
  },
  exampleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C9EFF',
    textAlign: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  circleExample: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  circleShape: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#6C9EFF',
  },
  catExample: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  catEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  catHint: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
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
