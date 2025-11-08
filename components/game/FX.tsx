// components/game/FX.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing, useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withSpring, cancelAnimation, runOnJS
} from 'react-native-reanimated';

export function usePop(spring = { stiffness: 280, damping: 20 }) {
  const scale = useSharedValue(1);
  const pop = () => {
    cancelAnimation(scale);
    scale.value = withSequence(
      withSpring(1.08, spring),
      withSpring(1, { stiffness: 240, damping: 18 })
    );
  };
  return { scale, pop };
}

export function useFlash() {
  const glow = useSharedValue(0);
  const flash = () => {
    glow.value = 0;
    glow.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 280, easing: Easing.inOut(Easing.cubic) })
    );
  };
  return { glow, flash };
}

// Small particle burst (no deps)
export function SparkleBurst({ visible, color = '#22C55E', count = 10, size = 6 }: {
  visible: boolean; color?: string; count?: number; size?: number;
}) {
  const p = Array.from({ length: count });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {p.map((_, i) => <Particle key={i} on={visible} i={i} n={count} size={size} color={color} />)}
    </View>
  );
}
function Particle({ on, i, n, size, color }: any) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!on) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [on]);

  const s = useAnimatedStyle(() => {
    if (t.value === 0) return { opacity: 0 } as any;
    const angle = (i / n) * Math.PI * 2;
    const r = 12 + 36 * t.value;
    return {
      transform: [
        { translateX: Math.cos(angle) * r },
        { translateY: Math.sin(angle) * r },
        { scale: 0.4 + 0.8 * (1 - (1 - t.value) ** 2) },
      ],
      opacity: 1 - t.value,
    } as any;
  });

  return <Animated.View style={[{
    position: 'absolute', width: size, height: size, borderRadius: 999, backgroundColor: color,
  }, s]} />;
}

// Toast chip for Correct / Oops
export function ResultToast({ text, type = 'ok', show }: {
  text: string; type?: 'ok' | 'bad'; show: boolean;
}) {
  const o = useSharedValue(0);
  const y = useSharedValue(10);

  useEffect(() => {
    let id: any;
    if (show) {
      o.value = 0; y.value = 10;
      o.value = withTiming(1, { duration: 140 });
      y.value = withTiming(0, { duration: 140 });
      id = setTimeout(() => {
        o.value = withTiming(0, { duration: 140 });
        y.value = withTiming(10, { duration: 140 });
      }, 650);
    } else {
      // Animate out immediately when show becomes false (e.g., next round)
      o.value = withTiming(0, { duration: 140 });
      y.value = withTiming(10, { duration: 140 });
    }
    return () => { if (id) clearTimeout(id); };
  }, [show]);

  const s = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));
  const bg = type === 'ok' ? '#16A34A' : '#DC2626';

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', top: 12, alignSelf: 'center',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
        backgroundColor: bg,
        shadowColor: bg, shadowOpacity: 0.25, shadowRadius: 12,
      }, s]}
    >
      <Animated.Text style={{ color: '#fff', fontWeight: '800' }}>{text}</Animated.Text>
    </Animated.View>
  );
}

// Progress chip
export function Stepper({ step, total }: { step: number; total: number }) {
  const pct = total ? Math.min(1, Math.max(0, step / total)) : 0;
  return (
    <View style={{
      alignSelf: 'center', flexDirection: 'row', gap: 6, padding: 8, borderRadius: 999,
      backgroundColor: '#111827', marginVertical: 8
    }}>
      <View style={{ width: 120, height: 8, borderRadius: 99, backgroundColor: '#374151', overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: '#22C55E' }} />
      </View>
      <View><Animated.Text style={{ color: '#fff', fontWeight: '800' }}>{step}/{total}</Animated.Text></View>
    </View>
  );
}
