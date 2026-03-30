/**
 * Game 1: Letter Introduction — I, L, T, H, E, F
 * Show one letter at center with animated stroke drawing. Tap → plays sound. Loop through all 6.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent, Animated as RNAnimated, Easing } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LETTERS, scaleStrokes, type LetterDef } from './letterData';

const LETTER_COLORS = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

export function LetterIntroductionGame({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [dims, setDims] = useState({ width: 300, height: 300 });
  const [letterIdx, setLetterIdx] = useState(0);
  const [strokesRevealed, setStrokesRevealed] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  const letterDef = LETTERS[letterIdx];
  const color = LETTER_COLORS[letterIdx % LETTER_COLORS.length];
  const strokes = useMemo(
    () => scaleStrokes(letterDef.strokes, 100, 120, dims.width, dims.height),
    [letterDef, dims]
  );

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
    const revealNext = (idx: number) => {
      if (idx <= strokes.length) {
        setStrokesRevealed(idx);
        if (idx < strokes.length) {
          timer = setTimeout(() => revealNext(idx + 1), 400);
        }
      }
    };
    timer = setTimeout(() => revealNext(1), 500);
    return () => clearTimeout(timer);
  }, [letterIdx, strokes.length]);

  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    try {
      Speech.stop();
      Speech.speak(`This is letter ${letterDef.letter}`, { rate: 0.85, pitch: 1.1 });
    } catch (_) {}
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}

    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
      RNAnimated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      if (letterIdx < LETTERS.length - 1) {
        setLetterIdx((i) => i + 1);
      } else {
        setShowConfetti(true);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, 1500);
      }
    }, 1500);
  }, [tapped, letterDef, letterIdx, onComplete, scaleAnim]);

  return (
    <GameContainerGrip
      title={`Letter ${letterDef.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔤"
      mascotHint={`This is letter ${letterDef.letter}! Tap to hear it.`}
      onBack={onBack}
    >
      <View style={styles.letterIndicator}>
        {LETTERS.map((l, i) => (
          <View key={l.letter} style={[styles.indDot, i <= letterIdx ? { backgroundColor: LETTER_COLORS[i] } : undefined]}>
            <Text style={[styles.indText, i <= letterIdx && styles.indTextActive]}>{l.letter}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.canvasArea} onPress={handleTap} onLayout={onLayout}>
        <RNAnimated.View style={[styles.letterContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Svg width={dims.width} height={dims.height}>
            {strokes.slice(0, strokesRevealed).map((s, i) => (
              <Line
                key={i}
                x1={s.from.x}
                y1={s.from.y}
                x2={s.to.x}
                y2={s.to.y}
                stroke={color}
                strokeWidth={8}
                strokeLinecap="round"
              />
            ))}
          </Svg>
          <Text style={[styles.bigLetter, { color }]}>{letterDef.letter}</Text>
        </RNAnimated.View>
        {!tapped && strokesRevealed >= strokes.length && (
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to hear! 👆</Text>
          </View>
        )}
        {tapped && (
          <View style={[styles.soundBubble, { backgroundColor: color + '20' }]}>
            <Text style={[styles.soundText, { color }]}>"{letterDef.letter}"</Text>
          </View>
        )}
      </Pressable>
      <Text style={styles.counter}>{letterIdx + 1} / {LETTERS.length}</Text>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  letterIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  indDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  indText: { fontSize: 16, fontWeight: '800', color: '#9CA3AF' },
  indTextActive: { color: '#FFF' },
  canvasArea: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  letterContainer: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bigLetter: { fontSize: 140, fontWeight: '900', position: 'absolute', opacity: 0.12 },
  tapHint: { position: 'absolute', bottom: 30, backgroundColor: '#FEF3C7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  tapHintText: { fontSize: 18, fontWeight: '800', color: '#92400E' },
  soundBubble: { position: 'absolute', bottom: 30, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  soundText: { fontSize: 24, fontWeight: '900' },
  counter: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#6D28D9', marginTop: 10 },
});
