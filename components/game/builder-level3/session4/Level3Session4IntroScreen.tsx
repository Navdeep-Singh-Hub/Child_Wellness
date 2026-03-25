// Level 3 Session 4 - Introduction Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Level3Session4IntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Level3Session4IntroScreen({ onNext, onBack }: Level3Session4IntroScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.titleContainer}>
          <Text style={styles.title}>Level 3</Text>
          <Text style={styles.subtitle}>The Builder</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Session 4</Text>
          <Text style={styles.infoSubtitle}>Word HAT + Shape Rectangle</Text>
          <Text style={styles.description}>
            Learn to recognize and build the word HAT, and identify rectangle shapes!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="book" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>Word Building</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="square" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>Rectangle Shapes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pencil" size={32} color="#FFFFFF" />
            <Text style={styles.featureText}>Writing Practice</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800)}>
          <Pressable onPress={onNext} style={styles.nextButton}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Let's Start! 🎉</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6C9EFF',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 20,
    minWidth: 100,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  nextButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C9EFF',
  },
});
