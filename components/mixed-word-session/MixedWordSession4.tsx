/**
 * Level 4 Grouper — Session 4: Mixed Word Families
 * Hub → 4 games + mixed journal task → completion
 */
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { markSessionGameComplete } from '@/components/special-education/shared/useSessionIntroProgress';
import { WordFamilySortGame } from '@/components/grouper-session/session4/WordFamilySortGame';
import { RhymePairsGame } from '@/components/grouper-session/session4/RhymePairsGame';
import { SyllableClapGame } from '@/components/grouper-session/session4/SyllableClapGame';
import { ShapeSortingGame } from '@/components/grouper-session/session4/ShapeSortingGame';
import { MixedWordNotebookUpload } from '@/components/grouper-session/session4/MixedWordNotebookUpload';
import {
  GROUPER_S4_HUB_THEME as H,
  GROUPER_S4_QUESTS,
  GROUPER_SESSION,
} from '@/components/grouper-session/grouperSessionTheme';
import { OasisOrchardBackground } from '@/components/grouper-session/OasisOrchardBackground';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const PLAY_STEPS = 5;
const SESSION_TITLE = 'Session 4 · Mixed Families';
const SECTION_NUMBER = 4;
const SESSION_NUMBER = 4;

interface MixedWordSession4Props {
  onExit?: () => void;
}

export function MixedWordSession4({ onExit }: MixedWordSession4Props = {}) {
  const [step, setStep] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [taskCorrect, setTaskCorrect] = useState<boolean | null>(null);
  const [completedBuilds, setCompletedBuilds] = useState<Set<number>>(() => new Set());

  const markComplete = useCallback((buildStep: number) => {
    setCompletedBuilds((prev) => {
      const next = new Set(prev);
      next.add(buildStep);
      return next;
    });
    setDoneCount((c) => Math.min(c + 1, PLAY_STEPS));
  }, []);

  const advance = useCallback(async () => {
    if (step >= 1 && step <= 4) {
      await markSessionGameComplete(SECTION_NUMBER, SESSION_NUMBER, step);
    }
    markComplete(step);
    setStep((s) => Math.min(s + 1, 6));
  }, [markComplete, step]);

  const handleTaskComplete = useCallback(
    async (correct: boolean) => {
      setTaskCorrect(correct);
      if (correct) {
        await markSessionGameComplete(SECTION_NUMBER, SESSION_NUMBER, 5);
        markComplete(5);
      }
      setStep(6);
    },
    [markComplete]
  );

  if (step === 0) {
    const progressPct = Math.round((completedBuilds.size / PLAY_STEPS) * 100);
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[...H.gradient]}
          locations={[...H.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <OasisOrchardBackground />

        <SafeAreaView style={styles.hubSafe}>
          {onExit ? (
            <Pressable
              onPress={onExit}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={22} color={H.accentDeep} />
              <Text style={styles.backText}>Sessions</Text>
            </Pressable>
          ) : (
            <View style={styles.backSpacer} />
          )}

          <ScrollView contentContainerStyle={styles.hubScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hubHeader}>
              <Text style={styles.hubEyebrow}>Grouper · Session 4 · Oasis Orchard</Text>
              <Text style={styles.hubTitle}>{H.name}</Text>
              <Text style={styles.hubSession}>Mixed Word Families</Text>

              <View style={styles.exampleChip}>
                <Text style={styles.exampleText}>-at · -in · -un</Text>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {completedBuilds.size}/{PLAY_STEPS} builds
                </Text>
              </View>

              <View style={styles.speechBubble}>
                <Text style={styles.mascot}>{H.mascot}</Text>
                <View style={styles.bubbleBody}>
                  <Text style={styles.mascotName}>{H.mascotName} says:</Text>
                  <Text style={styles.hubPrompt}>
                    In the orchard, families grow side by side — sort them, rhyme across families, clap syllables, match shapes, then fill your journal!
                  </Text>
                </View>
              </View>
            </View>

            {GROUPER_S4_QUESTS.map((quest) => {
              const done = completedBuilds.has(quest.step);
              return (
                <Pressable
                  key={quest.step}
                  onPress={() => setStep(quest.step)}
                  style={({ pressed }) => [styles.questCard, pressed && styles.pressed]}
                  accessibilityLabel={`Build ${quest.step}: ${quest.label}`}
                >
                  <View style={[styles.questAccent, { backgroundColor: quest.theme.accent }]} />
                  <View style={styles.questIconWrap}>
                    <Text style={styles.questIcon}>{quest.theme.mascot}</Text>
                    {done ? (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.questText}>
                    <Text style={styles.questStep}>Build {quest.step}</Text>
                    <Text style={styles.questTitle}>{quest.label}</Text>
                    <Text style={styles.questDesc} numberOfLines={2}>
                      {quest.desc}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={H.inkMuted} />
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[...H.gradient]}
          locations={[...H.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <OasisOrchardBackground />
        <ConfettiEffect />
        <SuccessCelebration
          title="Great job sorting word families!"
          subtitle={`Word Family Explorer 🧺\n${SESSION_TITLE}\nCompleted ${doneCount}/${PLAY_STEPS} builds${
            taskCorrect === false ? '\nMixed Journal: try again next time!' : ''
          }`}
          badgeEmoji="⭐"
          variant="sunset"
        />
        <View style={styles.doneActions}>
          {onExit ? (
            <Pressable onPress={onExit} style={({ pressed }) => [pressed && styles.pressed]}>
              <LinearGradient
                colors={[...H.doneGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Back to sessions</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable onPress={() => setStep(0)} style={({ pressed }) => [pressed && styles.pressed]}>
              <LinearGradient
                colors={[...H.doneGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Back to builds</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  if (step === 1) {
    return (
      <WordFamilySortGame
        sessionTitle={SESSION_TITLE}
        currentStep={1}
        totalSteps={PLAY_STEPS}
        onBack={() => setStep(0)}
        onComplete={advance}
      />
    );
  }

  if (step === 2) {
    return (
      <RhymePairsGame
        sessionTitle={SESSION_TITLE}
        currentStep={2}
        totalSteps={PLAY_STEPS}
        onBack={() => setStep(0)}
        onComplete={advance}
      />
    );
  }

  if (step === 3) {
    return (
      <SyllableClapGame
        sessionTitle={SESSION_TITLE}
        currentStep={3}
        totalSteps={PLAY_STEPS}
        onBack={() => setStep(0)}
        onComplete={advance}
      />
    );
  }

  if (step === 4) {
    return (
      <ShapeSortingGame
        sessionTitle={SESSION_TITLE}
        currentStep={4}
        totalSteps={PLAY_STEPS}
        onBack={() => setStep(0)}
        onComplete={advance}
      />
    );
  }

  if (step === 5) {
    return (
      <MixedWordNotebookUpload
        sessionTitle={SESSION_TITLE}
        currentStep={5}
        totalSteps={PLAY_STEPS}
        onBack={() => setStep(0)}
        onComplete={handleTaskComplete}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  hubSafe: { flex: 1 },
  backSpacer: { height: Platform.OS === 'web' ? 12 : 8 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 8 : 4,
    marginLeft: 16,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: H.cardBorder,
    zIndex: 10,
    ...GROUPER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: H.accentDeep },
  hubScroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  hubHeader: { alignItems: 'center', gap: 10, marginBottom: 8 },
  hubEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: H.inkMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hubTitle: { fontSize: 28, fontWeight: '900', color: H.ink, textAlign: 'center' },
  hubSession: { fontSize: 15, fontWeight: '600', color: H.inkMuted, textAlign: 'center' },
  exampleChip: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 2,
    borderColor: H.accentSoft,
    borderRadius: GROUPER_SESSION.radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  exampleText: { fontSize: 18, fontWeight: '900', color: H.accentDeep, letterSpacing: 1 },
  progressRow: { width: '100%', alignItems: 'center', gap: 6, marginTop: 4 },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: H.accent, borderRadius: 999 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: H.inkMuted },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: H.card,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 14,
    width: '100%',
    marginTop: 6,
    ...GROUPER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: H.accentDeep, textTransform: 'uppercase' },
  hubPrompt: { fontSize: 14, fontWeight: '600', color: H.ink, lineHeight: 20 },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: H.card,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
    ...GROUPER_SESSION.shadow.card,
  },
  questAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  questIconWrap: { position: 'relative', marginLeft: 4 },
  questIcon: { fontSize: 38 },
  doneBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  questText: { flex: 1, gap: 2 },
  questStep: {
    fontSize: 11,
    fontWeight: '800',
    color: H.inkMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  questTitle: { fontSize: 17, fontWeight: '800', color: H.ink },
  questDesc: { fontSize: 13, color: H.inkMuted, lineHeight: 18 },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: GROUPER_SESSION.radius.button,
    alignItems: 'center',
    minWidth: 200,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  doneActions: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
