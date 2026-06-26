import { TherapyAdventureCard } from '@/components/therapyProgress/TherapyAdventureCard';
import { THERAPIES } from '@/constants/therapyProgressDesign';
import type { TherapyProgress } from '@/utils/api';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  progressMap: Map<string, TherapyProgress>;
  onSelect: (therapyId: string) => void;
  saving: boolean;
};

export function TherapyAdventureGrid({ progressMap, onSelect, saving }: Props) {
  return (
    <View style={styles.grid}>
      {THERAPIES.map((therapy, index) => (
        <TherapyAdventureCard
          key={therapy.id}
          therapy={therapy}
          index={index}
          progress={progressMap.get(therapy.id)}
          onSelect={onSelect}
          saving={saving}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 16 },
});
