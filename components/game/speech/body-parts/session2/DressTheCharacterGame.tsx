import {
  BodyPartsOverlays,
  BodyPartsShell,
  clearBodySpeech,
  DEFAULT_BODY_ROUNDS,
  hapticBodySuccess,
  speakBody,
  useBodyPartsSession,
} from '@/components/game/speech/body-parts/shared/bodyPartsShared';
import { BodyFigure } from '@/components/game/speech/body-parts/shared/BodyFigure';
import {
  slotStyleFor,
  useBodyFigureLayout,
} from '@/components/game/speech/body-parts/shared/bodyFigureLayout';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type ClothId = 'hat' | 'shirt' | 'pants';

const CLOTHES: {
  id: ClothId;
  emoji: string;
  label: string;
  slot: 'head' | 'torso' | 'leg';
  imageKey: Level2ImageKey;
}[] = [
  { id: 'hat', emoji: '🧢', label: 'Hat', slot: 'head', imageKey: 'clothing-hat' },
  { id: 'shirt', emoji: '👕', label: 'Shirt', slot: 'torso', imageKey: 'clothing-shirt' },
  { id: 'pants', emoji: '👖', label: 'Pants', slot: 'leg', imageKey: 'clothing-pants' },
];

export function DressTheCharacterGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('dress-the-character', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState<ClothId | null>(null);
  const [dressed, setDressed] = useState<Set<ClothId>>(new Set());
  const layout = useBodyFigureLayout();

  useEffect(() => () => clearBodySpeech(), []);

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

  const zoneSize = Math.max(58, Math.round(layout.slotSize * 0.95));
  const zoneHalf = zoneSize / 2;
  const zoneEmojiSize = Math.round(zoneSize * 0.5);

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
        startEmoji="🧒"
        startTitle="Dress the character!"
        instructionSteps={[
          'Tap Hat, Shirt, or Pants at the bottom.',
          'Tap the matching spot on the big person.',
          'Dress all three areas to finish the round.',
        ]}
        onSpeakStart={() =>
          speakBody('Dress the character! Tap clothes, then tap the right place on the body.')
        }
        phaseHint={selected ? 'Tap where it goes on the body' : `Dressed ${dressed.size} / 3`}
      >
        <View style={styles.playColumn}>
          <BodyFigure layout={layout} style={styles.figureMargin}>
            {CLOTHES.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.zone,
                  {
                    width: zoneSize,
                    height: zoneSize,
                    borderRadius: 14,
                    ...slotStyleFor(c.slot, { ...layout, slotHalf: zoneHalf, slotSize: zoneSize }),
                  },
                  dressed.has(c.id) && styles.zoneDone,
                ]}
                accessibilityLabel={c.label}
                onPress={() => onZone(c.id)}
              >
                {dressed.has(c.id) ? (
                  <Level2Picture imageKey={c.imageKey} emoji={c.emoji} size={zoneEmojiSize} />
                ) : (
                  <Text style={[styles.zoneEmoji, { fontSize: zoneEmojiSize }]}>➕</Text>
                )}
              </Pressable>
            ))}
          </BodyFigure>
          <View style={styles.clothes}>
            {CLOTHES.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.cloth,
                  selected === c.id && styles.clothOn,
                  dressed.has(c.id) && styles.clothDone,
                ]}
                disabled={dressed.has(c.id)}
                onPress={() => setSelected(c.id)}
              >
                <Level2Picture imageKey={c.imageKey} emoji={c.emoji} size={38} />
                <Text style={styles.clothLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
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
  playColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  figureMargin: { marginBottom: 12 },
  zone: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#CA8A04',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    zIndex: 2,
  },
  zoneDone: { borderStyle: 'solid', backgroundColor: '#FEF08A' },
  zoneEmoji: { fontWeight: '800' },
  clothes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  cloth: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    minWidth: 88,
  },
  clothOn: { borderWidth: 2, borderColor: '#CA8A04' },
  clothDone: { opacity: 0.35 },
  clothLabel: { fontWeight: '800', fontSize: 17, marginTop: 6, color: '#0F172A' },
});
