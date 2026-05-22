import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useWordGameSession,
  DEFAULT_VOICE_ROUNDS,
  TOY_CUES,
  tickWordMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type WordCue,
} from '@/components/game/speech/level3/shared/wordGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function ToyVoiceUnlockGame({ onBack, onComplete }: Props) {
  const session = useWordGameSession('toy-voice-unlock', DEFAULT_VOICE_ROUNDS);
  const [toyIndex, setToyIndex] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [progress, setProgress] = useState(0);
  const cue: WordCue = TOY_CUES[toyIndex % TOY_CUES.length];
  const speech = useSpeechHitCounter(true, cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 550 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    speakGame('Say each toy name to unlock!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setToyIndex(0);
    setUnlocked(0);
    setUnlockedIds([]);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame(`Say ${TOY_CUES[0].label} to unlock!`);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [toyIndex, cue.label]);

  const onUnlock = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame(`${cue.label} unlocked!`);
    setUnlockedIds((ids) => [...ids, cue.label]);
    const nextCount = unlocked + 1;
    setUnlocked(nextCount);
    if (nextCount >= TOY_CUES.length) {
      roundDoneRef.current = true;
      speakGame('All toys unlocked! Amazing speech!');
      setTimeout(() => session.completeRound(), 900);
    } else {
      const nextIdx = toyIndex + 1;
      setToyIndex(nextIdx);
      const nextCue = TOY_CUES[nextIdx % TOY_CUES.length];
      setTimeout(() => {
        speakGame(`Say ${nextCue.label}!`);
        lockRef.current = false;
      }, 700);
      return;
    }
    setTimeout(() => {
      lockRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickWordMatch(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        650,
      );
      setProgress(p);
      if (matched) onUnlock();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, cue, unlocked, toyIndex]);

  return (
    <>
      <VoiceGameFrame
        title="Toy Voice Unlock"
        subtitle="Speak toy names to unlock"
        skills="🧸 Motivation speech • 🔓 Unlock • 🗣️ Names"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        progress={unlocked}
        progressTotal={TOY_CUES.length}
        roundLabel={`Unlocked ${unlocked}/${TOY_CUES.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <View style={styles.shelf}>
                {TOY_CUES.map((t) => {
                  const isOpen = unlockedIds.includes(t.label);
                  return (
                    <View key={t.label} style={styles.slot}>
                      <Text style={styles.toy}>{isOpen ? t.emoji : '🔒'}</Text>
                      <Text style={[styles.name, isOpen && styles.nameOpen]}>{t.label}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.target}>
                {cue.emoji} — say “{cue.label}”
              </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  shelf: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  slot: { alignItems: 'center', minWidth: 72 },
  toy: { fontSize: 48 },
  name: { fontSize: 14, fontWeight: '800', color: '#6B7280', marginTop: 4 },
  nameOpen: { color: '#5B21B6' },
  target: { fontSize: 22, fontWeight: '900', color: '#5B21B6', textAlign: 'center' },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 8 },
});
