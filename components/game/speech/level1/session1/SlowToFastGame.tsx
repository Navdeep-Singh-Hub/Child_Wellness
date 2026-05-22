import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NATIVE_EFFECT, NATIVE_MOVE } from '@/utils/animation';
import {
  speak as speakTTS,
  clearScheduledSpeech,
  DEFAULT_TTS_RATE,
  stopTTS,
} from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type GestureResponderEvent,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredTaps?: number;
};

const OBJECT_SIZE = 80;
const TAP_HIT_PADDING = Platform.select({ web: 36, default: 52 })!;

const SPEED_LEVELS = Platform.select({
  web: [
    { duration: 3000, label: 'Slow' },
    { duration: 2200, label: 'Medium' },
    { duration: 1800, label: 'Faster' },
  ],
  default: [
    { duration: 3500, label: 'Slow' },
    { duration: 2600, label: 'Medium' },
    { duration: 2000, label: 'Faster' },
  ],
})!;

function speak(text: string, rate = DEFAULT_TTS_RATE) {
  speakTTS(text, rate);
}

export const SlowToFastGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredTaps = 9,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [hits, setHits] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(0);
  const [missFeedback, setMissFeedback] = useState(false);
  const [showReinforcement, setShowReinforcement] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);

  const objectX = useRef(new Animated.Value(0)).current;
  const objectY = useRef(new Animated.Value(0)).current;
  const objectScale = useRef(new Animated.Value(1)).current;
  const objectOpacity = useRef(new Animated.Value(1)).current;
  const motionAnim = useRef<Animated.CompositeAnimation | null>(null);
  const motionGenerationRef = useRef(0);
  const objectPositionRef = useRef({ x: 0, y: 0 });
  const speedLevelRef = useRef(0);
  const isMovingRef = useRef(false);
  const gameFinishedRef = useRef(false);
  const tapLockedRef = useRef(false);

  useEffect(() => {
    gameFinishedRef.current = gameFinished;
  }, [gameFinished]);

  useEffect(() => {
    speedLevelRef.current = speedLevel;
  }, [speedLevel]);

  useEffect(() => {
    const idX = objectX.addListener(({ value }) => {
      objectPositionRef.current.x = value;
    });
    const idY = objectY.addListener(({ value }) => {
      objectPositionRef.current.y = value;
    });
    return () => {
      objectX.removeListener(idX);
      objectY.removeListener(idY);
    };
  }, [objectX, objectY]);

  const randomPointOnScreen = useCallback(() => {
    const margin = 60;
    const topMargin = 100;
    const bottomMargin = 180;
    return {
      x: margin + Math.random() * Math.max(1, SCREEN_WIDTH - margin * 2),
      y: topMargin + Math.random() * Math.max(1, SCREEN_HEIGHT - topMargin - bottomMargin),
    };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  const stopMotion = useCallback(() => {
    motionGenerationRef.current += 1;
    motionAnim.current?.stop();
    motionAnim.current = null;
    objectX.stopAnimation();
    objectY.stopAnimation();
  }, [objectX, objectY]);

  const startObjectMotion = useCallback(() => {
    if (gameFinishedRef.current) return;

    stopMotion();
    const generation = motionGenerationRef.current;
    const start = randomPointOnScreen();
    objectX.setValue(start.x);
    objectY.setValue(start.y);
    objectPositionRef.current = { x: start.x, y: start.y };
    isMovingRef.current = true;
    setIsMoving(true);

    const runStep = () => {
      if (
        gameFinishedRef.current ||
        generation !== motionGenerationRef.current ||
        !isMovingRef.current
      ) {
        return;
      }

      const level = Math.min(speedLevelRef.current, SPEED_LEVELS.length - 1);
      const duration = SPEED_LEVELS[level].duration;
      const target = randomPointOnScreen();

      motionAnim.current = Animated.parallel([
        Animated.timing(objectX, {
          toValue: target.x,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: NATIVE_MOVE,
        }),
        Animated.timing(objectY, {
          toValue: target.y,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: NATIVE_MOVE,
        }),
      ]);

      motionAnim.current.start(({ finished }) => {
        if (
          finished &&
          !gameFinishedRef.current &&
          generation === motionGenerationRef.current &&
          isMovingRef.current
        ) {
          runStep();
        }
      });
    };

    runStep();
  }, [randomPointOnScreen, stopMotion, objectX, objectY]);

  useEffect(() => {
    startObjectMotion();
    speak('Tap the object as it moves!');
    return () => {
      stopMotion();
      clearScheduledSpeech();
    };
  }, [startObjectMotion, stopMotion]);

  useEffect(() => {
    if (speedLevel > 0 && isMovingRef.current && !gameFinishedRef.current) {
      startObjectMotion();
    }
  }, [speedLevel, startObjectMotion]);

  const onHit = useCallback(() => {
    if (!isMovingRef.current || tapLockedRef.current || gameFinishedRef.current) return;

    tapLockedRef.current = true;
    isMovingRef.current = false;
    setIsMoving(false);
    stopMotion();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    Animated.parallel([
      Animated.timing(objectScale, {
        toValue: 1.5,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: NATIVE_EFFECT,
      }),
      Animated.timing(objectOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: NATIVE_EFFECT,
      }),
    ]).start(() => {
      setHits((prev) => {
        const nextHits = prev + 1;

        setShowRoundSuccess(true);
        setTimeout(() => setShowRoundSuccess(false), 2500);

        if (nextHits > 0 && nextHits % 3 === 0) {
          setShowReinforcement(true);
          setTimeout(() => setShowReinforcement(false), 2500);

          if (speedLevelRef.current < SPEED_LEVELS.length - 1) {
            const newLevel = speedLevelRef.current + 1;
            speedLevelRef.current = newLevel;
            setSpeedLevel(newLevel);
          }
        }

        if (nextHits >= requiredTaps) {
          setTimeout(() => {
            setShowRoundSuccess(false);
            stopMotion();
            setGameFinished(true);
            tapLockedRef.current = false;
          }, 2500);
          return nextHits;
        }

        setTimeout(() => {
          objectScale.setValue(1);
          objectOpacity.setValue(1);
          tapLockedRef.current = false;
          isMovingRef.current = true;
          setIsMoving(true);
          startObjectMotion();
        }, 600);

        return nextHits;
      });
    });
  }, [requiredTaps, startObjectMotion, stopMotion, objectScale, objectOpacity]);

  const handlePlayAreaPress = useCallback(
    (event: GestureResponderEvent) => {
      if (gameFinished || tapLockedRef.current || !isMovingRef.current) return;

      const { locationX, locationY } = event.nativeEvent;
      const centerX = objectPositionRef.current.x + OBJECT_SIZE / 2;
      const centerY = objectPositionRef.current.y + OBJECT_SIZE / 2;
      const hitRadius = OBJECT_SIZE / 2 + TAP_HIT_PADDING;

      if (Math.hypot(locationX - centerX, locationY - centerY) <= hitRadius) {
        onHit();
      } else {
        setMissFeedback(true);
        setTimeout(() => setMissFeedback(false), 500);
        try {
          Haptics.selectionAsync();
        } catch {}
      }
    },
    [gameFinished, onHit],
  );

  const currentSpeed = SPEED_LEVELS[Math.min(speedLevel, SPEED_LEVELS.length - 1)];
  const progressDots = Array.from({ length: Math.ceil(requiredTaps / 3) }, (_, i) =>
    Math.floor(hits / 3) > i,
  );

  if (gameFinished) {
    const accuracyPct = hits >= requiredTaps ? 100 : Math.round((hits / requiredTaps) * 100);
    const xpAwarded = hits * 10;
    return (
      <CongratulationsScreen
        message="Super Eyes!"
        showButtons={true}
        correct={hits}
        total={requiredTaps}
        accuracy={accuracyPct}
        xpAwarded={xpAwarded}
        onContinue={() => {
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={() => {
          clearScheduledSpeech();
          stopTTS();
          onBack();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            clearScheduledSpeech();
            stopTTS();
            onBack();
          }}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Slow → Fast Game</Text>
          <Text style={styles.subtitle}>
            Tap the object as it moves! Speed: {currentSpeed.label}
          </Text>
        </View>
      </View>

      <Pressable style={styles.playArea} onPress={handlePlayAreaPress}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.object,
            {
              width: OBJECT_SIZE,
              height: OBJECT_SIZE,
              borderRadius: OBJECT_SIZE / 2,
              transform: [{ translateX: objectX }, { translateY: objectY }],
            },
          ]}
        >
          <Animated.View
            style={{
              flex: 1,
              transform: [{ scale: objectScale }],
              opacity: objectOpacity,
            }}
          >
            <Text style={styles.objectEmoji}>⭐</Text>
          </Animated.View>
        </Animated.View>

        {missFeedback && (
          <View style={styles.missBadge} pointerEvents="none">
            <Text style={styles.missText}>Try again!</Text>
          </View>
        )}

        {showReinforcement && (
          <View style={styles.reinforcementBadge} pointerEvents="none">
            <Text style={styles.reinforcementText}>Super eyes! ✨</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Speed discrimination • Visual attention duration</Text>
        <View style={styles.progressRow}>
          {progressDots.map((filled, idx) => (
            <View
              key={idx}
              style={[styles.progressDot, filled && styles.progressDotFilled]}
            />
          ))}
        </View>
        <Text style={styles.speedIndicator}>
          Speed Level: {speedLevel + 1} / {SPEED_LEVELS.length} • Taps: {hits} / {requiredTaps}
        </Text>
      </View>

      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
  },
  backText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#475569',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  object: {
    position: 'absolute',
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    borderWidth: 3,
    borderColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  objectEmoji: {
    fontSize: 36,
  },
  missBadge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  missText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 14,
  },
  reinforcementBadge: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FBBF24',
    zIndex: 999,
    elevation: 8,
  },
  reinforcementText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
  },
  progressDotFilled: {
    backgroundColor: '#F59E0B',
  },
  speedIndicator: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
});
