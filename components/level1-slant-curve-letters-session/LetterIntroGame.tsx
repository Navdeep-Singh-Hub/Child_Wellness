/**
 * Game 1: Glyph Gallery — meet 14 slant/curve letters with animated strokes.
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
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { letterColor } from './slant-shared/letterColors';
import { LETTERS, scaleStrokes } from './letterData';

const SHELL = {
  bg: '#2E1065',
  labelColor: '#C4B5FD',
  titleColor: '#F5F3FF',
  textOnDark: '#F5F3FF',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(192,132,252,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#A855F7',
  dotDone: '#22D3EE',
};

export function LetterIntroGame({
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
  const [idx, setIdx] = useState(0);
  const [strokesRevealed, setStrokesRevealed] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  const def = LETTERS[idx];
  const color = letterColor(idx);
  const strokes = useMemo(() => scaleStrokes(def.strokes, 100, 120, dims.width, dims.height), [def, dims]);

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
    speak(`This is letter ${def.letter}. Tap to hear it!`, 0.72);
    let timer: ReturnType<typeof setTimeout>;
    const reveal = (n: number) => {
      if (n <= strokes.length) {
        setStrokesRevealed(n);
        if (n < strokes.length) timer = setTimeout(() => reveal(n + 1), reduceMotion ? 100 : 350);
      }
    };
    timer = setTimeout(() => reveal(1), reduceMotion ? 100 : 400);
    return () => clearTimeout(timer);
  }, [idx, strokes.length, def.letter, reduceMotion]);

  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    speak(`Letter ${def.letter}`, 0.72);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    if (!reduceMotion) {
      RNAnimated.sequence([
        RNAnimated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => {
      if (idx < LETTERS.length - 1) {
        setIdx((i) => i + 1);
      } else {
        setShowConfetti(true);
        speak('You toured the whole gallery! Amazing!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          onComplete();
        }, reduceMotion ? 500 : 1500);
      }
    }, reduceMotion ? 600 : 1400);
  }, [tapped, def, idx, onComplete, scaleAnim, reduceMotion]);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(168,85,247,0.12)' }]} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="GLYPH GALLERY"
        gameTitle={`Letter ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🖼️"
          name="Curator"
          hint={`This is letter ${def.letter}! Tap to hear it.`}
          accent="#A855F7"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(192,132,252,0.35)"
          nameColor="#C084FC"
          hintColor="#F5F3FF"
        />
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>{idx + 1} / {LETTERS.length}</Text>
        </View>
        <Pressable style={styles.area} onPress={handleTap} onLayout={onLayout}>
          <RNAnimated.View style={[styles.letterWrap, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
            <Svg width={dims.width} height={dims.height}>
              {strokes.slice(0, strokesRevealed).map((s, i) => (
                <Line key={i} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke={color} strokeWidth={8} strokeLinecap="round" />
              ))}
            </Svg>
            <Text style={[styles.bigLetter, { color }]}>{def.letter}</Text>
          </RNAnimated.View>
          {!tapped && strokesRevealed >= strokes.length && (
            <View style={styles.tapHint}><Text style={styles.tapHintText}>Tap to hear! 👆</Text></View>
          )}
          {tapped && (
            <View style={[styles.bubble, { backgroundColor: color + '30' }]}>
              <Text style={[styles.bubbleText, { color: '#F5F3FF' }]}>"{def.letter}"</Text>
            </View>
          )}
        </Pressable>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  indicator: { alignItems: 'center', marginBottom: 8 },
  indicatorText: { fontSize: 14, fontWeight: '700', color: '#C4B5FD' },
  area: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(192,132,252,0.35)',
  },
  letterWrap: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bigLetter: { fontSize: 130, fontWeight: '900', position: 'absolute', opacity: 0.1 },
  tapHint: { position: 'absolute', bottom: 24, backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  tapHintText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  bubble: { position: 'absolute', bottom: 24, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  bubbleText: { fontSize: 24, fontWeight: '900' },
});
