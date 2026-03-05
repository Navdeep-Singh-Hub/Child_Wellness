// Dashboard page for The Clockwise
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();

  // Mock progress data - in real app, this would come from API
  const progressData = {
    comprehensionAccuracy: 85,
    clockReadingAccuracy: 80,
    measurementAccuracy: 90,
    sessionsCompleted: 1,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7', '#ECFDF5']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Progress Dashboard</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Comprehension Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="book" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Comprehension Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.comprehensionAccuracy}%`,
                    backgroundColor: '#FDE68A',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.comprehensionAccuracy}%</Text>
          </View>
        </View>

        {/* Clock Reading Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="time" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Clock Reading Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.clockReadingAccuracy}%`,
                    backgroundColor: '#A7F3D0',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.clockReadingAccuracy}%</Text>
          </View>
        </View>

        {/* Measurement Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="resize" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Measurement Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.measurementAccuracy}%`,
                    backgroundColor: '#BFDBFE',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.measurementAccuracy}%</Text>
          </View>
        </View>

        {/* Sessions Completed */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Sessions Completed</Text>
          </View>
          <Text style={styles.sessionsText}>{progressData.sessionsCompleted}</Text>
        </View>

        {/* Back to Games Button */}
        <Pressable
          onPress={() => router.push('/level-1/session-9')}
          style={styles.backToGamesButton}
        >
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.backToGamesGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="game-controller" size={20} color="#FFFFFF" />
            <Text style={styles.backToGamesText}>Back to Games</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  sessionsText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  backToGamesButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  backToGamesGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  backToGamesText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
