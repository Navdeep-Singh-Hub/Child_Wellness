/**
 * Game 3: Architect's Bench — drag slant/curve segments (A, V, X, N, O, S).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, AccessibilityInfo } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { LETTERS, scaleSegments, distance, type Segment } from './letterData';

const BUILD_LETTERS = LETTERS.filter((l) => ['A', 'V', 'X', 'N', 'O', 'S'].includes(l.letter));
const SNAP_DIST = 38;

const SHELL = {
  bg: '#134E4A',
  labelColor: '#5EEAD4',
  titleColor: '#F0FDFA',
  textOnDark: '#F0FDFA',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(45,212,191,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#2DD4BF',
  dotDone: '#FBBF24',
};

interface DragPiece {
  seg: Segment;
  scaledDx: number;
  scaledDy: number;
  sx: number;
  sy: number;
}

function shuffled<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function Draggable({
  piece,
  target,
  onSnap,
  strokeColor,
}: {
  piece: DragPiece;
  target: Segment;
  onSnap: (id: string) => void;
  strokeColor: string;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const done = useRef(false);
  const pad = 15;
  const dx = piece.scaledDx;
  const dy = piece.scaledDy;
  const x1 = dx >= 0 ? pad : pad + Math.abs(dx);
  const y1 = dy >= 0 ? pad : pad + Math.abs(dy);
  const x2 = x1 + dx;
  const y2 = y1 + dy;
  const svgW = Math.abs(dx) + pad * 2;
  const svgH = Math.abs(dy) + pad * 2;

  const checkSnap = useCallback(
    (tdx: number, tdy: number) => {
      if (done.current) return;
      const cx = piece.sx + tdx + svgW / 2;
      const cy = piece.sy + tdy + svgH / 2;
      const tcx = (target.from.x + target.to.x) / 2;
      const tcy = (target.from.y + target.to.y) / 2;
      if (distance({ x: cx, y: cy }, { x: tcx, y: tcy }) < SNAP_DIST) {
        done.current = true;
        onSnap(piece.seg.id);
      }
    },
    [piece, target, svgW, svgH, onSnap],
  );

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!done.current) {
        tx.value = e.translationX;
        ty.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (done.current) {
        const tcx = (target.from.x + target.to.x) / 2;
        const tcy = (target.from.y + target.to.y) / 2;
        tx.value = withSpring(tcx - piece.sx - svgW / 2);
        ty.value = withSpring(tcy - piece.sy - svgH / 2);
        return;
      }
      checkSnap(e.translationX, e.translationY);
      if (!done.current) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      } else {
        const tcx = (target.from.x + target.to.x) / 2;
        const tcy = (target.from.y + target.to.y) / 2;
        tx.value = withSpring(tcx - piece.sx - svgW / 2);
        ty.value = withSpring(tcy - piece.sy - svgH / 2);
      }
    });

  const aStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: piece.sx, top: piece.sy, width: svgW, height: svgH }, aStyle]}>
        <Svg width={svgW} height={svgH}>
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={8} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

export function BuildLetterAdvGame({
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
  const [dims, setDims] = useState({ width: 300, height: 400 });
  const [lIdx, setLIdx] = useState(0);
  const [snapped, setSnapped] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const spokeLetter = useRef(-1);

  const def = BUILD_LETTERS[lIdx];
  const targets = useMemo(() => scaleSegments(def.segments, 100, 120, dims.width, dims.height * 0.6), [def, dims]);
  const scaleFactor = useMemo(() => Math.min(dims.width / 100, (dims.height * 0.6) / 120) * 0.75, [dims]);

  const pieces = useMemo(() => {
    const sh = shuffled(def.segments);
    const sp = dims.width / (sh.length + 1);
    return sh.map((seg, i): DragPiece => {
      const sdx = (seg.to.x - seg.from.x) * scaleFactor;
      const sdy = (seg.to.y - seg.from.y) * scaleFactor;
      const pieceW = Math.abs(sdx) + 30;
      return { seg, scaledDx: sdx, scaledDy: sdy, sx: sp * (i + 1) - pieceW / 2, sy: dims.height * 0.72 };
    });
  }, [def, dims, scaleFactor]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (spokeLetter.current !== lIdx) {
      spokeLetter.current = lIdx;
      speak(`Assemble letter ${def.letter} on the architect bench!`, 0.72);
    }
  }, [lIdx, def.letter]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const handleSnap = useCallback(
    (id: string) => {
      setSnapped((prev) => {
        const next = new Set(prev);
        next.add(id);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        if (next.size >= targets.length) {
          speak(`Magnificent! Letter ${def.letter} is built!`, 0.72);
          setTimeout(() => {
            if (lIdx < BUILD_LETTERS.length - 1) {
              setLIdx((i) => i + 1);
              setSnapped(new Set());
            } else {
              setShowConfetti(true);
              speak('The bench is complete! Every structure stands tall!', 0.72);
              setTimeout(() => {
                setShowConfetti(false);
                onComplete();
              }, reduceMotion ? 500 : 1500);
            }
          }, reduceMotion ? 500 : 1200);
        }
        return next;
      });
    },
    [targets.length, def, lIdx, onComplete, reduceMotion],
  );

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="ARCHITECT'S BENCH"
        gameTitle={`Build ${def.letter}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🏛️"
          name="Architect"
          hint={`Drag marble pieces to build letter ${def.letter}!`}
          accent="#2DD4BF"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(45,212,191,0.35)"
          nameColor="#2DD4BF"
          hintColor="#F0FDFA"
        />
        <View style={styles.outer} onLayout={onLayout}>
          <View style={styles.area}>
            <Svg width={dims.width} height={dims.height * 0.6} style={StyleSheet.absoluteFill}>
              {targets.map((seg) => (
                <React.Fragment key={seg.id}>
                  <Line
                    x1={seg.from.x}
                    y1={seg.from.y}
                    x2={seg.to.x}
                    y2={seg.to.y}
                    stroke={snapped.has(seg.id) ? '#34D399' : '#94A3B8'}
                    strokeWidth={snapped.has(seg.id) ? 8 : 6}
                    strokeLinecap="round"
                    strokeDasharray={snapped.has(seg.id) ? undefined : '10 8'}
                  />
                  <Circle cx={seg.from.x} cy={seg.from.y} r={5} fill={snapped.has(seg.id) ? '#34D399' : '#94A3B8'} />
                  <Circle cx={seg.to.x} cy={seg.to.y} r={5} fill={snapped.has(seg.id) ? '#34D399' : '#94A3B8'} />
                </React.Fragment>
              ))}
            </Svg>
            {pieces.map((p) =>
              snapped.has(p.seg.id) ? null : (
                <Draggable
                  key={`${def.letter}-${p.seg.id}`}
                  piece={p}
                  target={targets.find((t) => t.id === p.seg.id)!}
                  onSnap={handleSnap}
                  strokeColor="#FDE047"
                />
              ),
            )}
          </View>
          <Text style={styles.counter}>
            {lIdx + 1}/{BUILD_LETTERS.length} · {snapped.size}/{targets.length} placed
          </Text>
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  outer: { flex: 1 },
  area: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(45,212,191,0.35)',
  },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#5EEAD4', marginTop: 10 },
});
