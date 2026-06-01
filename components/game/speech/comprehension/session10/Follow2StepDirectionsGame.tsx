import {
  clearComprehensionSpeech,
  ComprehensionOverlays,
  ComprehensionShell,
  DEFAULT_COMPREHENSION_ROUNDS,
  hapticComprehensionSuccess,
  speakComprehension,
  useComprehensionSession,
} from '@/components/game/speech/comprehension/shared/comprehensionShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    item: '⚽',
    itemImageKey: 'ball-big' as const,
    itemLabel: 'ball',
    furniture: '🪑',
    furnitureImageKey: 'chair' as const,
    zone: 'under',
    say: 'Put the ball under the chair.',
  },
  {
    item: '🧸',
    itemImageKey: 'teddy' as const,
    itemLabel: 'teddy',
    furniture: '🛏️',
    furnitureImageKey: 'bed' as const,
    zone: 'on',
    say: 'Put teddy on the bed.',
  },
  {
    item: '📚',
    itemImageKey: 'book' as const,
    itemLabel: 'book',
    furniture: '📦',
    furnitureImageKey: 'box' as const,
    zone: 'in',
    say: 'Put the book in the box.',
  },
];

export function Follow2StepDirectionsGame({ onBack, onComplete }: Props) {
  const session = useComprehensionSession('follow-2-step-directions', DEFAULT_COMPREHENSION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakComprehension('Follow two steps! Pick the object, then put it where you hear.');
    return () => clearComprehensionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setStep(0);
    setPlaced(false);
    speakComprehension(round.say);
  }, [session.round, canPlay, round.say]);

  const onZone = () => {
    if (step < 1) {
      speakComprehension(`Tap the ${round.itemLabel} first!`);
      return;
    }
    hapticComprehensionSuccess();
    setPlaced(true);
    speakComprehension('You followed both steps!');
    setTimeout(() => session.completeRound(), 800);
  };

  return (
    <>
      <ComprehensionShell
        title="Follow 2-Step Directions"
        subtitle="Put object in the right place"
        skills="👂 Multi-step processing"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={step === 0 ? `Step 1: tap ${round.itemLabel}` : `Step 2: ${round.zone} ${round.furniture === '🪑' ? 'chair' : round.furniture === '🛏️' ? 'bed' : 'box'}`}
      >
        <Text style={styles.direction}>{round.say}</Text>
        <View style={styles.scene}>
          <Level2Picture imageKey={round.furnitureImageKey} emoji={round.furniture} size={64} />
          <Pressable
            style={[styles.zone, step >= 1 && styles.zoneActive, placed && styles.zoneDone]}
            onPress={onZone}
          >
            <Text style={styles.zoneLabel}>{round.zone.toUpperCase()}</Text>
            {placed ? <Level2Picture imageKey={round.itemImageKey} emoji={round.item} size={32} /> : null}
          </Pressable>
        </View>
        {!placed ? (
          <Pressable
            style={[styles.item, step >= 1 && styles.itemDone]}
            onPress={() => {
              setStep(1);
              speakComprehension(`Good! Now put it ${round.zone}.`);
            }}
          >
            <Level2Picture imageKey={round.itemImageKey} emoji={round.item} size={48} />
          </Pressable>
        ) : null}
      </ComprehensionShell>
      <ComprehensionOverlays
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
  direction: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1E40AF', marginBottom: 10 },
  scene: { alignItems: 'center', marginBottom: 12 },
  furniture: { fontSize: 64 },
  zone: {
    marginTop: 8,
    padding: 14,
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2563EB',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  zoneActive: { borderStyle: 'solid', backgroundColor: '#DBEAFE' },
  zoneDone: { backgroundColor: '#BFDBFE' },
  zoneLabel: { fontSize: 14, fontWeight: '900', color: '#2563EB' },
  placed: { fontSize: 32, marginTop: 6 },
  item: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  itemDone: { opacity: 0.5 },
  itemEmoji: { fontSize: 48 },
});
