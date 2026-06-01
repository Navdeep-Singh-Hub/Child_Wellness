import {
  VocabularyOverlays,
  VocabularyShell,
  clearVocabSpeech,
  DEFAULT_VOCAB_ROUNDS,
  hapticVocabSuccess,
  speakVocab,
  useVocabularySession,
} from '@/components/game/speech/vocabulary/shared/vocabularyShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type VehicleId = 'car' | 'bus' | 'plane';

const VEHICLES: { id: VehicleId; emoji: string; label: string; garage: string; imageKey: Level2ImageKey; garageImageKey?: Level2ImageKey }[] = [
  { id: 'car', emoji: '🚗', label: 'Car', garage: '🏠', imageKey: 'car', garageImageKey: 'garage-car' },
  { id: 'bus', emoji: '🚌', label: 'Bus', garage: '🛖', imageKey: 'bus', garageImageKey: 'garage-bus' },
  { id: 'plane', emoji: '✈️', label: 'Plane', garage: '🛫', imageKey: 'plane', garageImageKey: 'garage-plane' },
];

export function VehicleGarageGame({ onBack, onComplete }: Props) {
  const session = useVocabularySession('vehicle-garage', DEFAULT_VOCAB_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState<VehicleId | null>(null);
  const [parked, setParked] = useState<Set<VehicleId>>(new Set());

  useEffect(() => {
    speakVocab('Match each vehicle to its garage! Tap a vehicle, then its garage.');
    return () => clearVocabSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSelected(null);
    setParked(new Set());
    speakVocab('Park all three vehicles!');
  }, [session.round, canPlay]);

  const onGarage = (id: VehicleId) => {
    if (!selected) {
      speakVocab('Pick a vehicle first!');
      return;
    }
    if (selected === id) {
      hapticVocabSuccess();
      const next = new Set(parked);
      next.add(id);
      setParked(next);
      setSelected(null);
      speakVocab('Parked!');
      if (next.size >= VEHICLES.length) {
        setTimeout(() => session.completeRound(), 800);
      }
    } else {
      speakVocab('Wrong garage — try again!');
    }
  };

  return (
    <>
      <VocabularyShell
        title="Vehicle Garage"
        subtitle="Match vehicles to garages"
        skills="🚗 Object recognition"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={selected ? 'Tap the matching garage' : `Parked ${parked.size} / 3`}
      >
        <View style={styles.vehicles}>
          {VEHICLES.map((v) => (
            <Pressable
              key={v.id}
              style={[
                styles.vehicle,
                selected === v.id && styles.vehicleOn,
                parked.has(v.id) && styles.vehicleDone,
              ]}
              disabled={parked.has(v.id)}
              onPress={() => setSelected(v.id)}
            >
              <Level2Picture imageKey={v.imageKey} emoji={v.emoji} size={36} />
              <Text style={styles.label}>{v.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.garages}>
          {VEHICLES.map((v) => (
            <Pressable
              key={`g-${v.id}`}
              style={[styles.garage, parked.has(v.id) && styles.garageDone]}
              onPress={() => onGarage(v.id)}
            >
              {parked.has(v.id) ? (
                <Level2Picture imageKey={v.imageKey} emoji={v.emoji} size={32} />
              ) : v.garageImageKey ? (
                <Level2Picture imageKey={v.garageImageKey} emoji={v.garage} size={32} />
              ) : (
                <Text style={styles.garageEmoji}>{v.garage}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </VocabularyShell>
      <VocabularyOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  vehicles: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  vehicle: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    minWidth: 88,
  },
  vehicleOn: { borderWidth: 2, borderColor: '#2563EB' },
  vehicleDone: { opacity: 0.35 },
  label: { fontWeight: '800', marginTop: 4 },
  garages: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  garage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  garageDone: { borderStyle: 'solid', backgroundColor: '#BFDBFE' },
  garageEmoji: { fontSize: 32 },
});
