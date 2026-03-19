/**
 * Game 3: Tap the sleeping line / Tap the slanting line — 4 line types, randomize, correct tap = success.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

type LineType = 'vertical' | 'horizontal' | 'slantLeft' | 'slantRight';

interface LineOption {
  id: string;
  type: LineType;
}

const OPTIONS: LineOption[] = [
  { id: 'v', type: 'vertical' },
  { id: 'h', type: 'horizontal' },
  { id: 'sL', type: 'slantLeft' },
  { id: 'sR', type: 'slantRight' },
];

const PROMPTS: { sleeping: string; slanting: string } = {
  sleeping: 'Tap the sleeping line',
  slanting: 'Tap the slanting line',
};

export function IdentifyLineDirectionGame({
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
  const promptType = useMemo(() => (Math.random() < 0.5 ? 'sleeping' : 'slanting'), []);
  const shuffled = useMemo(() => [...OPTIONS].sort(() => Math.random() - 0.5), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const isCorrectType = (opt: LineOption) =>
    promptType === 'sleeping' ? opt.type === 'horizontal' : (opt.type === 'slantLeft' || opt.type === 'slantRight');

  const handleTap = (opt: LineOption) => {
    if (selectedId) return;
    const correct = isCorrectType(opt);
    setSelectedId(opt.id);
    if (correct) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 1500);
    } else {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
      setTimeout(() => setSelectedId(null), 800);
    }
  };

  const selectedOpt = shuffled.find((o) => o.id === selectedId);
  const isWrong = selectedId && selectedOpt && !isCorrectType(selectedOpt);

  const renderLine = (opt: LineOption) => {
    const isSelected = selectedId === opt.id;
    const stroke = isSelected && isCorrectType(opt) ? '#22C55E' : isSelected ? '#EF4444' : '#5B21B6';
    const w = isSelected ? 8 : 6;
    if (opt.type === 'vertical') {
      return <Line x1={40} y1={15} x2={40} y2={65} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
    }
    if (opt.type === 'horizontal') {
      return <Line x1={15} y1={40} x2={65} y2={40} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
    }
    if (opt.type === 'slantLeft') {
      return <Line x1={20} y1={60} x2={60} y2={20} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
    }
    return <Line x1={20} y1={20} x2={60} y2={60} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
  };

  return (
    <GameContainerGrip
      title="Tap the Line"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="👆"
      mascotHint={promptType === 'sleeping' ? 'Sleeping = horizontal!' : 'Slanting = diagonal!'}
      onBack={onBack}
    >
      <View style={styles.outer}>
        <Text style={styles.prompt}>{promptType === 'sleeping' ? PROMPTS.sleeping : PROMPTS.slanting}</Text>
        <View style={styles.grid}>
          {shuffled.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                styles.option,
                selectedId === opt.id && isCorrectType(opt) && styles.optionCorrect,
                selectedId === opt.id && !isCorrectType(opt) && styles.optionWrong,
              ]}
              onPress={() => handleTap(opt)}
            >
              <Svg width={80} height={80} viewBox="0 0 80 80">
                {renderLine(opt)}
              </Svg>
            </Pressable>
          ))}
        </View>
        {isWrong && (
          <Text style={styles.hint}>
            {promptType === 'sleeping' ? 'Sleeping lines go left and right (—).' : 'Slanting lines go diagonal (/ or \\).'}
          </Text>
        )}
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#5B21B6', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  option: {
    width: 96,
    height: 96,
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCorrect: { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  hint: { fontSize: 15, color: '#F59E0B', textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
