import {
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  VOICE_ACTIVE_THRESHOLD,
  VoiceGameFrame,
  VoiceGameOverlays,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
};

type Splat = { id: number; x: number; y: number; size: number; color: string };

const COLORS = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#FB7185'];
const SPLATS_NEEDED = 12;
const COOLDOWN_MS = 280;

export function SoundPaintGame({ onBack, onComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const session = useVoiceGameSession('sound-paint', 1);
  const [splats, setSplats] = useState<Splat[]>([]);
  const [splatCount, setSplatCount] = useState(0);
  const idRef = useRef(0);
  const lastSplatRef = useRef(0);
  const voiceRef = useRef({ level: 0, active: false });
  const completedRef = useRef(false);

  useEffect(() => {
    speakGame('Make sounds to paint colors on the screen!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (!active || session.gameFinished) return;
      if (level < VOICE_ACTIVE_THRESHOLD) return;
      const now = Date.now();
      if (now - lastSplatRef.current < COOLDOWN_MS) return;
      lastSplatRef.current = now;
      const pad = 40;
      const splat: Splat = {
        id: idRef.current++,
        x: pad + Math.random() * Math.max(80, width - pad * 2 - 80),
        y: pad + Math.random() * Math.max(80, height * 0.45),
        size: 36 + level * 80,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      setSplats((prev) => [...prev.slice(-40), splat]);
      setSplatCount((c) => {
        const next = c + 1;
        if (next >= SPLATS_NEEDED && !completedRef.current) {
          completedRef.current = true;
          speakGame('Beautiful sound painting!');
          setTimeout(() => session.completeRound(), 800);
        }
        return next;
      });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }, 50);
    return () => clearInterval(tick);
  }, [session.gameFinished, width, height, session]);

  return (
    <>
      <VoiceGameFrame
        title="Sound Paint"
        subtitle="Your voice creates colors"
        skills="🎨 Cause & effect • 🗣️ Vocal play • ✨ Creativity"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        progress={Math.min(SPLATS_NEEDED, splatCount)}
        progressTotal={SPLATS_NEEDED}
        roundLabel={`Paint splats: ${splatCount} / ${SPLATS_NEEDED}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.canvas}>
              <Text style={styles.canvasHint}>🎤 Hum, talk, or say “ahh” to paint!</Text>
              {splats.map((s) => (
                <View
                  key={s.id}
                  style={[
                    styles.splat,
                    {
                      left: s.x,
                      top: s.y,
                      width: s.size,
                      height: s.size,
                      borderRadius: s.size / 2,
                      backgroundColor: s.color,
                    },
                  ]}
                />
              ))}
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
  canvas: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FDBA74',
    overflow: 'hidden',
  },
  canvasHint: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    fontWeight: '800',
    color: '#9A3412',
    zIndex: 2,
  },
  splat: { position: 'absolute', opacity: 0.85 },
});
