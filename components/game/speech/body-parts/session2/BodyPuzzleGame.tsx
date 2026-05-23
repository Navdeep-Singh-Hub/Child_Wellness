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

type PieceId = 'head' | 'arm' | 'leg';

const PIECES: { id: PieceId; emoji: string; label: string; slot: string }[] = [
  { id: 'head', emoji: '🙂', label: 'Head', slot: 'top' },
  { id: 'arm', emoji: '💪', label: 'Arm', slot: 'side' },
  { id: 'leg', emoji: '🦵', label: 'Leg', slot: 'bottom' },
];

const SLOTS: { id: string; label: string; emoji: string; accepts: PieceId }[] = [
  { id: 'top', label: 'Head spot', emoji: '⭕', accepts: 'head' },
  { id: 'side', label: 'Arm spot', emoji: '⭕', accepts: 'arm' },
  { id: 'bottom', label: 'Leg spot', emoji: '⭕', accepts: 'leg' },
];

export function BodyPuzzleGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('speech-body-puzzle', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState<PieceId | null>(null);
  const [placed, setPlaced] = useState<Set<PieceId>>(new Set());

  useEffect(() => {
    speakBody('Build the body! Tap a piece, then tap where it goes.');
    return () => clearBodySpeech();
  }, []);

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
        phaseHint={
          selected
            ? `Tap the spot for ${PIECES.find((p) => p.id === selected)?.label}`
            : `Placed ${placed.size} / ${PIECES.length}`
        }
      >
        <View style={styles.figure}>
          <Text style={styles.bodyEmoji}>🧍</Text>
          {SLOTS.map((s) => (
            <Pressable
              key={s.id}
              style={[
                styles.slot,
                s.id === 'top' && styles.slotTop,
                s.id === 'side' && styles.slotSide,
                s.id === 'bottom' && styles.slotBottom,
                placed.has(s.accepts) && styles.slotDone,
              ]}
              onPress={() => onSlot(s.accepts)}
            >
              <Text style={styles.slotText}>
                {placed.has(s.accepts) ? PIECES.find((p) => p.id === s.accepts)?.emoji : s.emoji}
              </Text>
            </Pressable>
          ))}
        </View>
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
  figure: { alignItems: 'center', minHeight: 200, marginBottom: 12 },
  bodyEmoji: { fontSize: 100 },
  slot: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  slotTop: { top: 0 },
  slotSide: { top: 80, right: 40 },
  slotBottom: { bottom: 0 },
  slotDone: { borderStyle: 'solid', backgroundColor: '#C7D2FE' },
  slotText: { fontSize: 28 },
  pieces: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  piece: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    minWidth: 80,
  },
  pieceOn: { borderWidth: 2, borderColor: '#4F46E5' },
  pieceDone: { opacity: 0.35 },
  pieceEmoji: { fontSize: 32 },
  pieceLabel: { fontWeight: '800', marginTop: 4 },
});
