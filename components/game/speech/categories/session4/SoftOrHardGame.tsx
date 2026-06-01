import {
  CategoriesOverlays,
  CategoriesShell,
  CategoryTile,
  clearCategorySpeech,
  DEFAULT_CATEGORY_ROUNDS,
  hapticCategorySuccess,
  speakCategory,
  useCategoriesSession,
} from '@/components/game/speech/categories/shared/categoriesShared';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Texture = 'soft' | 'hard';

const ITEMS: { id: string; label: string; emoji: string; texture: Texture; imageKey: Level2ImageKey }[] = [
  { id: 'pillow', label: 'Pillow', emoji: '🛏️', texture: 'soft', imageKey: 'pillow' },
  { id: 'teddy', label: 'Teddy', emoji: '🧸', texture: 'soft', imageKey: 'teddy' },
  { id: 'rock', label: 'Rock', emoji: '🪨', texture: 'hard', imageKey: 'rock' },
  { id: 'block', label: 'Block', emoji: '🧱', texture: 'hard', imageKey: 'brick' },
];

export function SoftOrHardGame({ onBack, onComplete }: Props) {
  const session = useCategoriesSession('soft-or-hard', DEFAULT_CATEGORY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const target: Texture = session.round % 2 === 1 ? 'soft' : 'hard';

  useEffect(() => {
    speakCategory('Is it soft or hard?');
    return () => clearCategorySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSorted(new Set());
    speakCategory(`Tap all the ${target} things!`);
  }, [session.round, canPlay, target]);

  const need = ITEMS.filter((i) => i.texture === target);
  const left = need.filter((i) => !sorted.has(i.id)).length;

  return (
    <>
      <CategoriesShell
        title="Soft or Hard?"
        subtitle="Match how things feel"
        skills="✋ Descriptive concepts"
        gradient={['#F3E8FF', '#D8B4FE']}
        accent="#9333EA"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find ${target} — ${left} left`}
      >
        <View style={styles.row}>
          <Pressable style={styles.badge}>
            <Text style={styles.badgeText}>🧸 SOFT</Text>
          </Pressable>
          <Pressable style={styles.badge}>
            <Text style={styles.badgeText}>🪨 HARD</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {ITEMS.map((item) => (
            <CategoryTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              imageKey={item.imageKey}
              accent="#9333EA"
              dimmed={sorted.has(item.id)}
              onPress={() => {
                if (item.texture === target) {
                  if (sorted.has(item.id)) return;
                  hapticCategorySuccess();
                  const next = new Set(sorted);
                  next.add(item.id);
                  setSorted(next);
                  speakCategory(item.texture === 'soft' ? 'Soft!' : 'Hard!');
                  if (need.every((n) => next.has(n.id))) {
                    setTimeout(() => session.completeRound(), 800);
                  }
                } else {
                  speakCategory(`That feels ${item.texture}, not ${target}!`);
                }
              }}
            />
          ))}
        </View>
      </CategoriesShell>
      <CategoriesOverlays
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
  row: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  badgeText: { fontWeight: '900', color: '#6B21A8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
