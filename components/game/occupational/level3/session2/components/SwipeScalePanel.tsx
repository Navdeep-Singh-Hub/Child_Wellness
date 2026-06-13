import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { ScaleTarget } from '@/components/game/occupational/level3/session2/scaleUtils';

type Props = {
  target: ScaleTarget;
  bigProgress: number;
  smallProgress: number;
  trail: { x: number; y: number; big: boolean }[];
  accent: string;
  accentDark: string;
  titleColor: string;
  active: boolean;
  onSwipeStart: (x: number, y: number) => void;
  onSwipeMove: (x: number, y: number, dist: number) => void;
  onSwipeEnd: (dist: number) => void;
};

export function SwipeScalePanel({
  target,
  bigProgress,
  smallProgress,
  trail,
  accent,
  accentDark,
  titleColor,
  active,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
}: Props) {
  const start = React.useRef({ x: 0, y: 0 });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(active)
    .onStart((e) => {
      start.current = { x: e.x, y: e.y };
      onSwipeStart(e.x, e.y);
    })
    .onUpdate((e) => {
      const dx = e.x - start.current.x;
      const dy = e.y - start.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      onSwipeMove(e.x, e.y, dist);
    })
    .onEnd((e) => {
      const dx = e.x - start.current.x;
      const dy = e.y - start.current.y;
      onSwipeEnd(Math.sqrt(dx * dx + dy * dy));
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap}>
        <Meter label="BIG" progress={bigProgress} active={target === 'big'} color={accent} textColor={titleColor} />
        <View style={[styles.zone, { borderColor: accent }]}>
          <Text style={[styles.hint, { color: accentDark }]}>Swipe here!</Text>
          {trail.map((p, i) => (
            <Animated.View
              key={`${p.x}-${p.y}-${i}`}
              entering={FadeIn.duration(80)}
              style={[
                styles.trailDot,
                {
                  left: p.x - 6,
                  top: p.y - 6,
                  width: p.big ? 14 : 7,
                  height: p.big ? 14 : 7,
                  borderRadius: p.big ? 7 : 4,
                  backgroundColor: p.big ? '#F59E0B' : '#A78BFA',
                  opacity: 0.35 + (i / Math.max(trail.length, 1)) * 0.55,
                },
              ]}
            />
          ))}
        </View>
        <Meter label="SMALL" progress={smallProgress} active={target === 'small'} color="#EC4899" textColor={titleColor} />
      </View>
    </GestureDetector>
  );
}

function Meter({
  label,
  progress,
  active,
  color,
  textColor,
}: {
  label: string;
  progress: number;
  active: boolean;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.meterWrap}>
      <Text style={[styles.meterLabel, { color: textColor, opacity: active ? 1 : 0.55 }]}>{label}</Text>
      <View style={styles.meterBg}>
        <View style={[styles.meterFill, { width: `${progress}%`, backgroundColor: active ? color : '#94A3B8' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 360, justifyContent: 'space-around' },
  meterWrap: { width: '100%', alignItems: 'center' },
  meterLabel: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  meterBg: {
    width: '88%',
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 17,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 17 },
  zone: {
    width: '100%',
    height: 130,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
  },
  hint: { fontSize: 17, fontWeight: '800', zIndex: 2 },
  trailDot: { position: 'absolute' },
});
