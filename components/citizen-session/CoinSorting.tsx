/**
 * Game 3 — Sort coins by value. ₹1, ₹2, ₹5, ₹10 into four groups. Tap coin then group to assign. Session 3: Direction Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const COIN_VALUES = ['₹1', '₹2', '₹5', '₹10'] as const;
const VOICE = 'Sort the coins. Tap a coin, then tap the group it belongs to.';

type CoinValue = (typeof COIN_VALUES)[number];

export function CoinSorting({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinValue | null>(null);
  const [assignments, setAssignments] = useState<Record<CoinValue, CoinValue | null>>({
    '₹1': null,
    '₹2': null,
    '₹5': null,
    '₹10': null,
  });
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleCoinTap = useCallback((value: CoinValue) => {
    setSelectedCoin((prev) => (prev === value ? null : value));
  }, []);

  const handleGroupTap = useCallback(
    (groupValue: CoinValue) => {
      if (!selectedCoin) return;
      setAssignments((prev) => ({ ...prev, [selectedCoin]: groupValue }));
      setSelectedCoin(null);
    },
    [selectedCoin]
  );

  const allAssigned = COIN_VALUES.every((c) => assignments[c] !== null);
  const allCorrect = allAssigned && COIN_VALUES.every((c) => assignments[c] === c);

  useEffect(() => {
    if (!allAssigned || !allCorrect) return;
    speak('Correct! You sorted the coins!');
    setShowSuccess(true);
    const t = setTimeout(() => onComplete(), 2200);
    return () => clearTimeout(t);
  }, [allAssigned, allCorrect, onComplete]);

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You sorted the coins!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Sort the coins"
      instruction="Tap a coin, then tap the group it belongs to."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Put each coin in its value group</Text>
        <View style={styles.groupsRow}>
          {COIN_VALUES.map((groupValue) => {
            const coinInGroup = COIN_VALUES.find((c) => assignments[c] === groupValue);
            return (
              <View key={groupValue} style={styles.groupBox}>
                <Text style={styles.groupLabel}>{groupValue}</Text>
                <Pressable
                  onPress={() => handleGroupTap(groupValue)}
                  style={({ pressed }) => [
                    styles.groupSlot,
                    !!coinInGroup && styles.groupFilled,
                    selectedCoin && styles.groupHighlight,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={`Group ${groupValue}`}
                >
                  {coinInGroup ? (
                    <Text style={styles.slotCoin}>{coinInGroup}</Text>
                  ) : (
                    <Text style={styles.slotPlaceholder}>+</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
        <View style={styles.coinsRow}>
          {COIN_VALUES.map((value) => (
            <Animated.View
              key={value}
              style={[
                styles.coinChip,
                selectedCoin === value && styles.coinSelected,
                { transform: [{ translateX: selectedCoin === value ? 0 : shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleCoinTap(value)}
                style={({ pressed }) => [styles.coinTouch, pressed && styles.pressed]}
                accessibilityLabel={`Coin ${value}`}
              >
                <Text style={styles.coinText}>{value}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 20, textAlign: 'center' },
  groupsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  groupBox: { alignItems: 'center', minWidth: 72 },
  groupLabel: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 8 },
  groupSlot: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupFilled: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  groupHighlight: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  slotCoin: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  slotPlaceholder: { fontSize: 24, color: '#9CA3AF', fontWeight: '700' },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  coinChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  coinSelected: { borderColor: '#4F46E5', backgroundColor: '#FDE68A' },
  coinTouch: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.9 },
  coinText: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
});
