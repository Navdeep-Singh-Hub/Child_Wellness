/**
 * Game 1: Alphabet Atelier — meet I, L, T, H, E, F with animated strokes + TTS.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
  Animated as RNAnimated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from './letters-shared/LetterGameShell';
import { LetterMascot } from './letters-shared/LetterMascot';
import { letterColor } from './letters-shared/letterColors';
import { ChalkboardBackground } from './alphabet-atelier/ChalkboardBackground';
import { ATELIER, SHELL_ATELIER } from './alphabet-atelier/theme';
import { LETTERS, scaleStrokes } from './letterData';

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
  const [reduceMotion, setReduceMotion] = useState(false);
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  const letterDef = LETTERS[letterIdx];
  const color = letterColor(letterIdx);
  const strokes = useMemo(
    () => scaleStrokes(letterDef.strokes, 100, 120, dims.width, dims.height),
    [letterDef, dims],
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  useEffect(() => {
    setStrokesRevealed(0);
    setTapped(false);
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);
    if (!reduceMotion) {
      RNAnimated.parallel([
        RNAnimated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
        RNAnimated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }

    speak(`This is letter ${letterDef.letter}. Tap to hear it!`, 0.72);

    let timer: ReturnType<typeof setTimeout>;
    const revealNext = (idx: number) => {
      if (idx <= strokes.length) {
        setStrokesRevealed(idx);
        if (idx < strokes.length) {
          timer = setTimeout(() => revealNext(idx + 1), reduceMotion ? 100 : 400);
        }
      }
    };
    timer = setTimeout(() => revealNext(1), reduceMotion ? 100 : 500);
    return () => clearTimeout(timer);
  }, [letterIdx, strokes.length, letterDef.letter, reduceMotion]);

  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    speak(`Letter ${letterDef.letter}`, 0.72);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}

    if (!reduceMotion) {
      RNAnimated.sequence([
        RNAnimated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (letterIdx < LETTERS.length - 1) {
        setLetterIdx((i) => i + 1);
      } else {
        setShowConfetti(true);
        speak('You met all six letters! Wonderful!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }, reduceMotion ? 600 : 1500);
  }, [tapped, letterDef, letterIdx, onComplete, scaleAnim, reduceMotion]);

  return (
    <View style={styles.root}>
      <ChalkboardBackground />
      <LetterGameShell
        theme={SHELL_ATELIER}
        gameLabel="ALPHABET ATELIER"
        gameTitle={`Letter ${letterDef.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="👩‍🏫"
          name="Professor Chalk"
          hint={`This is letter ${letterDef.letter}! Tap to hear it.`}
          accent={ATELIER.accent}
          bubbleBg={ATELIER.panel}
          bubbleBorder={ATELIER.panelBorder}
          nameColor={ATELIER.accent}
          hintColor={ATELIER.chalk}
        />

        <View style={styles.letterIndicator}>
          {LETTERS.map((l, i) => (
            <View key={l.letter} style={[styles.indDot, i <= letterIdx ? { backgroundColor: letterColor(i) } : undefined]}>
              <Text style={[styles.indText, i <= letterIdx && styles.indTextActive]}>{l.letter}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.canvasArea} onPress={handleTap} onLayout={onLayout}>
          <RNAnimated.View style={[styles.letterContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
            <Svg width={dims.width} height={dims.height}>
              {strokes.slice(0, strokesRevealed).map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke={color} strokeWidth={8} strokeLinecap="round" />
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
            <View style={[styles.soundBubble, { backgroundColor: color + '30' }]}>
              <Text style={[styles.soundText, { color: ATELIER.chalk }]}>"{letterDef.letter}"</Text>
            </View>
          )}
        </Pressable>
        <Text style={styles.counter}>{letterIdx + 1} / {LETTERS.length}</Text>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SHELL_ATELIER.bg },
  letterIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  indDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  indText: { fontSize: 16, fontWeight: '800', color: ATELIER.chalkMuted },
  indTextActive: { color: '#FFF' },
  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: ATELIER.board,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ATELIER.panelBorder,
  },
  letterContainer: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bigLetter: { fontSize: 140, fontWeight: '900', position: 'absolute', opacity: 0.1 },
  tapHint: { position: 'absolute', bottom: 24, backgroundColor: ATELIER.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  tapHintText: { fontSize: 17, fontWeight: '800', color: '#14532D' },
  soundBubble: { position: 'absolute', bottom: 24, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  soundText: { fontSize: 24, fontWeight: '900' },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: ATELIER.chalkMuted, marginTop: 10 },
});
