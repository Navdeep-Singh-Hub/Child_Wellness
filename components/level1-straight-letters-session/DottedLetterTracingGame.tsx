/**
 * Game 4: Ink Trail Studio — dot-to-dot letter tracing I → F.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from './letters-shared/LetterGameShell';
import { LetterMascot } from './letters-shared/LetterMascot';
import { letterColor } from './letters-shared/letterColors';
import { INK_TRAIL, SHELL_INK } from './ink-trail/theme';
import { LETTERS, scaleDots, scaleStrokes } from './letterData';
import { getConnectedDots } from '@/components/level1-grip-session/shapeFillUtils';

const HIT_RADIUS = 20;
const SUCCESS_PCT = 85;

export function DottedLetterTracingGame({
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
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const spokeLetter = useRef(-1);

  const letterDef = LETTERS[letterIdx];
  const color = letterColor(letterIdx);
  const dots = useMemo(() => scaleDots(letterDef.dots, 100, 120, dims.width, dims.height), [letterDef, dims]);
  const guideStrokes = useMemo(() => scaleStrokes(letterDef.strokes, 100, 120, dims.width, dims.height), [letterDef, dims]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (spokeLetter.current !== letterIdx) {
      spokeLetter.current = letterIdx;
      speak(`Trace the letter ${letterDef.letter}. Connect the dots!`, 0.72);
    }
  }, [letterIdx, letterDef.letter]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const nextDotIdx = useMemo(() => {
    for (let i = 0; i < dots.length; i++) {
      if (!connected.has(i)) return i;
    }
    return -1;
  }, [connected, dots]);

  const handleStrokeEnd = useCallback(
    (strokes: Stroke[]) => {
      const next = getConnectedDots(strokes, dots, HIT_RADIUS);
      setConnected(next);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
      const pct = dots.length > 0 ? (next.size / dots.length) * 100 : 0;
      if (pct >= SUCCESS_PCT) {
        setShowConfetti(true);
        speak(`Great ${letterDef.letter}!`, 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setShowConfetti(false);
          if (letterIdx < LETTERS.length - 1) {
            setLetterIdx((i) => i + 1);
            setConnected(new Set());
            canvasRef.current?.clear();
          } else {
            speak('You traced every letter! Ink master!', 0.72);
            onComplete();
          }
        }, reduceMotion ? 400 : 1200);
      }
    },
    [dots, letterDef, letterIdx, onComplete, reduceMotion],
  );

  const pct = dots.length > 0 ? Math.round((connected.size / dots.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: INK_TRAIL.parchment }} />
      </View>

      <LetterGameShell
        theme={SHELL_INK}
        gameLabel="INK TRAIL STUDIO"
        gameTitle={`Trace ${letterDef.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🪶"
          name="Quill"
          hint={`Connect the dots to write letter ${letterDef.letter}!`}
          accent={INK_TRAIL.accent}
          bubbleBg={INK_TRAIL.panel}
          bubbleBorder={INK_TRAIL.panelBorder}
          nameColor={INK_TRAIL.accent}
          hintColor={INK_TRAIL.textDark}
        />

        <View style={styles.letterIndicator}>
          {LETTERS.map((l, i) => (
            <View key={l.letter} style={[styles.indDot, i <= letterIdx ? { backgroundColor: letterColor(i) } : undefined]}>
              <Text style={[styles.indText, i <= letterIdx && styles.indTextActive]}>{l.letter}</Text>
            </View>
          ))}
        </View>

        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.canvasWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={10}
              canvasColor="rgba(255,255,255,0.7)"
              randomColors={false}
              onStrokeEnd={handleStrokeEnd}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={dims.width} height={dims.height}>
                {guideStrokes.map((s, i) => (
                  <Line
                    key={`guide-${i}`}
                    x1={s.from.x}
                    y1={s.from.y}
                    x2={s.to.x}
                    y2={s.to.y}
                    stroke={color + '35'}
                    strokeWidth={4}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                ))}
                {dots.map((d, i) => (
                  <React.Fragment key={i}>
                    {i === nextDotIdx && (
                      <Circle cx={d.x} cy={d.y} r={18} fill="none" stroke={INK_TRAIL.dotActive} strokeWidth={3} opacity={0.8} />
                    )}
                    <Circle
                      cx={d.x}
                      cy={d.y}
                      r={connected.has(i) ? 13 : 10}
                      fill={connected.has(i) ? INK_TRAIL.dotDone : color}
                      opacity={connected.has(i) ? 1 : 0.85}
                    />
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.label}>Ink trail: {pct}%</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
          </View>
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SHELL_INK.bg },
  letterIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  indDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(6,78,59,0.1)', justifyContent: 'center', alignItems: 'center' },
  indText: { fontSize: 15, fontWeight: '800', color: INK_TRAIL.textMuted },
  indTextActive: { color: '#FFF' },
  outer: { flex: 1 },
  canvasWrap: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: INK_TRAIL.panelBorder,
  },
  progressRow: { marginTop: 12, gap: 6 },
  label: { fontSize: 15, fontWeight: '700', color: INK_TRAIL.textMuted },
  barBg: { height: 12, backgroundColor: 'rgba(6,78,59,0.1)', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
});
