/**
 * Shared frame for Speech Level 2 (Action Imitation) games —
 * readable text, pre-game instructions, consistent UX.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type SpeechLevel2ShellProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  onClearSpeech: () => void;
  round: number;
  rounds: number;
  canPlay: boolean;
  onStart: () => void;
  phaseHint: string;
  children: React.ReactNode;
  /** Pre-game screen */
  startEmoji?: string;
  startTitle?: string;
  startHint?: string;
  /** Numbered steps shown before Start (falls back to subtitle-based steps) */
  instructionSteps?: string[];
  /** Spoken when user taps Start (optional) */
  onSpeakStart?: () => void;
  /** Extra row under hint during play (e.g. action avatar) */
  playHeaderExtra?: React.ReactNode;
};

function defaultSteps(subtitle: string): string[] {
  return [
    'Read the goal at the top.',
    subtitle,
    'Follow the yellow instruction bar while you play.',
    'Finish all rounds — every try is celebrated!',
  ];
}

export function SpeechLevel2Shell({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  onClearSpeech,
  round,
  rounds,
  canPlay,
  onStart,
  phaseHint,
  children,
  startEmoji = '⭐',
  startTitle = 'Get ready!',
  startHint,
  instructionSteps,
  onSpeakStart,
  playHeaderExtra,
}: SpeechLevel2ShellProps) {
  const steps = instructionSteps?.length ? instructionSteps : defaultSteps(subtitle);
  const hint =
    startHint ?? 'Take your time. Tap Start when you are ready to play.';

  const handleStart = () => {
    onStart();
    onSpeakStart?.();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              onClearSpeech();
              onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${accent}18` }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={3}>
              {subtitle}
            </Text>
          </View>
        </View>

        {!canPlay ? (
          <ScrollView
            style={styles.startScroll}
            contentContainerStyle={styles.startScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.startEmoji}>{startEmoji}</Text>
            <Text style={styles.startTitle}>{startTitle}</Text>

            <View style={[styles.instructionCard, { borderColor: accent }]}>
              <Text style={[styles.instructionHeading, { color: accent }]}>How to play</Text>
              {steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: accent }]}>
                    <Text style={styles.stepBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.startHint}>{hint}</Text>

            <Pressable
              style={[styles.startBtn, { backgroundColor: accent }]}
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityLabel="Start game"
            >
              <Text style={styles.startBtnText}>Start game</Text>
              <Ionicons name="play" size={22} color="#fff" style={styles.startBtnIcon} />
            </Pressable>
          </ScrollView>
        ) : (
          <>
            <View style={[styles.hintBar, { borderColor: accent }]}>
              <Ionicons name="information-circle" size={22} color={accent} />
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            {playHeaderExtra}
            <View style={styles.playArea}>{children}</View>
          </>
        )}

        <View style={styles.footer}>
          <View style={[styles.skillsPill, { borderColor: `${accent}55` }]}>
            <Text style={styles.skills}>{skills}</Text>
          </View>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { borderColor: accent }, i < round && { backgroundColor: accent }]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            Round {Math.min(round, rounds)} / {rounds}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

/** Readable label styles for in-game buttons (import in shared modules) */
export const speechLevel2ButtonStyles = StyleSheet.create({
  label: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  labelOn: { color: '#fff' },
  emoji: { fontSize: 42 },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12 },
  backText: { marginLeft: 6, fontWeight: '800', color: '#0F172A', fontSize: 17 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', lineHeight: 30 },
  subtitle: { fontSize: 16, color: '#334155', marginTop: 4, lineHeight: 22, fontWeight: '600' },
  startScroll: { flex: 1 },
  startScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    paddingBottom: 32,
  },
  startEmoji: { fontSize: 64, marginBottom: 8 },
  startTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  instructionHeading: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  stepText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: '#1E293B',
    fontWeight: '600',
  },
  startHint: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 380,
    marginBottom: 20,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
  },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  startBtnIcon: { marginLeft: 8 },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hintText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  playArea: { flex: 1, padding: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  skillsPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  skills: { fontSize: 14, color: '#334155', textAlign: 'center', fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, backgroundColor: '#FFFFFF' },
  progressText: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
});
