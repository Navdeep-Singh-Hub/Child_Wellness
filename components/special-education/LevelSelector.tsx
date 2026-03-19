import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSpecialEducationProgress, isUnlocked } from './shared/SpecialEducationProgress';

const SECTION_INFO: { [key: number]: { title: string; theme: string; emoji: string; color: string } } = {
  1: { title: 'Explorer', theme: 'Forest', emoji: '🌲', color: '#10B981' },
  2: { title: 'Matcher', theme: 'Sessions', emoji: '🌊', color: '#0EA5E9' },
  3: { title: 'Builder', theme: 'Mountain', emoji: '⛰️', color: '#8B5CF6' },
  4: { title: 'Grouper', theme: 'Desert', emoji: '🏜️', color: '#F59E0B' },
  5: { title: 'Counter', theme: 'Sky', emoji: '☁️', color: '#3B82F6' },
  6: { title: 'Logic Lab', theme: 'City', emoji: '🏙️', color: '#6366F1' },
  7: { title: 'Reader', theme: 'Space', emoji: '🚀', color: '#8B5CF6' },
  8: { title: 'Citizen', theme: 'Planet', emoji: '🪐', color: '#EC4899' },
  9: { title: 'Clockwise', theme: 'Galaxy', emoji: '🌌', color: '#6366F1' },
  10: { title: 'Graduate', theme: 'Space Station', emoji: '🛸', color: '#8B5CF6' },
};

interface LevelSelectorProps {
  section: number;
  onBack: () => void;
  onSelectLevel: (level: number) => void;
  onShowMap: () => void;
}

export function LevelSelector({ section, onBack, onSelectLevel, onShowMap }: LevelSelectorProps) {
  const sectionInfo = SECTION_INFO[section] || SECTION_INFO[1];
  const { progress } = useSpecialEducationProgress();
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  
  const sectionData = progress?.sections.find((s) => s.sectionNumber === section);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{sectionInfo.title}</Text>
          <Text style={styles.headerSubtitle}>{sectionInfo.theme} • 10 sessions</Text>
        </View>
        <TouchableOpacity onPress={onShowMap} style={styles.mapButton}>
          <Ionicons name="map" size={24} color={sectionInfo.color} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>{sectionInfo.emoji}</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>10 Sessions</Text>
            <Text style={styles.infoDescription}>
              Each session has 5 games. Complete a session to unlock the next.
            </Text>
          </View>
        </View>

        <View style={styles.levelsGrid}>
          {levels.map((sessionNum) => {
            const sessionData = sectionData?.sessions?.find((s) => s.sessionNumber === sessionNum);
            const unlocked = isUnlocked(progress, section, sessionNum, 1) || sessionNum === 1;
            const completed = sessionData?.completed || false;
            return (
              <TouchableOpacity
                key={sessionNum}
                style={[
                  styles.levelCard,
                  unlocked ? styles.levelCardUnlocked : styles.levelCardLocked,
                  unlocked && { borderColor: sectionInfo.color },
                  completed && { borderWidth: 3 },
                ]}
                onPress={() => unlocked && onSelectLevel(sessionNum)}
                disabled={!unlocked}
                activeOpacity={0.8}
              >
                <View style={[styles.levelIcon, { backgroundColor: `${sectionInfo.color}20` }]}>
                  <Text style={styles.levelNumber}>{sessionNum}</Text>
                  {completed && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={sectionInfo.color} />
                    </View>
                  )}
                </View>
                <Text style={styles.levelLabel}>
                  {section === 1 && sessionNum === 1 ? 'Free Hand & Grip' : section === 1 && sessionNum === 2 ? 'Controlled Scribbling' : section === 1 && sessionNum === 3 ? 'Letters E & F' : section === 1 && sessionNum === 4 ? 'Standing Lines' : section === 1 && sessionNum === 5 ? 'Sleeping + Slanting' : section === 1 && sessionNum === 6 ? 'Letters K & L' : section === 1 && sessionNum === 7 ? 'Letters M & N' : section === 1 && sessionNum === 8 ? 'Letters O & P' : section === 1 && sessionNum === 9 ? 'Letters Q & R' : section === 1 && sessionNum === 10 ? 'Explorer Master' : section === 3 && sessionNum === 1 ? 'Object & Shape Fun' : section === 3 && sessionNum === 2 ? 'Word Builder & More' : section === 3 && sessionNum === 3 ? 'Memory & Match' : section === 3 && sessionNum === 4 ? 'Colors & Patterns' : section === 3 && sessionNum === 5 ? 'Trace, Count & Sort' : section === 3 && sessionNum === 6 ? 'Memory, Direction & Match' : section === 3 && sessionNum === 7 ? 'Size, Numbers & Patterns' : section === 3 && sessionNum === 8 ? 'Emotions, Colors & More' : section === 3 && sessionNum === 9 ? 'Spot the Difference & Shapes' : section === 3 && sessionNum === 10 ? 'Builder Master (Final)' : section === 5 && sessionNum === 1 ? 'Patterns & Words' : section === 5 && sessionNum === 2 ? 'Count & Compare' : section === 5 && sessionNum === 3 ? 'Shapes & Sounds' : section === 5 && sessionNum === 4 ? 'Color & Match' : section === 5 && sessionNum === 5 ? 'Directions & Round' : section === 5 && sessionNum === 6 ? 'Spot, Count & Shapes' : section === 5 && sessionNum === 7 ? 'Pattern, Match & Build' : section === 5 && sessionNum === 8 ? 'Emotions, Match & Shapes' : section === 5 && sessionNum === 9 ? 'Logic, Memory & Shapes' : section === 5 && sessionNum === 10 ? 'Counter Master (Final)' : section === 7 && sessionNum === 1 ? 'Pattern, Memory & Sort' : section === 7 && sessionNum === 2 ? 'Number Sequence & Bicycle' : section === 7 && sessionNum === 3 ? 'Logic, Memory & APPLE' : section === 7 && sessionNum === 4 ? 'Count, Shapes & Sort' : section === 7 && sessionNum === 5 ? 'Pattern, HOUSE & Bridge' : section === 7 && sessionNum === 6 ? 'Puzzle, Animals & Count 15' : section === 7 && sessionNum === 7 ? 'Emotion, Memory, CHAIR & Sizes' : section === 7 && sessionNum === 8 ? 'Pattern, Number, Shape & Robot' : section === 7 && sessionNum === 9 ? 'Logic, Memory 14, TABLE & Colors' : section === 7 && sessionNum === 10 ? 'Reader Master (Final)' : section === 4 && sessionNum === 1 ? 'The -AT Word Family' : section === 4 && sessionNum === 2 ? 'The -IN Word Family' : section === 4 && sessionNum === 3 ? 'The -UN Word Family' : section === 4 && sessionNum === 4 ? 'Mixed Word Families' : section === 4 && sessionNum === 5 ? 'The -OP Word Family' : section === 4 && sessionNum === 6 ? 'The -AN Word Family' : section === 4 && sessionNum === 7 ? 'The -ET Word Family' : section === 4 && sessionNum === 8 ? 'The -IG Word Family' : section === 4 && sessionNum === 9 ? 'Family Sorting Challenge' : section === 4 && sessionNum === 10 ? 'The Grouper Master' : section === 2 && sessionNum === 1 ? 'Farm' : section === 2 && sessionNum === 2 ? 'Ocean Adventure' : section === 2 && sessionNum === 3 ? 'Jungle Safari' : section === 2 && sessionNum === 4 ? 'Space Journey' : section === 2 && sessionNum === 5 ? 'Garden World' : section === 2 && sessionNum === 6 ? 'Grocery Store' : section === 2 && sessionNum === 7 ? 'Music Party' : section === 2 && sessionNum === 8 ? 'Superheroes' : section === 2 && sessionNum === 9 ? 'Fairy Tale Forest' : section === 2 && sessionNum === 10 ? 'Celebration Party' : section === 6 && sessionNum === 1 ? 'Preposition: IN' : section === 6 && sessionNum === 2 ? 'Preposition: ON' : section === 6 && sessionNum === 3 ? 'Preposition: UNDER' : section === 6 && sessionNum === 4 ? 'Preposition: NEXT TO' : section === 6 && sessionNum === 5 ? 'Preposition: BEHIND' : section === 6 && sessionNum === 6 ? 'Preposition: BETWEEN' : section === 6 && sessionNum === 7 ? 'Mixed Prepositions Review' : section === 6 && sessionNum === 8 ? 'Pattern Builder' : section === 6 && sessionNum === 9 ? 'Sequence Master' : section === 6 && sessionNum === 10 ? 'Logic Lab Master' : section === 8 && sessionNum === 1 ? 'Safety Signs' : section === 8 && sessionNum === 2 ? 'Public Place Signs' : section === 8 && sessionNum === 3 ? 'Direction Signs' : section === 8 && sessionNum === 4 ? 'Store Signs' : section === 8 && sessionNum === 5 ? 'Traffic Signs' : section === 8 && sessionNum === 6 ? 'School Signs' : section === 8 && sessionNum === 7 ? 'Restaurant Signs' : section === 8 && sessionNum === 8 ? 'Emergency Signs' : section === 8 && sessionNum === 9 ? 'Community Signs' : section === 8 && sessionNum === 10 ? 'Citizen Master Challenge' : section === 9 && sessionNum === 1 ? 'Pattern, Memory, BRIDGE & Living/Non-living' : section === 9 && sessionNum === 2 ? 'Number Pattern, Spot 5, Pentagon & Bicycle' : section === 9 && sessionNum === 3 ? 'Logic, Memory 14, ORANGE & Square' : section === 9 && sessionNum === 4 ? 'Count 18, Hexagon, Tools & Kitchen/Garden/Bedroom' : section === 9 && sessionNum === 6 ? 'Visual Puzzle, Vehicles, Pattern & Count 20' : section === 9 && sessionNum === 8 ? 'Pattern, 3/9/27, Shape Puzzle & Robot' : section === 9 && sessionNum === 9 ? 'Logic, Memory 18, HOSPITAL & Same Size' : section === 9 && sessionNum === 10 ? 'Clockwise Master (Final)' : section === 10 && sessionNum === 1 ? 'Simple Conversations' : section === 10 && sessionNum === 2 ? 'Story Sentences' : section === 10 && sessionNum === 3 ? 'Question & Answer' : section === 10 && sessionNum === 4 ? 'Daily Stories' : section === 10 && sessionNum === 5 ? 'Social Dialogue' : section === 10 && sessionNum === 6 ? 'Story Understanding' : section === 10 && sessionNum === 7 ? 'Real Life Problems' : section === 10 && sessionNum === 8 ? 'Dialogue Builder' : section === 10 && sessionNum === 9 ? 'Story Problem Solver' : section === 10 && sessionNum === 10 ? 'Graduate Master Challenge' : `Session ${sessionNum}`}
                </Text>
                {!unlocked && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  mapButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 12,
  },
  infoEmoji: {
    fontSize: 40,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelCardUnlocked: {
    borderColor: '#E2E8F0',
  },
  levelCardLocked: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
    borderColor: '#E5E7EB',
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockBadge: {
    marginTop: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
});

