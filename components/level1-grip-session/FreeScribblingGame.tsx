/**
 * Game 1: Free Scribbling Canvas — draw freely, random color per stroke, Clear + Done.
 */
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas, DrawingCanvasRef } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from './GameContainerGrip';

export function FreeScribblingGame({
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
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleStrokeStart = () => {
    setShowSparkles(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
  };

  const handleDone = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    onComplete();
  };

  return (
    <GameContainerGrip
      title="Free Scribbling"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="✏️"
      mascotHint="Try drawing freely!"
      onBack={onBack}
    >
      <View style={styles.canvasWrap}>
        <DrawingCanvas
          ref={canvasRef}
          brushSize={14}
          canvasColor="#FFF"
          randomColors
          onStrokeStart={handleStrokeStart}
        />
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.btn, styles.btnClear, pressed && styles.pressed]}>
          <Text style={styles.btnText}>Clear</Text>
        </Pressable>
        <Pressable onPress={handleDone} style={({ pressed }) => [styles.btn, styles.btnDone, pressed && styles.pressed]}>
          <Text style={styles.btnText}>Done</Text>
        </Pressable>
      </View>
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  canvasWrap: { flex: 1, minHeight: 280, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFF' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnClear: { backgroundColor: '#E5E7EB' },
  btnDone: { backgroundColor: '#5B21B6' },
  btnText: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  pressed: { opacity: 0.9 },
});
