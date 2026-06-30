import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';

export type RecognitionFeedbackTheme = {
  accent: string;
  bg: string;
  border: string;
  text: string;
  letter: string;
  retryBg: string;
};

const DEFAULT_THEME: RecognitionFeedbackTheme = {
  accent: '#1E40AF',
  bg: '#EFF6FF',
  border: '#BFDBFE',
  text: '#1E3A8A',
  letter: '#2563EB',
  retryBg: '#2563EB',
};

interface Props {
  checking: boolean;
  predicted: string | null;
  confidence: number | null;
  feedback: string | null;
  expectedLetter: string;
  passed?: boolean;
  onRetry?: () => void;
  theme?: Partial<RecognitionFeedbackTheme>;
}

function attemptVisuals(
  confidence: number | null,
  passed: boolean,
): { filled: number; barPct: number; percentLabel: string | null } {
  if (passed) {
    return { filled: 5, barPct: 100, percentLabel: null };
  }
  if (confidence == null || !Number.isFinite(confidence)) {
    return { filled: 0, barPct: 0, percentLabel: null };
  }
  const c = Math.max(0, Math.min(100, confidence));
  let filled = 1;
  if (c >= 80) filled = 4;
  else if (c >= 60) filled = 3;
  else if (c >= 40) filled = 2;
  else filled = 1;
  return { filled, barPct: c, percentLabel: `${Math.round(c)}%` };
}

export function LetterRecognitionFeedback({
  checking,
  predicted,
  confidence,
  feedback,
  expectedLetter,
  passed = false,
  onRetry,
  theme: themePartial,
}: Props) {
  const theme = { ...DEFAULT_THEME, ...themePartial };
  const { filled, barPct, percentLabel } = attemptVisuals(confidence, passed);

  if (checking) {
    return (
      <View style={styles.row}>
        <ActivityIndicator color={theme.accent} />
        <Text style={[styles.checking, { color: theme.accent }]}>Checking your letter…</Text>
      </View>
    );
  }

  if (!predicted && !feedback) return null;

  const messageFailed = !passed && (predicted != null || feedback != null);
  const failCopy = feedback?.trim() || 'Try again! Draw the letter properly.';

  return (
    <View style={[styles.box, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {predicted ? (
        <Text style={[styles.mainLine, { color: theme.text }]}>
          You wrote: <Text style={[styles.letter, { color: theme.letter }]}>{predicted}</Text>
          {passed && predicted === expectedLetter ? ' ✓' : ''}
        </Text>
      ) : null}
      {confidence != null || passed ? (
        <>
          <View style={styles.starRow}>
            <Text style={styles.stars}>
              {'⭐'.repeat(filled)}
              {'☆'.repeat(5 - filled)}
            </Text>
            {percentLabel ? <Text style={styles.confLabel}>{percentLabel}</Text> : null}
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, passed && styles.barFillPass, { width: `${Math.min(100, barPct)}%` }]} />
          </View>
        </>
      ) : null}
      {passed ? <Text style={styles.perfect}>Great job!</Text> : null}
      {passed && feedback?.trim() ? <Text style={styles.feedbackSub}>{feedback.trim()}</Text> : null}
      {messageFailed && !passed ? <Text style={styles.feedback}>{failCopy}</Text> : null}
      {onRetry && !checking && !passed && (predicted != null || feedback) ? (
        <Pressable
          style={[styles.retryBtn, { backgroundColor: theme.retryBg }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checking: { fontSize: 15, fontWeight: '600' },
  box: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  mainLine: { fontSize: 16, fontWeight: '700' },
  letter: { fontSize: 20, fontWeight: '900' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  stars: { fontSize: 18, letterSpacing: 2 },
  confLabel: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  perfect: { fontSize: 17, fontWeight: '800', color: '#047857', marginTop: 8 },
  feedbackSub: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 4, lineHeight: 20 },
  feedback: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 8, lineHeight: 22 },
  barBg: { height: 10, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
  barFillPass: { backgroundColor: '#10B981' },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
