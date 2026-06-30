/**
 * Game 2 — Hide Hollow: place the boy BEHIND tree or house.
 * Logic Lab · Section 6 · Session 5 (Preposition BEHIND)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ANCHORS = [
  { id: 'tree', label: 'Tree', emoji: '🌳', accent: '#22C55E', tag: 'Forest cover' },
  { id: 'house', label: 'House', emoji: '🏠', accent: '#A16207', tag: 'Home cover' },
] as const;

type AnchorId = (typeof ANCHORS)[number]['id'];

const VOICE = 'Place the boy BEHIND the object. Tap the boy, then tap tree or house.';

const TRAIL = { deep: '#14532D', glow: '#4ADE80', bark: '#A16207', mist: '#94A3B8' } as const;

function BoyChip({ selected, onPress }: { selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(selected ? 1.06 : 1, { damping: 10 });
  }, [selected, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={[styles.boyChip, selected && styles.boyChipSelected]}
        accessibilityLabel={`Boy${selected ? ', selected' : ''}`}
        accessibilityState={{ selected }}
      >
        <Text style={styles.boyEmoji}>👦</Text>
        <Text style={styles.boyLabel}>Boy</Text>
        {selected && <Text style={styles.boyBadge}>READY</Text>}
      </Pressable>
    </Animated.View>
  );
}

function AnchorPad({
  anchor,
  boyBehind,
  ready,
  snapKey,
  onPress,
}: {
  anchor: (typeof ANCHORS)[number];
  boyBehind: boolean;
  ready: boolean;
  snapKey: number;
  onPress: () => void;
}) {
  const pulse = useSharedValue(0);
  const snap = useSharedValue(1);

  useEffect(() => {
    if (!ready) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 550 }), withTiming(0, { duration: 550 })),
      -1,
      false,
    );
  }, [ready, pulse]);

  useEffect(() => {
    if (snapKey === 0) return;
    snap.value = withSequence(withSpring(1.08, { damping: 7 }), withSpring(1));
  }, [snapKey, snap]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: snap.value }],
    borderColor: ready ? `rgba(74,222,128,${0.45 + pulse.value * 0.4})` : LL.glassBorder,
  }));

  return (
    <Animated.View style={[styles.padOuter, anim]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && styles.pressed]}>
        <LinearGradient colors={[`${anchor.accent}44`, 'rgba(15,23,42,0.55)']} style={styles.padGrad} />
        <Text style={styles.padTag}>BEHIND ZONE</Text>
        <View style={styles.sceneRow}>
          <View style={styles.rearSlot}>
            {boyBehind ? (
              <Text style={styles.peekBoy}>👦</Text>
            ) : (
              <Text style={styles.rearEmpty}>◀</Text>
            )}
          </View>
          <View style={styles.anchorCore}>
            <Text style={styles.padEmoji}>{anchor.emoji}</Text>
            <Text style={styles.padLabel}>{anchor.label}</Text>
          </View>
        </View>
        <Text style={styles.padHint}>{anchor.tag}</Text>
        <Text style={styles.padCue}>{ready ? 'Tap to hide behind' : boyBehind ? 'Boy is behind!' : 'Boy hides at the back'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DragBehindObject({ onComplete }: { onComplete: () => void }) {
  const [selectedBoy, setSelectedBoy] = useState(false);
  const [placedBehind, setPlacedBehind] = useState<AnchorId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapKey, setSnapKey] = useState(0);

  const phase = selectedBoy ? 'drop' : 'pick';

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleAnchorTap = useCallback(
    (anchorId: AnchorId) => {
      if (placedBehind) return;
      if (!selectedBoy) {
        speak('Pick the boy from the trail first.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
      const anchor = ANCHORS.find((a) => a.id === anchorId)!;
      speak(`The boy is BEHIND the ${anchor.label}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSnapKey((k) => k + 1);
      setPlacedBehind(anchorId);
      setSelectedBoy(false);
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2400);
    },
    [selectedBoy, placedBehind, onComplete],
  );

  const coachLine =
    phase === 'pick'
      ? 'Tap the boy — then hide him BEHIND the tree or house.'
      : 'Tap tree or house to place the boy at the BACK.';

  if (showSuccess) {
    const where = ANCHORS.find((a) => a.id === placedBehind)?.label ?? 'object';
    return (
      <SuccessCelebration
        variant="mint"
        title="Hide Hollow!"
        subtitle={`Boy is BEHIND the ${where}!`}
        badgeEmoji="👦"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="HIDE HOLLOW · GAME 2"
      title="Place the boy BEHIND"
      instruction="Tap the boy, then tap tree or house to hide him at the back."
      mascot="👦"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 5 · BEHIND</Text>
      </View>

      <View style={styles.phaseRow}>
        <View style={[styles.phase, phase === 'pick' && styles.phaseOn]}>
          <Text style={styles.phaseNum}>1</Text>
          <Text style={styles.phaseTxt}>Pick Boy</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={[styles.phase, phase === 'drop' && styles.phaseOn]}>
          <Text style={styles.phaseNum}>2</Text>
          <Text style={styles.phaseTxt}>Hide BEHIND</Text>
        </View>
      </View>

      <View style={styles.depot}>
        <Text style={styles.depotLabel}>TRAIL DEPOT</Text>
        {!placedBehind ? (
          <BoyChip selected={selectedBoy} onPress={() => setSelectedBoy((s) => !s)} />
        ) : (
          <Text style={styles.depotDone}>Boy hidden ✓</Text>
        )}
      </View>

      <View style={styles.padsRow}>
        {ANCHORS.map((a) => (
          <AnchorPad
            key={a.id}
            anchor={a}
            boyBehind={placedBehind === a.id}
            ready={selectedBoy && !placedBehind}
            snapKey={snapKey}
            onPress={() => handleAnchorTap(a.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(20,83,45,0.2)',
    borderWidth: 1,
    borderColor: `${TRAIL.glow}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: TRAIL.glow },
  phaseRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14 },
  phase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  phaseOn: { borderColor: TRAIL.glow, backgroundColor: 'rgba(20,83,45,0.2)' },
  phaseNum: { fontSize: 12, fontWeight: '900', color: TRAIL.glow },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: LL.textLight },
  arrow: { color: LL.textMuted, fontWeight: '700' },
  depot: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  depotLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: TRAIL.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  depotDone: { fontSize: 15, fontWeight: '700', color: LL.good, paddingVertical: 10 },
  boyChip: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.6)',
    minWidth: 110,
  },
  boyChipSelected: { borderColor: TRAIL.glow, backgroundColor: 'rgba(20,83,45,0.2)' },
  boyEmoji: { fontSize: 44 },
  boyLabel: { fontSize: 15, fontWeight: '900', color: LL.textLight, marginTop: 4 },
  boyBadge: { marginTop: 4, fontSize: 8, fontWeight: '900', color: TRAIL.glow, letterSpacing: 0.8 },
  padsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  padOuter: { borderRadius: 22, borderWidth: 2.5 },
  pad: {
    width: 158,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  padGrad: { ...StyleSheet.absoluteFillObject },
  pressed: { opacity: 0.9 },
  padTag: { marginTop: 10, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: TRAIL.glow },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    width: '100%',
  },
  rearSlot: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(74,222,128,0.35)',
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rearEmpty: { fontSize: 16, fontWeight: '900', color: TRAIL.mist },
  peekBoy: { fontSize: 26 },
  anchorCore: { alignItems: 'center', minWidth: 64 },
  padEmoji: { fontSize: 40 },
  padLabel: { fontSize: 14, fontWeight: '900', color: LL.textLight },
  padHint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 6 },
  padCue: { fontSize: 10, fontWeight: '700', color: TRAIL.glow, marginTop: 4, textAlign: 'center' },
});
