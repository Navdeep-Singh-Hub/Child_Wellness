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
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type PieceId = 'head' | 'arm' | 'leg';

const PIECES: { id: PieceId; emoji: string; label: string; slot: 'head' | 'arm' | 'leg' }[] = [
  { id: 'head', emoji: '🙂', label: 'Head', slot: 'head' },
  { id: 'arm', emoji: '💪', label: 'Arm', slot: 'arm' },
  { id: 'leg', emoji: '🦵', label: 'Leg', slot: 'leg' },
];

export function BodyPuzzleGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('speech-body-puzzle', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState<PieceId | null>(null);
  const [placed, setPlaced] = useState<Set<PieceId>>(new Set());
  const layout = useBodyFigureLayout();

  useEffect(() => () => clearBodySpeech(), []);

  useEffect(() => {
    if (!canPlay) return;
    setSelected(null);
    setPlaced(new Set());
    speakBody('Put all the body parts in place!');
  }, [session.round, canPlay]);

  const onSlot = (accepts: PieceId) => {
    if (!selected || placed.has(accepts)) return;
    if (selected === accepts) {
      hapticBodySuccess();
      const next = new Set(placed);
      next.add(accepts);
      setPlaced(next);
      setSelected(null);
      speakBody('Good fit!');
      if (next.size >= PIECES.length) {
        setTimeout(() => session.completeRound(), 800);
      }
    } else {
      speakBody('Try a different spot!');
    }
  };

  const slotTextSize = Math.round(layout.slotSize * 0.48);

  return (
    <>
      <BodyPartsShell
        title="Body Puzzle"
        subtitle="Place body parts on the figure"
        skills="🧩 Recognition"
        gradient={['#E0E7FF', '#A5B4FC']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🧒"
        startTitle="Build the body!"
        instructionSteps={[
          'Tap Head, Arm, or Leg at the bottom.',
          'Tap the matching circle on the person.',
          'Place all three parts to finish the round.',
        ]}
        onSpeakStart={() =>
          speakBody('Build the body! Tap a piece, then tap where it goes on the person.')
        }
        phaseHint={
          selected
            ? `Tap the spot for ${PIECES.find((p) => p.id === selected)?.label}`
            : `Placed ${placed.size} / ${PIECES.length}`
        }
      >
        <View style={styles.playColumn}>
          <BodyFigure layout={layout} style={styles.figureMargin}>
            {PIECES.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.slot,
                  {
                    width: layout.slotSize,
                    height: layout.slotSize,
                    borderRadius: layout.slotHalf,
                    ...slotStyleFor(p.slot, layout),
                  },
                  placed.has(p.id) && styles.slotDone,
                ]}
                accessibilityLabel={`${p.label} spot`}
                onPress={() => onSlot(p.id)}
              >
                <Text style={[styles.slotText, { fontSize: slotTextSize }]}>
                  {placed.has(p.id) ? p.emoji : '⭕'}
                </Text>
              </Pressable>
            ))}
          </BodyFigure>
          <View style={styles.pieces}>
            {PIECES.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.piece,
                  selected === p.id && styles.pieceOn,
                  placed.has(p.id) && styles.pieceDone,
                ]}
                disabled={placed.has(p.id)}
                onPress={() => setSelected(p.id)}
              >
                <Text style={styles.pieceEmoji}>{p.emoji}</Text>
                <Text style={styles.pieceLabel}>{p.label}</Text>
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
  slot: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 2,
  },
  slotDone: { borderStyle: 'solid', backgroundColor: '#C7D2FE' },
  slotText: { fontWeight: '800' },
  pieces: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  piece: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    minWidth: 88,
  },
  pieceOn: { borderWidth: 2, borderColor: '#4F46E5' },
  pieceDone: { opacity: 0.35 },
  pieceEmoji: { fontSize: 36 },
  pieceLabel: { fontWeight: '800', fontSize: 17, marginTop: 6, color: '#0F172A' },
});
