/**
 * Game 3 — Coin Sorter: Sort ₹1, ₹2, ₹5, ₹10 into matching value bays.
 */
import { CitizenGameShell } from '@/components/citizen-session/shared/CitizenGameShell';
import { CZ } from '@/components/citizen-session/shared/citizenTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const COIN_VALUES = ['₹1', '₹2', '₹5', '₹10'] as const;
type CoinValue = (typeof COIN_VALUES)[number];
const VOICE = 'Sort the coins. Tap a coin, then tap the group it belongs to.';

const COIN_SIZE: Record<CoinValue, number> = {
  '₹1': 70,
  '₹2': 76,
  '₹5': 82,
  '₹10': 88,
};

const DEPOT = { accent: '#14B8A6', glow: '#5EEAD4', amber: '#F59E0B', coinGlow: '#FCD34D' } as const;

function CoinOrb({
  value,
  selected,
  sorted,
  shake,
  onPress,
}: {
  value: CoinValue;
  selected: boolean;
  sorted: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const size = COIN_SIZE[value];

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
    opacity: sorted ? 0.4 : 1,
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={sorted}
        style={({ pressed }) => [
          styles.coin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: selected ? DEPOT.glow : `${DEPOT.amber}88`,
          },
          selected && styles.coinSelected,
          sorted && styles.coinSorted,
          pressed && !sorted && styles.pressed,
        ]}
        accessibilityLabel={`Coin ${value}`}
      >
        <LinearGradient
          colors={[`${DEPOT.coinGlow}55`, `${DEPOT.amber}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: size / 2 }]}
        />
        <Text style={styles.coinText}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ValueBay({
  value,
  filledCoin,
  active,
  shake,
  onPress,
}: {
  value: CoinValue;
  filledCoin: CoinValue | null;
  active: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  useEffect(() => {
    scale.value = active ? withSpring(1.04, { damping: 10 }) : withTiming(1, { duration: 150 });
  }, [active, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.bayWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.bay,
          {
            borderColor: filledCoin
              ? CZ.good
              : active
                ? DEPOT.glow
                : `${DEPOT.accent}66`,
            backgroundColor: filledCoin ? 'rgba(52,211,153,0.12)' : 'rgba(11,10,26,0.55)',
          },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={`Group ${value}`}
      >
        <Text style={styles.bayLabel}>{value}</Text>
        <View style={styles.baySlot}>
          {filledCoin ? (
            <Text style={styles.slotCoin}>{filledCoin}</Text>
          ) : (
            <Text style={styles.slotPlaceholder}>+</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function CoinSorting({ onComplete }: { onComplete: () => void }) {
  const [sorted, setSorted] = useState<Set<CoinValue>>(new Set());
  const [placedIn, setPlacedIn] = useState<Partial<Record<CoinValue, CoinValue>>>({});
  const [selectedCoin, setSelectedCoin] = useState<CoinValue | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongBay, setWrongBay] = useState<CoinValue | null>(null);
  const [wrongCoin, setWrongCoin] = useState<CoinValue | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const sortedCount = sorted.size;
  const progressPct = (sortedCount / COIN_VALUES.length) * 100;

  const coinInBay = useMemo(() => {
    const map: Partial<Record<CoinValue, CoinValue>> = {};
    for (const coin of COIN_VALUES) {
      const bay = placedIn[coin];
      if (bay) map[bay] = coin;
    }
    return map;
  }, [placedIn]);

  const handleCoinTap = useCallback(
    (value: CoinValue) => {
      if (sorted.has(value)) return;
      setSelectedCoin((prev) => (prev === value ? null : value));
      setWrongBay(null);
      setWrongCoin(null);
      speak(value, 0.6);
    },
    [sorted],
  );

  const handleBayTap = useCallback(
    (bayValue: CoinValue) => {
      if (!selectedCoin) return;
      if (coinInBay[bayValue]) return;

      if (selectedCoin !== bayValue) {
        setWrongBay(bayValue);
        setWrongCoin(selectedCoin);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Match each coin to its value group.', 0.7);
        setSelectedCoin(null);
        setTimeout(() => {
          setWrongBay(null);
          setWrongCoin(null);
        }, 750);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak('Correct!', 0.6);
      setSorted((s) => new Set(s).add(selectedCoin));
      setPlacedIn((p) => ({ ...p, [selectedCoin]: bayValue }));
      setSelectedCoin(null);

      if (sorted.size + 1 >= COIN_VALUES.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [coinInBay, onComplete, selectedCoin, sorted.size],
  );

  const coachLine = selectedCoin
    ? `Tap the ${selectedCoin} bay for this coin`
    : sortedCount === 0
      ? 'Pick a coin from the vault, then sort it into the matching value bay!'
      : `${sortedCount} of ${COIN_VALUES.length} sorted — keep going!`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Coin Sorter!"
        subtitle="You sorted all the coins!"
        badgeEmoji="🪙"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="COIN SORTER · GAME 3"
      title="Sort the coins"
      instruction="Tap a coin, then tap the group it belongs to."
      mascot="🪙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseStrip}>
        <View style={[styles.phasePill, selectedCoin ? styles.phaseDone : styles.phaseActive]}>
          <Text style={styles.phaseTxt}>1 · Pick</Text>
        </View>
        <Text style={styles.phaseArrow}>→</Text>
        <View style={[styles.phasePill, selectedCoin ? styles.phaseActive : styles.phaseIdle]}>
          <Text style={styles.phaseTxt}>2 · Sort</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>COINS SORTED</Text>
          <Text style={styles.progressCount}>
            {sortedCount} / {COIN_VALUES.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[DEPOT.accent, DEPOT.amber]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.vaultFrame}>
        <LinearGradient
          colors={[`${DEPOT.amber}33`, 'transparent', `${DEPOT.accent}22`]}
          style={styles.vaultGlow}
        />
        <Text style={styles.vaultLabel}>COIN VAULT</Text>
        <View style={styles.coinsRow}>
          {COIN_VALUES.map((value) => (
            <CoinOrb
              key={value}
              value={value}
              selected={selectedCoin === value}
              sorted={sorted.has(value)}
              shake={wrongCoin === value}
              onPress={() => handleCoinTap(value)}
            />
          ))}
        </View>
      </View>

      <Text style={styles.baysTitle}>VALUE BAYS</Text>
      <View style={styles.baysRow}>
        {COIN_VALUES.map((value) => (
          <ValueBay
            key={value}
            value={value}
            filledCoin={coinInBay[value] ?? null}
            active={!!selectedCoin}
            shake={wrongBay === value}
            onPress={() => handleBayTap(value)}
          />
        ))}
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  phaseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  phasePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  phaseActive: {
    backgroundColor: 'rgba(20,184,166,0.22)',
    borderColor: DEPOT.glow,
  },
  phaseDone: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: CZ.good,
  },
  phaseIdle: {
    backgroundColor: 'rgba(11,10,26,0.5)',
    borderColor: CZ.glassBorder,
  },
  phaseTxt: { fontSize: 12, fontWeight: '800', color: CZ.textLight },
  phaseArrow: { fontSize: 14, fontWeight: '900', color: CZ.textMuted },
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
    color: DEPOT.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CZ.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  vaultFrame: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${DEPOT.amber}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  vaultGlow: { ...StyleSheet.absoluteFillObject },
  vaultLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DEPOT.coinGlow,
    marginBottom: 12,
  },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  coin: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinSelected: { backgroundColor: 'rgba(20,184,166,0.18)' },
  coinSorted: { borderColor: `${CZ.good}66` },
  coinText: { fontSize: 20, fontWeight: '900', color: CZ.textLight },
  baysTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DEPOT.glow,
    textAlign: 'center',
    marginBottom: 10,
  },
  baysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  bayWrap: { minWidth: 72 },
  bay: {
    borderRadius: 14,
    borderWidth: 2.5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  bayLabel: { fontSize: 14, fontWeight: '900', color: DEPOT.glow, marginBottom: 8 },
  baySlot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: CZ.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCoin: { fontSize: 18, fontWeight: '900', color: CZ.textLight },
  slotPlaceholder: { fontSize: 22, fontWeight: '800', color: CZ.textMuted },
  pressed: { opacity: 0.88 },
});
