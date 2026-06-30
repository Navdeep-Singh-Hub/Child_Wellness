/**
 * Game 3: Tap to Draw — each tap creates a colorful dot; after 10 taps show "Great tapping!"
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DrawingCanvas } from '@/components/games/Level1/DrawingCanvas';
import { GameContainerGrip } from './GameContainerGrip';

const TAPS_FOR_MESSAGE = 10;

export function TapToDrawGame({
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
  const [tapCount, setTapCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const handleStrokeEnd = (strokes: { length: number }[]) => {
    const count = strokes.length;
    setTapCount(count);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    if (count >= TAPS_FOR_MESSAGE && !showMessage) {
      setShowMessage(true);
      setTimeout(() => onComplete(), 2000);
    }
  };

  return (
    <GameContainerGrip
      title="Tap to Draw"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="👆"
      mascotHint="Tap to make colorful dots!"
      onBack={onBack}
    >
      <View style={styles.canvasWrap}>
        <DrawingCanvas
          brushSize={22}
          canvasColor="#FFF"
          randomColors
          singleDotMode
          onStrokeEnd={handleStrokeEnd}
        />
      </View>
      {showMessage && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Great tapping!</Text>
        </View>
      )}
      {!showMessage && tapCount > 0 && (
        <Text style={styles.hint}>Taps: {tapCount} — Keep going!</Text>
      )}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  canvasWrap: { flex: 1, minHeight: 280, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFF' },
  messageBox: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#5B21B6',
    borderRadius: 16,
    alignItems: 'center',
  },
  messageText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  hint: { fontSize: 16, color: '#5B21B6', marginTop: 12, textAlign: 'center', fontWeight: '600' },
});
