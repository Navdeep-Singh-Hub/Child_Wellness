import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useFluentSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  BUILD_PHRASES,
  type BuildPhrase,
} from '@/components/game/speech/level3/shared/fluentSpeechGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PHRASES_PER_ROUND = 3;

export function PhraseBuilderGame({ onBack, onComplete }: Props) {
  const session = useFluentSession('phrase-builder', DEFAULT_VOICE_ROUNDS);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phrasesDone, setPhrasesDone] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const phrase: BuildPhrase =
    BUILD_PHRASES[(session.round - 1 + phraseIndex) % BUILD_PHRASES.length];
  const part = phrase.parts[partIndex];
  const speech = useSpeechHitCounter(true, part.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 480 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Build short phrases, one word at a time!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPhraseIndex(0);
    setPhrasesDone(0);
    setPartIndex(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    const p = BUILD_PHRASES[(session.round - 1) % BUILD_PHRASES.length];
    speakGame(`Build: ${p.label}! First say ${p.parts[0].label}`);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [partIndex, phraseIndex]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current || !part) return;
      const { progress: p, matched } = matchStep(
        part,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      const nextPart = partIndex + 1;
      if (nextPart >= phrase.parts.length) {
        speakGame(`Great! ${phrase.label}!`);
        const nextPhrases = phrasesDone + 1;
        setPhrasesDone(nextPhrases);
        if (nextPhrases >= PHRASES_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 900);
        } else {
          const nextIdx = phraseIndex + 1;
          setPhraseIndex(nextIdx);
          setPartIndex(0);
          const next = BUILD_PHRASES[(session.round - 1 + nextIdx) % BUILD_PHRASES.length];
          setTimeout(() => {
            speakGame(`Build: ${next.label}! Say ${next.parts[0].label}`);
            lockRef.current = false;
          }, 700);
        }
      } else {
        setPartIndex(nextPart);
        const next = phrase.parts[nextPart];
        speakGame(next.label);
        setTimeout(() => {
          lockRef.current = false;
        }, 450);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, part, phrase, partIndex, phrasesDone, phraseIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Phrase Builder"
        subtitle="Build short phrases"
        skills="💬 Expressive language • 🧱 Build • 🗣️ Phrases"
        gradient={['#DCFCE7', '#BBF7D0']}
        accent="#16A34A"
        onBack={onBack}
        progress={phrasesDone}
        progressTotal={PHRASES_PER_ROUND}
        roundLabel={`Phrases ${phrasesDone}/${PHRASES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.emoji}>{phrase.emoji}</Text>
              <View style={styles.blocks}>
                {phrase.parts.map((p, i) => (
                  <View
                    key={i}
                    style={[styles.block, i < partIndex && styles.blockDone, i === partIndex && styles.blockActive]}
                  >
                    <Text style={styles.blockText}>{i < partIndex ? p.label : i === partIndex ? p.label : '?'}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.full}>{phrase.label}</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          );
        }}
      </VoiceGameFrame>
      <VoiceGameOverlays
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 12 },
  blocks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  block: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  blockDone: { backgroundColor: '#22C55E', borderColor: '#16A34A' },
  blockActive: { borderColor: '#15803D', transform: [{ scale: 1.05 }] },
  blockText: { fontSize: 18, fontWeight: '900', color: '#14532D' },
  full: { fontSize: 22, fontWeight: '800', color: '#166534', marginTop: 16 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 8 },
});
