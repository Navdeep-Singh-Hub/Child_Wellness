/**
 * Level 7 Reader — Session 2, Game 2: Scanner Scope
 * Two images with 4 differences. User taps each difference on the right picture.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PICTURE_LEFT = ['🍎', '🌙', '⭐', '🐱', '🌻'];
const PICTURE_RIGHT = ['🍊', '☀️', '⭐', '🐕', '🌷'];
const DIFFERENCE_INDICES = [0, 1, 3, 4];
const TOTAL_DIFFS = 4;

const VOICE = 'Find 4 differences. Look at both pictures. Tap each difference on the right.';
const SCOPE = { accent: '#06B6D4', accentBright: '#67E8F9', rail: '#0891B2' } as const;

function ScanCell({
  emoji,
  index,
  tappable,
  found,
  isDiff,
  shake,
  onPress,
}: {
  emoji: string;
  index: number;
  tappable?: boolean;
  found?: boolean;
  isDiff?: boolean;
  shake?: boolean;
  onPress?: () => void;
}) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const content = (
    <View
      style={[
        styles.cell,
        tappable && styles.cellTappable,
        found && styles.cellFound,
        found && isDiff && styles.cellDiffFound,
      ]}
    >
      <Text style={styles.cellEmoji}>{emoji}</Text>
      {found ? <Text style={styles.cellMark}>✦</Text> : null}
      <Text style={styles.cellIdx}>{index + 1}</Text>
    </View>
  );

  if (!tappable || !onPress) {
    return <View style={styles.cellWrap}>{content}</View>;
  }

  return (
    <Animated.View style={[styles.cellWrap, anim]}>
      <Pressable
        onPress={onPress}
        disabled={found}
        style={({ pressed }) => [pressed && !found && styles.cellPressed]}
        accessibilityLabel={found ? 'Difference found' : `Scan item ${index + 1}`}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

export interface SpotTheDifferenceReaderSession2GameProps {
  onComplete: () => void;
}

export function SpotTheDifferenceReaderSession2Game({ onComplete }: SpotTheDifferenceReaderSession2GameProps) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const foundCount = found.size;
  const progressPct = (foundCount / TOTAL_DIFFS) * 100;

  const handleTap = useCallback(
    (index: number) => {
      if (found.has(index)) return;
      setWrongIndex(null);

      if (DIFFERENCE_INDICES.includes(index)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setFound((prev) => {
          const next = new Set(prev).add(index);
          if (next.size >= TOTAL_DIFFS) {
            speak('You found all 4 differences!', 0.75);
            setShowSuccess(true);
            setTimeout(() => onComplete(), 2400);
          } else {
            speak('Good! Find the next difference.', 0.7);
          }
          return next;
        });
      } else {
        setWrongIndex(index);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Find what is different on the right picture.', 0.7);
        setTimeout(() => setWrongIndex(null), 700);
      }
    },
    [found, onComplete],
  );

  const coachLine =
    foundCount === 0
      ? 'Compare both feeds — tap what changed on the right scan!'
      : `${foundCount} of ${TOTAL_DIFFS} locked in — keep scanning!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Scanner Scope!"
        subtitle="You found all 4 differences!"
        badgeEmoji="🔭"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="SCANNER SCOPE · GAME 2"
      title="Spot the difference"
      instruction="Find 4 differences. Tap each one on the right scan feed."
      mascot="🔭"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>DIFFERENCES LOCKED</Text>
          <Text style={styles.progressCount}>
            {foundCount} / {TOTAL_DIFFS}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[SCOPE.accent, RD.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
        <View style={styles.dotRow}>
          {Array.from({ length: TOTAL_DIFFS }, (_, i) => (
            <View key={i} style={[styles.dot, i < foundCount && styles.dotFilled]} />
          ))}
        </View>
      </View>

      <View style={styles.scanFrame}>
        <LinearGradient
          colors={[`${SCOPE.rail}33`, 'transparent', `${SCOPE.accent}22`]}
          style={styles.scanGlow}
        />
        <View style={styles.panelsRow}>
          <View style={styles.panel}>
            <Text style={styles.panelLabel}>BASE SIGNAL</Text>
            <View style={styles.cellsRow}>
              {PICTURE_LEFT.map((emoji, i) => (
                <ScanCell key={i} emoji={emoji} index={i} />
              ))}
            </View>
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerTxt}>VS</Text>
          </View>

          <View style={[styles.panel, styles.panelTarget]}>
            <Text style={[styles.panelLabel, styles.panelLabelTarget]}>SCAN TARGET</Text>
            <View style={styles.cellsRow}>
              {PICTURE_RIGHT.map((emoji, i) => (
                <ScanCell
                  key={i}
                  emoji={emoji}
                  index={i}
                  tappable
                  found={found.has(i)}
                  isDiff={DIFFERENCE_INDICES.includes(i)}
                  shake={wrongIndex === i}
                  onPress={() => handleTap(i)}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Tap only the changed icons on the right feed</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: SCOPE.accentBright,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: RD.glassBorder,
  },
  dotFilled: { backgroundColor: RD.good, borderColor: RD.goodGlow },
  scanFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SCOPE.accent}55`,
    backgroundColor: 'rgba(8,40,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  scanGlow: { ...StyleSheet.absoluteFillObject },
  panelsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  panel: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  panelTarget: { borderColor: `${SCOPE.accentBright}66` },
  panelLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: RD.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  panelLabelTarget: { color: SCOPE.accentBright },
  divider: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerTxt: { fontSize: 10, fontWeight: '900', color: SCOPE.accentBright },
  cellsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  cellWrap: { alignItems: 'center' },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: RD.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTappable: { borderColor: `${SCOPE.accent}66` },
  cellFound: { opacity: 0.55, borderColor: RD.good },
  cellDiffFound: { backgroundColor: 'rgba(52,211,153,0.12)' },
  cellPressed: { opacity: 0.88 },
  cellEmoji: { fontSize: 22 },
  cellMark: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: RD.goodGlow,
    fontWeight: '900',
  },
  cellIdx: {
    position: 'absolute',
    bottom: 1,
    left: 4,
    fontSize: 7,
    fontWeight: '900',
    color: RD.textMuted,
  },
  legend: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1,
    borderColor: `${SCOPE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: SCOPE.accentBright, textAlign: 'center' },
});
