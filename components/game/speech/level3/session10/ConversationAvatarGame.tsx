import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useFluentSession,
  DEFAULT_VOICE_ROUNDS,
  useSpeechHitCounter,
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
  CONVERSATION_PROMPTS,
  type ConversationPrompt,
} from '@/components/game/speech/level3/shared/fluentSpeechGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function ConversationAvatarGame({ onBack, onComplete }: Props) {
  const session = useFluentSession('conversation-avatar', DEFAULT_VOICE_ROUNDS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const prompt: ConversationPrompt =
    CONVERSATION_PROMPTS[promptIndex % CONVERSATION_PROMPTS.length];
  const speech = useSpeechHitCounter(true, prompt.words);
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Chat with your friend!');
    speakGame(CONVERSATION_PROMPTS[0].avatarLine);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPromptIndex(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    holdRef.current = null;
    speech.resetHits();
    const p = CONVERSATION_PROMPTS[0];
    speakGame(p.avatarLine);
    setTimeout(() => speakGame(p.childHint), 1000);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    holdRef.current = null;
  }, [promptIndex]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      if (speech.useSpeech && speech.consumeHit()) {
        lockRef.current = true;
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('Nice talking!');
        const next = promptIndex + 1;
        if (next >= CONVERSATION_PROMPTS.length) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 900);
        } else {
          setPromptIndex(next);
          const p = CONVERSATION_PROMPTS[next];
          setTimeout(() => {
            speakGame(p.avatarLine);
            setTimeout(() => {
              speakGame(p.childHint);
              lockRef.current = false;
            }, 900);
          }, 500);
        }
        return;
      }
      const v = voiceRef.current;
      const { progress: p, done } = sustainedVoice(
        v.level,
        v.active,
        900,
        holdRef,
        VOICE_ACTIVE_THRESHOLD,
      );
      setProgress(p);
      if (!done) return;
      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Nice talking!');
      const next = promptIndex + 1;
      if (next >= CONVERSATION_PROMPTS.length) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 900);
      } else {
        setPromptIndex(next);
        const p = CONVERSATION_PROMPTS[next];
        setTimeout(() => {
          speakGame(p.avatarLine);
          setTimeout(() => {
            speakGame(p.childHint);
            lockRef.current = false;
          }, 900);
        }, 500);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, prompt, promptIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Conversation Avatar"
        subtitle="Answer simple prompts"
        skills="💬 Interactive speech • 🤖 Chat • 🗣️ Reply"
        gradient={['#F3E8FF', '#E9D5FF']}
        accent="#9333EA"
        onBack={onBack}
        progress={promptIndex}
        progressTotal={CONVERSATION_PROMPTS.length}
        roundLabel={`Chat ${promptIndex + 1}/${CONVERSATION_PROMPTS.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.avatar}>🤖</Text>
              <View style={styles.bubble}>
                <Text style={styles.line}>{prompt.avatarLine}</Text>
              </View>
              <Text style={styles.emoji}>{prompt.emoji}</Text>
              <Text style={styles.hint}>{prompt.childHint}</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  avatar: { fontSize: 72 },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    maxWidth: '90%',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  line: { fontSize: 22, fontWeight: '800', color: '#5B21B6', textAlign: 'center' },
  emoji: { fontSize: 40, marginTop: 12 },
  hint: { fontSize: 18, fontWeight: '700', color: '#6B21A8', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 8 },
});
