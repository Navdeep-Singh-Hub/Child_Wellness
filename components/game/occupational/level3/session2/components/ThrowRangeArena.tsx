import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SESSION2_PACING } from '@/components/game/occupational/level3/session2/session2Pacing';
import { basketLabel, basketX, type ThrowBasket } from '@/components/game/occupational/level3/session2/scaleUtils';

type Props = {
  targetBasket: ThrowBasket;
  ballEmoji: string;
  accent: string;
  smallColor: string;
  moving: boolean;
  active: boolean;
  onThrowEnd: (dragDistance: number) => void;
  onLayout: (w: number, h: number) => void;
};

export function ThrowRangeArena({
  targetBasket,
  ballEmoji,
  accent,
  smallColor,
  moving,
  active,
  onThrowEnd,
  onLayout,
}: Props) {
  const P = SESSION2_PACING;
  const ballX = useSharedValue(P.ballStartX);
  const ballY = useSharedValue(P.ballStartY);
  const basketOffset = useSharedValue(0);
  const power = useSharedValue(0);
  const flying = useSharedValue(0);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const screen = React.useRef({ w: 400, h: 360 });
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    if (!moving) {
      basketOffset.value = withTiming(0, { duration: 200 });
      return;
    }
    const id = setInterval(() => {
      basketOffset.value = withTiming(basketOffset.value === 0 ? 6 : 0, { duration: 900 });
    }, 900);
    return () => clearInterval(id);
  }, [moving, basketOffset]);

  const ballStyle = useAnimatedStyle(() => ({
    left: `${ballX.value}%`,
    top: `${ballY.value}%`,
    transform: [{ translateX: -28 }, { translateY: -28 }, { scale: 1 + power.value * 0.15 }],
    opacity: flying.value > 0 ? 1 - flying.value * 0.2 : 1,
  }));

  const basketStyle = useAnimatedStyle(() => ({
    left: `${basketX(targetBasket) + basketOffset.value}%`,
  }));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(active)
    .onStart((e) => {
      isDragging.current = true;
      dragStart.current = { x: e.x, y: e.y };
      flying.value = 0;
    })
    .onUpdate((e) => {
      if (!isDragging.current) return;
      ballX.value = Math.max(8, Math.min(92, (e.x / screen.current.w) * 100));
      ballY.value = Math.max(50, Math.min(90, (e.y / screen.current.h) * 100));
      const dx = e.x - dragStart.current.x;
      const dy = e.y - dragStart.current.y;
      power.value = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 180);
    })
    .onEnd((e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const dx = e.x - dragStart.current.x;
      const dy = e.y - dragStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      flying.value = withTiming(1, { duration: 450 });
      ballX.value = withSpring(basketX(targetBasket));
      ballY.value = withSpring(P.basketY + 8, {}, () => {
        ballX.value = withSpring(P.ballStartX);
        ballY.value = withSpring(P.ballStartY);
        power.value = withSpring(0);
        flying.value = 0;
      });

      onThrowEnd(dist);
    });

  return (
    <View
      style={styles.area}
      onLayout={(e) => {
        screen.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
        onLayout(screen.current.w, screen.current.h);
      }}
    >
      <Animated.View style={[styles.basket, basketStyle, { borderColor: accent }]}>
        <Text style={styles.basketEmoji}>🧺</Text>
        <Text style={[styles.basketLabel, { color: accent }]}>{basketLabel(targetBasket)}</Text>
      </Animated.View>

      <View style={styles.powerWrap}>
        <Text style={styles.powerLabel}>POWER</Text>
        <PowerMeter power={power} color={accent} />
      </View>

      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.startDot,
              { left: `${P.ballStartX}%`, top: `${P.ballStartY}%`, backgroundColor: accent },
            ]}
          />
          <Animated.View style={[styles.ball, ballStyle, { backgroundColor: smallColor }]}>
            <Text style={styles.ballEmoji}>{ballEmoji}</Text>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function PowerMeter({ power, color }: { power: Animated.SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => ({
    width: `${power.value * 100}%`,
    backgroundColor: color,
  }));
  return (
    <View style={styles.powerBg}>
      <Animated.View style={[styles.powerFill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
  },
  basket: {
    position: 'absolute',
    top: '10%',
    transform: [{ translateX: -36 }],
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  basketEmoji: { fontSize: 28 },
  basketLabel: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  powerWrap: { position: 'absolute', top: 8, right: 12, left: 12, zIndex: 4, alignItems: 'flex-end' },
  powerLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 4 },
  powerBg: {
    width: 100,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  powerFill: { height: '100%', borderRadius: 5 },
  startDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    transform: [{ translateX: -8 }, { translateY: -8 }],
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  ball: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 5,
  },
  ballEmoji: { fontSize: 30 },
});
