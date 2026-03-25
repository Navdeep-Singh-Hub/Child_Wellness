// Notebook Task Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORD_CAT } from '../utils/gameData';

interface NotebookTaskScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function NotebookTaskScreen({ onContinue, onBack }: NotebookTaskScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Practice in Your Notebook</Text>
      </View>

      {/* Instructions */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Write {WORD_CAT.word} five times</Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleText}>
                  {WORD_CAT.word} {'\n'}
                  {WORD_CAT.word} {'\n'}
                  {WORD_CAT.word} {'\n'}
                  {WORD_CAT.word} {'\n'}
                  {WORD_CAT.word}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Draw one circle</Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleEmoji}>⭕</Text>
              </View>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>Draw a cat</Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleEmoji}>{WORD_CAT.image}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <Pressable style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue to Upload</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  exampleContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  exampleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#6C9EFF',
    textAlign: 'center',
  },
  exampleEmoji: {
    fontSize: 64,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C9EFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
