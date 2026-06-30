import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { MatcherIntroGame } from './MatcherIntroGame';
import { MatcherRecognitionGame } from './MatcherRecognitionGame';
import { MatcherTracingGame } from './MatcherTracingGame';
import { MatcherCopyGame } from './MatcherCopyGame';
import { MatcherPhotoTaskGame } from './MatcherPhotoTaskGame';
import { MATCHER_HUB_THEME as H, MATCHER_QUESTS, MATCHER_SESSION } from './matcherSessionTheme';
import { getMatcherSession } from './matcherCurriculum';
import { OceanReefBackground } from './OceanReefBackground';
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

const TOTAL_STEPS = 5;

export function MatcherSmallLettersSession({
  sessionNumber,
  onExit,
}: {
  sessionNumber: number;
  onExit?: () => void;
}) {
  const config = getMatcherSession(sessionNumber);
  const [step, setStep] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [completedGames, setCompletedGames] = useState<Set<number>>(() => new Set());

  const advance = useCallback(() => {
    setDoneCount((c) => Math.min(c + 1, TOTAL_STEPS));
    setCompletedGames((prev) => {
      const next = new Set(prev);
      if (step >= 1 && step <= TOTAL_STEPS) next.add(step);
      return next;
    });
    setStep((s) => Math.min(s + 1, 6));
  }, [step]);

  if (step === 0) {
    const progressPct = Math.round((completedGames.size / TOTAL_STEPS) * 100);
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[...H.gradient]}
          locations={[...H.gradientLocations]}
          style={StyleSheet.absoluteFill}
        />
        <OceanReefBackground />

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
              <Text style={styles.hubEyebrow}>Matcher · Small Letters</Text>
              <Text style={styles.hubTitle}>{H.name}</Text>
              <Text style={styles.hubSession}>
                Voyage {config.number} — {config.title} ({config.subtitle})
              </Text>

              <View style={styles.letterChipRow}>
                {config.letters.map((l) => (
                  <View key={l} style={styles.letterChip}>
                    <Text style={styles.letterChipText}>{l}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {completedGames.size}/{TOTAL_STEPS} quests
                </Text>
              </View>

              <View style={styles.speechBubble}>
                <Text style={styles.mascot}>{H.mascot}</Text>
                <View style={styles.bubbleBody}>
                  <Text style={styles.mascotName}>{H.mascotName} says:</Text>
                  <Text style={styles.hubPrompt}>Pick a quest below — finish all five to complete the voyage!</Text>
                </View>
              </View>
            </View>

            {MATCHER_QUESTS.map((quest) => {
              const done = completedGames.has(quest.step);
              const accent = quest.theme.accent;
              return (
                <Pressable
                  key={quest.step}
                  onPress={() => setStep(quest.step)}
                  style={({ pressed }) => [styles.questCard, pressed && styles.pressed]}
                  accessibilityLabel={`Quest ${quest.step}: ${quest.label}`}
                >
                  <View style={[styles.questAccent, { backgroundColor: accent }]} />
                  <View style={styles.questIconWrap}>
                    <Text style={styles.questIcon}>{quest.theme.mascot}</Text>
                    {done ? (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.questText}>
                    <Text style={styles.questStep}>Quest {quest.step}</Text>
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
        <OceanReefBackground />
        <ConfettiEffect />
        <SuccessCelebration
          title="Voyage Complete!"
          subtitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})\nCompleted ${doneCount}/${TOTAL_STEPS} quests`}
          badgeEmoji="🏆"
          variant="ocean"
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
                <Text style={styles.doneBtnText}>Back to quests</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const back = () => setStep(0);
  return (
    <View style={styles.safe}>
      {step === 1 && (
        <MatcherIntroGame
          letters={config.letters}
          sessionTitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})`}
          currentStep={1}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onComplete={advance}
        />
      )}
      {step === 2 && (
        <MatcherRecognitionGame
          letters={config.letters}
          sessionTitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})`}
          currentStep={2}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onComplete={advance}
        />
      )}
      {step === 3 && (
        <MatcherTracingGame
          letters={config.letters}
          sessionTitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})`}
          currentStep={3}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onComplete={advance}
        />
      )}
      {step === 4 && (
        <MatcherCopyGame
          letters={config.letters}
          sessionTitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})`}
          currentStep={4}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onComplete={advance}
        />
      )}
      {step === 5 && (
        <MatcherPhotoTaskGame
          letters={config.letters}
          sessionTitle={`Voyage ${config.number}: ${config.title} (${config.subtitle})`}
          currentStep={5}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onComplete={advance}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
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
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: H.cardBorder,
    zIndex: 10,
    ...MATCHER_SESSION.shadow.soft,
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
  letterChipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  letterChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: H.cardBorder,
    borderRadius: MATCHER_SESSION.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  letterChipText: { fontSize: 20, fontWeight: '800', color: H.accent },
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
    borderRadius: MATCHER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 14,
    width: '100%',
    marginTop: 6,
    ...MATCHER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: H.accentDeep, textTransform: 'uppercase' },
  hubPrompt: { fontSize: 14, fontWeight: '600', color: H.ink, lineHeight: 20 },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: H.card,
    borderRadius: MATCHER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
    ...MATCHER_SESSION.shadow.card,
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
  questStep: { fontSize: 11, fontWeight: '800', color: H.inkMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  questTitle: { fontSize: 17, fontWeight: '800', color: H.ink },
  questDesc: { fontSize: 13, color: H.inkMuted, lineHeight: 18 },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: MATCHER_SESSION.radius.button,
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
