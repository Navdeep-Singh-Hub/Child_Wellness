/**
 * Shared intro · play · complete flow for Reader session orchestrators.
 */
import { ReaderBackdrop } from '@/components/reader-session/shared/ReaderBackdrop';
import { RD } from '@/components/reader-session/shared/readerTheme';
import type { ReaderSessionConfig } from '@/components/reader-session/shared/readerSessionConfigs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TOTAL_GAMES = 5;

type Props = {
  config: ReaderSessionConfig;
  onExit?: () => void;
  renderGame: (
    step: number,
    advance: () => void,
    taskComplete: (correct: boolean) => void,
  ) => React.ReactNode;
};

function FinaleCelebration({
  config,
  onDone,
}: {
  config: ReaderSessionConfig;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <SuccessCelebration
      variant="sunset"
      title={config.finaleCelebrationTitle ?? 'Level Complete!'}
      subtitle={config.finaleCelebrationSubtitle ?? 'Next level unlocked!'}
      badgeEmoji="🏆"
    />
  );
}

export function ReaderSessionFlow({ config, onExit, renderGame }: Props) {
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [taskCorrect, setTaskCorrect] = useState<boolean | null>(null);
  const [showFinaleCelebration, setShowFinaleCelebration] = useState(false);

  const { palette: P } = config;

  const advance = useCallback(() => {
    setStars((s) => Math.min(s + 1, TOTAL_GAMES));
    setStep((g) => Math.min(g + 1, 6));
  }, []);

  const handleTaskComplete = useCallback(
    (correct: boolean) => {
      setTaskCorrect(correct);
      if (correct) {
        setStars((s) => Math.min(s + 1, TOTAL_GAMES));
        if (config.isFinale) {
          setShowFinaleCelebration(true);
          return;
        }
      }
      setStep(6);
    },
    [config.isFinale],
  );

  const progressPct = step >= 1 && step <= 5 ? (step / TOTAL_GAMES) * 100 : 0;

  const goBack = () => {
    if (onExit) {
      onExit();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  if (showFinaleCelebration && taskCorrect) {
    return (
      <FinaleCelebration
        config={config}
        onDone={() => {
          setShowFinaleCelebration(false);
          setStep(6);
        }}
      />
    );
  }

  if (step === 0) {
    return (
      <View style={styles.root}>
        <ReaderBackdrop />
        <SafeAreaView style={styles.safe}>
          {onExit ? (
            <Pressable
              onPress={onExit}
              style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={P.glow} />
              <Text style={[styles.backTxt, { color: P.glow }]}>Back</Text>
            </Pressable>
          ) : null}
          <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hubBadge}>
              <Text style={[styles.hubBadgeTxt, { color: P.glow }]}>
                THE READER · SESSION {config.sessionNumber}
              </Text>
            </View>
            <Text style={styles.mascot}>🚀</Text>
            <Text style={styles.introTitle}>{config.hubTitle}</Text>
            <Text style={[styles.introSub, { color: P.glow }]}>{config.hubSubtitle}</Text>

            {config.example ? (
              <View style={[styles.exampleBox, { borderColor: `${P.accent}66` }]}>
                <Text style={[styles.exampleLabel, { color: P.glow }]}>EXAMPLE</Text>
                <Text style={styles.exampleEmojis}>{config.example.emojis}</Text>
                <Text style={[styles.exampleCaption, { color: P.accent }]}>{config.example.label}</Text>
              </View>
            ) : null}

            {config.tags ? (
              <View style={styles.tagsRow}>
                {config.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { borderColor: `${P.accent}55`, backgroundColor: `${P.accent}18` }]}
                  >
                    <Text style={[styles.tagTxt, { color: P.glow }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.cardsWrap}>
              {config.cards.map((card, i) => {
                const gameNum = i + 1;
                return (
                  <Pressable
                    key={card.title}
                    onPress={() => setStep(gameNum)}
                    style={({ pressed }) => [
                      styles.introCard,
                      { borderColor: `${P.accent}88` },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${card.title}. Tap to play.`}
                  >
                    <LinearGradient
                      colors={[`${P.accent}33`, 'rgba(11,10,26,0.55)']}
                      style={styles.cardGrad}
                    />
                    <Text style={styles.introCardIcon}>{card.icon}</Text>
                    <View style={styles.cardTextCol}>
                      <Text style={styles.introCardTitle}>{card.title}</Text>
                      <Text style={styles.introCardDesc}>{card.desc}</Text>
                    </View>
                    <Text style={[styles.cardNum, { color: P.glow }]}>{gameNum}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setStep(1)} style={({ pressed }) => [pressed && styles.pressed]}>
              <LinearGradient
                colors={[P.accent, P.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtn}
              >
                <Text style={styles.startBtnText}>Launch</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.root}>
        <ReaderBackdrop />
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultEmoji}>{config.isFinale && taskCorrect ? '🏆' : '🌌'}</Text>
            <Text style={styles.resultTitle}>{config.resultTitle}</Text>
            {config.isFinale && taskCorrect && config.unlockMessage ? (
              <Text style={styles.unlockText}>{config.unlockMessage}</Text>
            ) : null}
            <View
              style={[
                styles.resultBadge,
                { borderColor: RD.good, backgroundColor: 'rgba(52,211,153,0.12)' },
              ]}
            >
              <Text style={styles.resultBadgeEmoji}>{config.resultBadgeEmoji}</Text>
              <Text style={styles.resultBadgeText}>{config.resultBadge}</Text>
            </View>
            <View style={styles.resultStats}>
              <Text style={styles.resultStat}>Games completed: {stars}</Text>
              <Text style={styles.resultStat}>
                Real-world task: {taskCorrect === null ? '—' : taskCorrect ? '✓ SUCCESS' : 'Try again'}
              </Text>
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: TOTAL_GAMES }, (_, i) => (
                <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>
                  ⭐
                </Text>
              ))}
            </View>
            {onExit ? (
              <TouchableOpacity
                onPress={onExit}
                activeOpacity={0.85}
                style={[styles.backBtn, { backgroundColor: P.accent }]}
              >
                <Text style={styles.backBtnText}>Back to sessions</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ReaderBackdrop />
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: `${P.accent}88` }]}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={P.glow} />
            <Text style={[styles.backTxt, { color: P.glow }]}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{config.hubTitle}</Text>
          <Text style={[styles.headerSub, { color: P.glow }]}>
            The Reader · Session {config.sessionNumber}
          </Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[P.accent, P.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPct}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: P.glow }]}>
              {step} / {TOTAL_GAMES}
            </Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_GAMES }, (_, i) => (
              <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>
                ⭐
              </Text>
            ))}
          </View>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderGame(step, advance, handleTaskComplete)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: RD.bg[0] },
  safe: { flex: 1 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  backTxt: { fontSize: 16, fontWeight: '700' },
  introScroll: { flexGrow: 1, padding: 22, paddingBottom: 40 },
  hubBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: RD.glass,
    borderWidth: 1,
    borderColor: RD.glassBorder,
    marginBottom: 10,
  },
  hubBadgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  mascot: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  introSub: { fontSize: 17, textAlign: 'center', lineHeight: 24, marginBottom: 18 },
  exampleBox: {
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.55)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  exampleLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  exampleEmojis: { fontSize: 32, marginBottom: 6 },
  exampleCaption: { fontSize: 16, fontWeight: '800' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 18 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  tagTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  cardsWrap: { gap: 12, marginBottom: 24 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  cardGrad: { ...StyleSheet.absoluteFillObject },
  introCardIcon: { fontSize: 32 },
  cardTextCol: { flex: 1 },
  introCardTitle: { fontSize: 16, fontWeight: '800', color: RD.textLight },
  introCardDesc: { fontSize: 13, fontWeight: '600', color: RD.textMuted, marginTop: 2 },
  cardNum: { fontSize: 14, fontWeight: '900' },
  startBtn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  pressed: { opacity: 0.88 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.45)',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: RD.textLight, textAlign: 'center' },
  headerSub: { fontSize: 13, textAlign: 'center', marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  progressBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: 14, fontWeight: '800', minWidth: 44 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 4 },
  star: { fontSize: 22, opacity: 0.3 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 56, marginBottom: 12 },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 32,
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '800',
    color: RD.goodGlow,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    gap: 10,
    marginBottom: 22,
  },
  resultBadgeEmoji: { fontSize: 34 },
  resultBadgeText: { fontSize: 20, fontWeight: '900', color: RD.goodGlow },
  resultStats: { marginBottom: 14 },
  resultStat: { fontSize: 16, fontWeight: '600', color: RD.textMuted, marginBottom: 4, textAlign: 'center' },
  backBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  backBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
