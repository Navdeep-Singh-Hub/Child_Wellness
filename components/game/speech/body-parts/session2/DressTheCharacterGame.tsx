import {
  BodyPartsOverlays,
  BodyPartsShell,
  clearBodySpeech,
  DEFAULT_BODY_ROUNDS,
  hapticBodySuccess,
  speakBody,
  useBodyPartsSession,
} from '@/components/game/speech/body-parts/shared/bodyPartsShared';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type ClothId = 'hat' | 'shirt' | 'pants';

const CLOTHES: { id: ClothId; emoji: string; label: string; zone: string }[] = [
  { id: 'hat', emoji: '🧢', label: 'Hat', zone: 'head' },
  { id: 'shirt', emoji: '👕', label: 'Shirt', zone: 'body' },
  { id: 'pants', emoji: '👖', label: 'Pants', zone: 'legs' },
];

const ZONES: { id: string; label: string; accepts: ClothId }[] = [
  { id: 'head', label: 'Head', accepts: 'hat' },
  { id: 'body', label: 'Body', accepts: 'shirt' },
  { id: 'legs', label: 'Legs', accepts: 'pants' },
];

export function DressTheCharacterGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('dress-the-character', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState<ClothId | null>(null);
  const [dressed, setDressed] = useState<Set<ClothId>>(new Set());

  useEffect(() => {
    speakBody('Dress the character! Tap clothes, then tap the right place.');
    return () => clearBodySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSelected(null);
    setDressed(new Set());
    speakBody('Put on the hat, shirt, and pants!');
  }, [session.round, canPlay]);

  const onZone = (accepts: ClothId) => {
    if (!selected || dressed.has(accepts)) return;
    if (selected === accepts) {
      hapticBodySuccess();
      const next = new Set(dressed);
      next.add(accepts);
      setDressed(next);
      setSelected(null);
      speakBody('Looks great!');
      if (next.size >= CLOTHES.length) {
        setTimeout(() => session.completeRound(), 800);
      }
    } else {
      speakBody('That goes somewhere else!');
    }
  };

  return (
    <>
      <BodyPartsShell
        title="Dress the Character"
        subtitle="Place clothes on the body"
        skills="👕 Body mapping"
        gradient={['#FEF9C3', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={selected ? 'Tap where it goes on the body' : `Dressed ${dressed.size} / 3`}
      >
        <View style={styles.charWrap}>
          <Text style={styles.char}>🧒</Text>
          {ZONES.map((z) => (
            <Pressable
              key={z.id}
              style={[
                styles.zone,
                z.id === 'head' && styles.zoneHead,
                z.id === 'body' && styles.zoneBody,
                z.id === 'legs' && styles.zoneLegs,
                dressed.has(z.accepts) && styles.zoneDone,
              ]}
              onPress={() => onZone(z.accepts)}
            >
              <Text style={styles.zoneEmoji}>
                {dressed.has(z.accepts)
                  ? CLOTHES.find((c) => c.id === z.accepts)?.emoji
                  : '➕'}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.clothes}>
          {CLOTHES.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.cloth, selected === c.id && styles.clothOn, dressed.has(c.id) && styles.clothDone]}
              disabled={dressed.has(c.id)}
              onPress={() => setSelected(c.id)}
            >
              <Text style={styles.clothEmoji}>{c.emoji}</Text>
              <Text style={styles.clothLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      </BodyPartsShell>
      <BodyPartsOverlays
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
  charWrap: { alignItems: 'center', minHeight: 220 },
  char: { fontSize: 110 },
  zone: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CA8A04',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  zoneHead: { top: 8 },
  zoneBody: { top: 90 },
  zoneLegs: { bottom: 20 },
  zoneDone: { borderStyle: 'solid', backgroundColor: '#FEF08A' },
  zoneEmoji: { fontSize: 26 },
  clothes: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 },
  cloth: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center' },
  clothOn: { borderWidth: 2, borderColor: '#CA8A04' },
  clothDone: { opacity: 0.35 },
  clothEmoji: { fontSize: 36 },
  clothLabel: { fontWeight: '800', marginTop: 4 },
});
