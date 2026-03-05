// Dashboard page for The Graduate
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();

  // Mock progress data - in real app, this would come from API
  const progressData = {
    storyAccuracy: 85,
    dialogueAccuracy: 90,
    wordProblemAccuracy: 80,
    levelCompleted: true,
  };

  const badgeGlow = useSharedValue(0);

  React.useEffect(() => {
    badgeGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: badgeGlow.value * 0.5,
  }));

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
        {/* Level 1 Graduate Badge */}
        {progressData.levelCompleted && (
          <Animated.View style={[styles.badgeContainer, badgeAnimatedStyle]}>
            <LinearGradient
              colors={['#FDE68A', '#FCD34D', '#FBBF24']}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trophy" size={64} color="#FFFFFF" />
              <Text style={styles.badgeText}>Level 1</Text>
              <Text style={styles.badgeSubtext}>Graduate!</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Story Sequencing Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="book" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Story Sequencing Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.storyAccuracy}%`,
                    backgroundColor: '#FDE68A',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.storyAccuracy}%</Text>
          </View>
        </View>

        {/* Dialogue Completion Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="chatbubbles" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Dialogue Completion Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.dialogueAccuracy}%`,
                    backgroundColor: '#A7F3D0',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.dialogueAccuracy}%</Text>
          </View>
        </View>

        {/* Word Problem Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="calculator" size={24} color="#FDE68A" />
            <Text style={styles.progressTitle}>Word Problem Accuracy</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressData.wordProblemAccuracy}%`,
                    backgroundColor: '#BFDBFE',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressData.wordProblemAccuracy}%</Text>
          </View>
        </View>

        {/* Back to Games Button */}
        <Pressable
          onPress={() => router.push('/level-1/session-10')}
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
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  badge: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  badgeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  badgeSubtext: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
