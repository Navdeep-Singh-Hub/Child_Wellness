/**
 * Game 3: Build Letter — drag line segments to form letters.
 * Cycles through I → L → T → H → E → F.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LETTERS, scaleSegments, distance, type Segment } from './letterData';

const SNAP_DIST = 35;

interface DraggablePiece {
  seg: Segment;
  scaledDx: number;
  scaledDy: number;
  startX: number;
  startY: number;
}

function shuffled<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function DraggableSegment({
  piece,
  targetSeg,
  onSnapped,
}: {
  piece: DraggablePiece;
  targetSeg: Segment;
  onSnapped: (id: string) => void;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const snapped = useRef(false);

  const pad = 15;
  const dx = piece.scaledDx;
  const dy = piece.scaledDy;
  const x1 = dx >= 0 ? pad : pad + Math.abs(dx);
  const y1 = dy >= 0 ? pad : pad + Math.abs(dy);
  const x2 = x1 + dx;
  const y2 = y1 + dy;
  const svgW = Math.abs(dx) + pad * 2;
  const svgH = Math.max(Math.abs(dy) + pad * 2, 40);

  const checkSnap = useCallback((ddx: number, ddy: number) => {
    if (snapped.current) return;
    const cx = piece.startX + ddx + svgW / 2;
    const cy = piece.startY + ddy + svgH / 2;
    const targetCx = (targetSeg.from.x + targetSeg.to.x) / 2;
    const targetCy = (targetSeg.from.y + targetSeg.to.y) / 2;
    if (distance({ x: cx, y: cy }, { x: targetCx, y: targetCy }) < SNAP_DIST) {
      snapped.current = true;
      onSnapped(piece.seg.id);
    }
  }, [piece, targetSeg, svgW, svgH, onSnapped]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (snapped.current) return;
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (snapped.current) {
        const targetCx = (targetSeg.from.x + targetSeg.to.x) / 2;
        const targetCy = (targetSeg.from.y + targetSeg.to.y) / 2;
        tx.value = withSpring(targetCx - piece.startX - svgW / 2);
        ty.value = withSpring(targetCy - piece.startY - svgH / 2);
        return;
      }
      checkSnap(e.translationX, e.translationY);
      if (!snapped.current) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      } else {
        const targetCx = (targetSeg.from.x + targetSeg.to.x) / 2;
        const targetCy = (targetSeg.from.y + targetSeg.to.y) / 2;
        tx.value = withSpring(targetCx - piece.startX - svgW / 2);
        ty.value = withSpring(targetCy - piece.startY - svgH / 2);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: piece.startX, top: piece.startY, width: svgW, height: svgH }, animStyle]}>
        <Svg width={svgW} height={svgH}>
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7C3AED" strokeWidth={8} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

export function BuildLetterGame({
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
  const [letterIdx, setLetterIdx] = useState(0);
  const [snappedIds, setSnappedIds] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const letterDef = LETTERS[letterIdx];
  const targetSegs = useMemo(
    () => scaleSegments(letterDef.segments, 100, 120, dims.width, dims.height * 0.6),
    [letterDef, dims]
  );
  const scaleFactor = useMemo(() => Math.min(dims.width / 100, (dims.height * 0.6) / 120) * 0.75, [dims]);

  const pieces = useMemo(() => {
    const shuffledSegs = shuffled(letterDef.segments);
    const spacing = dims.width / (shuffledSegs.length + 1);
    return shuffledSegs.map((seg, i): DraggablePiece => {
      const sdx = (seg.to.x - seg.from.x) * scaleFactor;
      const sdy = (seg.to.y - seg.from.y) * scaleFactor;
      const pieceW = Math.abs(sdx) + 30;
      return {
        seg,
        scaledDx: sdx,
        scaledDy: sdy,
        startX: spacing * (i + 1) - pieceW / 2,
        startY: dims.height * 0.72,
      };
    });
  }, [letterDef, dims, scaleFactor]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setDims({ width, height });
  }, []);

  const handleSnapped = useCallback(
    (id: string) => {
      setSnappedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        if (next.size >= targetSegs.length) {
          try { Speech.stop(); Speech.speak(`Great! You built letter ${letterDef.letter}!`, { rate: 0.85 }); } catch (_) {}
          setTimeout(() => {
            if (letterIdx < LETTERS.length - 1) {
              setLetterIdx((i) => i + 1);
              setSnappedIds(new Set());
            } else {
              setShowConfetti(true);
              setTimeout(() => {
                setShowConfetti(false);
                onComplete();
              }, 1500);
            }
          }, 1200);
        }
        return next;
      });
    },
    [targetSegs.length, letterDef, letterIdx, onComplete]
  );

  return (
    <GameContainerGrip
      title={`Build Letter ${letterDef.letter}`}
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔧"
      mascotHint={`Drag the lines to build letter ${letterDef.letter}!`}
      onBack={onBack}
    >
      <View style={styles.outer} onLayout={onLayout}>
        <Text style={styles.hint}>Drag the pieces to build: <Text style={styles.targetChar}>{letterDef.letter}</Text></Text>
        <View style={styles.buildArea}>
          <Svg width={dims.width} height={dims.height * 0.6} style={StyleSheet.absoluteFill}>
            {targetSegs.map((seg) => (
              <React.Fragment key={seg.id}>
                <Line
                  x1={seg.from.x}
                  y1={seg.from.y}
                  x2={seg.to.x}
                  y2={seg.to.y}
                  stroke={snappedIds.has(seg.id) ? '#22C55E' : '#D1D5DB'}
                  strokeWidth={snappedIds.has(seg.id) ? 8 : 6}
                  strokeLinecap="round"
                  strokeDasharray={snappedIds.has(seg.id) ? undefined : '10 8'}
                />
                <Circle cx={seg.from.x} cy={seg.from.y} r={6} fill={snappedIds.has(seg.id) ? '#22C55E' : '#9CA3AF'} />
                <Circle cx={seg.to.x} cy={seg.to.y} r={6} fill={snappedIds.has(seg.id) ? '#22C55E' : '#9CA3AF'} />
              </React.Fragment>
            ))}
          </Svg>
          {pieces.map((piece) =>
            snappedIds.has(piece.seg.id) ? null : (
              <DraggableSegment
                key={`${letterDef.letter}-${piece.seg.id}`}
                piece={piece}
                targetSeg={targetSegs.find((s) => s.id === piece.seg.id)!}
                onSnapped={handleSnapped}
              />
            )
          )}
        </View>
        <Text style={styles.counter}>
          {letterIdx + 1} / {LETTERS.length} · {snappedIds.size} / {targetSegs.length} pieces placed
        </Text>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  hint: { fontSize: 18, fontWeight: '700', color: '#5B21B6', textAlign: 'center', marginBottom: 8 },
  targetChar: { fontSize: 28, fontWeight: '900', color: '#7C3AED' },
  buildArea: { flex: 1, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#6D28D9', marginTop: 10 },
});
