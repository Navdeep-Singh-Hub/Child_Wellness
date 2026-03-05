// Game 5: Mini Shop Game
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakTotal, speakFeedback, stopAllAudio } from '../utils/audio';
import { SHOP_ITEMS, getCoinCombination, CoinValue, COINS } from '../utils/gameData';

interface MiniShopGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

// Coin component
function CoinDisplay({ value, size = 50 }: { value: CoinValue; size?: number }) {
  const coin = COINS.find(c => c.value === value);
  return (
    <View style={[styles.coinCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={['#FDE68A', '#FCD34D']}
        style={[styles.coinGradient, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.coinSymbol, { fontSize: size * 0.3 }]}>{coin?.symbol}</Text>
      </LinearGradient>
    </View>
  );
}

export default function MiniShopGame({ onComplete, onBack }: MiniShopGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SHOP_ITEMS[0] | null>(null);
  const [availableCoins, setAvailableCoins] = useState<CoinValue[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<CoinValue[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

  useEffect(() => {
    loadRound();
  }, [round]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'mini-shop',
      });
      return;
    }

    const item = SHOP_ITEMS[round % SHOP_ITEMS.length];
    const coins = getCoinCombination(item.price);
    // Add extra coins to make it more interesting
    const extraCoins: CoinValue[] = [1, 2, 2];
    const allCoins = [...coins, ...extraCoins];
    
    setCurrentItem(item);
    setAvailableCoins(allCoins);
    setSelectedCoins([]);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleCoinSelect = (coin: CoinValue) => {
    if (!canSelect) return;

    setSelectedCoins(prev => [...prev, coin]);
    setAvailableCoins(prev => {
      const index = prev.indexOf(coin);
      if (index > -1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
    playSoundEffect('click');
  };

  const handleCoinRemove = (coin: CoinValue, index: number) => {
    if (!canSelect) return;

    setSelectedCoins(prev => prev.filter((_, i) => i !== index));
    setAvailableCoins(prev => [...prev, coin]);
    playSoundEffect('click');
  };

  const handlePay = async () => {
    if (!canSelect || !currentItem || selectedCoins.length === 0) return;

    setCanSelect(false);
    const total = selectedCoins.reduce((sum, coin) => sum + coin, 0);
    const correct = total === currentItem.price;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakTotal(total);
      await speakFeedback('Perfect payment!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentItem) return null;

  const selectedTotal = selectedCoins.reduce((sum, coin) => sum + coin, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Drag coins to pay for the item</Text>
      </View>

      {/* Shop Item */}
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.itemCard, cardAnimatedStyle]}>
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.itemGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
            <Text style={styles.itemName}>{currentItem.name}</Text>
            <Text style={styles.itemPrice}>₹{currentItem.price}</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Selected Coins */}
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedLabel}>Your Payment:</Text>
        <View style={styles.selectedCoinsRow}>
          {selectedCoins.length === 0 ? (
            <View style={styles.emptyPayment}>
              <Text style={styles.emptyPaymentText}>Tap coins below to pay</Text>
            </View>
          ) : (
            selectedCoins.map((coin, index) => (
              <Pressable
                key={`${coin}-${index}`}
                onPress={() => handleCoinRemove(coin, index)}
                style={styles.selectedCoinWrapper}
              >
                <CoinDisplay value={coin} size={60} />
              </Pressable>
            ))
          )}
        </View>
        {selectedCoins.length > 0 && (
          <Text style={styles.totalText}>Total: ₹{selectedTotal}</Text>
        )}
      </View>

      {/* Available Coins */}
      <View style={styles.availableContainer}>
        <Text style={styles.availableLabel}>Available Coins:</Text>
        <View style={styles.availableCoinsRow}>
          {availableCoins.map((coin, index) => (
            <Pressable
              key={`${coin}-${index}`}
              onPress={() => handleCoinSelect(coin)}
              disabled={!canSelect}
              style={styles.availableCoinWrapper}
            >
              <CoinDisplay value={coin} size={60} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Pay Button */}
      {selectedCoins.length > 0 && (
        <View style={styles.payContainer}>
          <Pressable
            onPress={handlePay}
            disabled={!canSelect}
            style={styles.payButton}
          >
            <LinearGradient
              colors={['#A7F3D0', '#6EE7B7']}
              style={styles.payGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.payText}>Pay ₹{selectedTotal}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  itemContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  itemCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  itemGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  itemEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  selectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectedLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedCoinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  emptyPayment: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyPaymentText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  selectedCoinWrapper: {
    marginBottom: 4,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 12,
  },
  availableContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  availableLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  availableCoinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  availableCoinWrapper: {
    marginBottom: 8,
  },
  coinCircle: {
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  coinGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FCD34D',
  },
  coinSymbol: {
    fontWeight: '800',
    color: '#1E293B',
  },
  payContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  payButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  payText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
