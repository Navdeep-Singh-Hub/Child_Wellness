import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';

interface Props {
  checking: boolean;
  predicted: string | null;
  confidence: number | null;
  feedback: string | null;
  expectedLetter: string;
  /** True only when the attempt passed the high-confidence correct gate (game may advance). */
  passed?: boolean;
  /** Clear drawing and dismiss last result so the child can try again. */
  onRetry?: () => void;
}

/** Stars + bar: on pass, bar is 100% and 5 stars (never show raw model % as “completion”). */
function attemptVisuals(
  confidence: number | null,
  passed: boolean
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
}: Props) {
  const { filled, barPct, percentLabel } = attemptVisuals(confidence, passed);

  if (checking) {
    return (
      <View style={styles.row}>
        <ActivityIndicator color="#1E40AF" />
        <Text style={styles.checking}>Checking your letter…</Text>
      </View>
    );
  }

  if (!predicted && !feedback) return null;

  const messageFailed = !passed && (predicted != null || feedback != null);
  const failCopy = feedback?.trim() || 'Try again! Draw the letter properly.';

  return (
    <View style={styles.box}>
      {predicted ? (
        <Text style={styles.mainLine}>
          You wrote: <Text style={styles.letter}>{predicted}</Text>
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
        <Pressable style={styles.retryBtn} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Try again">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checking: { fontSize: 15, fontWeight: '600', color: '#1E40AF' },
  box: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mainLine: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },
  letter: { fontSize: 20, fontWeight: '900', color: '#2563EB' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  stars: { fontSize: 18, letterSpacing: 2 },
  confLabel: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  perfect: { fontSize: 17, fontWeight: '800', color: '#047857', marginTop: 8 },
  feedbackSub: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 4, lineHeight: 20 },
  feedback: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 8, lineHeight: 22 },
  barBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  barFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
  barFillPass: { backgroundColor: '#10B981' },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
