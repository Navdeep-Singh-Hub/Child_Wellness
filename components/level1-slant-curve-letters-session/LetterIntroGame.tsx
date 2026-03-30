/**
 * Game 1: Letter Introduction — A,V,W,X,Y,Z,N,C,O,Q,U,S,G,J
 * Show one letter at a time with animated stroke drawing. Tap → speaks letter.
 */
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent, Animated as RNAnimated, Easing } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LETTERS, scaleStrokes } from './letterData';

const COLORS = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#6366F1', '#10B981', '#E11D48', '#0EA5E9',
  '#A855F7', '#D946EF',
];

export function LetterIntroGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [idx, setIdx] = useState(0);
  const [strokesRevealed, setStrokesRevealed] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  const def = LETTERS[idx];
  const color = COLORS[idx % COLORS.length];
  const strokes = useMemo(() => scaleStrokes(def.strokes, 100, 120, dims.width, dims.height), [def, dims]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setStrokesRevealed(0);
    setTapped(false);
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);
    RNAnimated.parallel([
      RNAnimated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
      RNAnimated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    let timer: ReturnType<typeof setTimeout>;
    const reveal = (n: number) => {
      if (n <= strokes.length) {
        setStrokesRevealed(n);
        if (n < strokes.length) timer = setTimeout(() => reveal(n + 1), 350);
      }
    };
    timer = setTimeout(() => reveal(1), 400);
    return () => clearTimeout(timer);
  }, [idx, strokes.length]);

  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    try { Speech.stop(); Speech.speak(`This is letter ${def.letter}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
      RNAnimated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      if (idx < LETTERS.length - 1) {
        setIdx((i) => i + 1);
      } else {
        setShowConfetti(true);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
      }
    }, 1400);
  }, [tapped, def, idx, onComplete, scaleAnim]);

  return (
    <GameContainerGrip
      title={`Letter ${def.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔤"
      mascotHint={`This is letter ${def.letter}! Tap to hear it.`}
      onBack={onBack}
    >
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          {idx + 1} / {LETTERS.length}
        </Text>
      </View>
      <Pressable style={styles.area} onPress={handleTap} onLayout={onLayout}>
        <RNAnimated.View style={[styles.letterWrap, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Svg width={dims.width} height={dims.height}>
            {strokes.slice(0, strokesRevealed).map((s, i) => (
              <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
                stroke={color} strokeWidth={8} strokeLinecap="round" />
            ))}
          </Svg>
          <Text style={[styles.bigLetter, { color }]}>{def.letter}</Text>
        </RNAnimated.View>
        {!tapped && strokesRevealed >= strokes.length && (
          <View style={styles.tapHint}><Text style={styles.tapHintText}>Tap to hear! 👆</Text></View>
        )}
        {tapped && (
          <View style={[styles.bubble, { backgroundColor: color + '20' }]}>
            <Text style={[styles.bubbleText, { color }]}>"{def.letter}"</Text>
          </View>
        )}
      </Pressable>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  indicator: { alignItems: 'center', marginBottom: 8 },
  indicatorText: { fontSize: 15, fontWeight: '700', color: '#6D28D9' },
  area: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  letterWrap: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bigLetter: { fontSize: 130, fontWeight: '900', position: 'absolute', opacity: 0.1 },
  tapHint: { position: 'absolute', bottom: 28, backgroundColor: '#FEF3C7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  tapHintText: { fontSize: 18, fontWeight: '800', color: '#92400E' },
  bubble: { position: 'absolute', bottom: 28, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  bubbleText: { fontSize: 24, fontWeight: '900' },
});
