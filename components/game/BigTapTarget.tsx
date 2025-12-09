import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, withSequence, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio as ExpoAudio } from 'expo-av';
import { SparkleBurst } from './FX';

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#F472B6', '#8B5CF6', '#06B6D4'];
const POP_URI = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const STAR_ICON = require('../../assets/icons/star.png');

const usePopSound = () => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    const { sound } = await ExpoAudio.Sound.createAsync({ uri: POP_URI }, { volume: 0.35, shouldPlay: false });
    soundRef.current = sound;
  }, []);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  const play = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).Audio) {
        const WebAudio = (window as any).Audio;
        const webSound = new WebAudio(POP_URI);
        webSound.volume = 0.3;
        webSound.play().catch(() => {});
        return;
      }
      await ensureSound();
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch { }
  }, [ensureSound]);

  return play;
};

interface BigTapTargetProps {
  onBack: () => void;
}

export const BigTapTarget: React.FC<BigTapTargetProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [targetsLeft, setTargetsLeft] = useState(12);
  const [done, setDone] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [sparkleKey, setSparkleKey] = useState(0);
  // soft pop reinforcement
  const playPop = usePopSound();

  const sizePct = 26; // 26% of screen (within 20–30% target)
  const radiusPct = sizePct / 2;

  const targetX = useSharedValue(50);
  const targetY = useSharedValue(50);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const spawnTarget = () => {
    const margin = radiusPct + 5; // avoid edges
    const x = margin + Math.random() * (100 - margin * 2);
    const y = margin + Math.random() * (100 - margin * 2);
    targetX.value = withTiming(x, { duration: 200 });
    targetY.value = withTiming(y, { duration: 200 });
    scale.value = withTiming(1, { duration: 180 });
    opacity.value = withTiming(1, { duration: 180 });
    setColor(randomColor());
  };

  const handleTap = () => {
    Haptics.selectionAsync().catch(() => {});
    playPop();
    scale.value = withSequence(withTiming(1.2, { duration: 80 }), withTiming(0, { duration: 120 }));
    opacity.value = withTiming(0, { duration: 140 });
    setSparkleKey(Date.now());
    setScore((s) => s + 1);
    setTargetsLeft((t) => {
      const next = t - 1;
      if (next <= 0) {
        runOnJS(setDone)(true);
      } else {
        runOnJS(spawnTarget)();
      }
      return next;
    });
  };

  useEffect(() => {
    spawnTarget();
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    width: `${sizePct}%`,
    height: `${sizePct}%`,
    borderRadius: 999,
    left: `${targetX.value}%`,
    top: `${targetY.value}%`,
    transform: [{ translateX: -(sizePct / 2) + '%' as any }, { translateY: -(sizePct / 2) + '%' as any }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.completion}>
          <Text style={styles.bigEmoji}>🌟</Text>
          <Text style={styles.title}>Great tapping!</Text>
          <Text style={styles.subtitle}>You popped {score} circles.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => {
            setScore(0);
            setTargetsLeft(12);
            setDone(false);
            spawnTarget();
          }}>
            <Text style={styles.primaryButtonText}>Play again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Back to sessions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.hud}>
        <View style={styles.hudCard}>
          <View style={styles.rowCenter}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.hudLabel}>Stars</Text>
          </View>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudCard}>
          <Text style={styles.hudLabel}>Targets Left</Text>
          <Text style={styles.hudValue}>{targetsLeft}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <LinearGradient
          colors={['#ECFEFF', '#EFF6FF']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.instructionWrap}>
          <Text style={styles.instructionTitle}>Tap the big bubble</Text>
          <Text style={styles.instructionSubtitle}>Burst it to earn a star, then find the next one!</Text>
        </View>
        <Animated.View style={[styles.circle, circleStyle]}>
          <TouchableOpacity style={styles.hitArea} activeOpacity={0.7} onPress={handleTap}>
            <LinearGradient
              colors={[color, '#fff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.circleFill}
            />
          </TouchableOpacity>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible color={color} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 70,
    paddingHorizontal: 16,
  },
  hudCard: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 120,
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '700',
  },
  hudValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  playArea: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  instructionWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  instructionSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  hitArea: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  circleFill: {
    flex: 1,
  },
  completion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 18,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});




