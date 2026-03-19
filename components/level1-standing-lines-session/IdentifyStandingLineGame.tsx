/**
 * Game 3: Tap the standing line — show vertical, horizontal, slanted; prompt "Tap the standing line".
 */
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

type LineType = 'vertical' | 'horizontal' | 'slanted';

interface LineOption {
  id: string;
  type: LineType;
}

const OPTIONS: LineOption[] = [
  { id: 'v', type: 'vertical' },
  { id: 'h', type: 'horizontal' },
  { id: 's1', type: 'slanted' },
  { id: 's2', type: 'slanted' },
];

export function IdentifyStandingLineGame({
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
  const shuffled = useMemo(() => [...OPTIONS].sort(() => Math.random() - 0.5), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleTap = (opt: LineOption) => {
    if (selectedId) return;
    const correct = opt.type === 'vertical';
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

  const isWrong = selectedId && shuffled.find((o) => o.id === selectedId)?.type !== 'vertical';

  const renderLine = (opt: LineOption) => {
    const isSelected = selectedId === opt.id;
    const stroke = isSelected && opt.type === 'vertical' ? '#22C55E' : isSelected ? '#EF4444' : '#5B21B6';
    if (opt.type === 'vertical') {
      return <Line x1={40} y1={15} x2={40} y2={65} stroke={stroke} strokeWidth={isSelected ? 8 : 6} strokeLinecap="round" />;
    }
    if (opt.type === 'horizontal') {
      return <Line x1={15} y1={40} x2={65} y2={40} stroke={stroke} strokeWidth={isSelected ? 8 : 6} strokeLinecap="round" />;
    }
    return <Line x1={20} y1={60} x2={60} y2={20} stroke={stroke} strokeWidth={isSelected ? 8 : 6} strokeLinecap="round" />;
  };

  return (
    <GameContainerGrip
      title="Tap the Standing Line"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="👆"
      mascotHint="Tap the standing (vertical) line!"
      onBack={onBack}
    >
      <View style={styles.outer}>
        <Text style={styles.prompt}>Tap the standing line</Text>
        <View style={styles.grid}>
          {shuffled.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.option, selectedId === opt.id && opt.type === 'vertical' && styles.optionCorrect, selectedId === opt.id && opt.type !== 'vertical' && styles.optionWrong]}
              onPress={() => handleTap(opt)}
            >
              <Svg width={80} height={80} viewBox="0 0 80 80">
                {renderLine(opt)}
              </Svg>
            </Pressable>
          ))}
        </View>
        {isWrong && <Text style={styles.hint}>The standing line goes up and down. Try again!</Text>}
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#5B21B6', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  option: { width: 100, height: 100, backgroundColor: '#EDE9FE', borderRadius: 20, borderWidth: 3, borderColor: '#C4B5FD', alignItems: 'center', justifyContent: 'center' },
  optionCorrect: { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  hint: { fontSize: 15, color: '#F59E0B', textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
