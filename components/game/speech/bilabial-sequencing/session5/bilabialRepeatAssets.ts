import type { BilabialRepeat } from '@/components/game/speech/bilabial-sequencing/modules/bilabialSequencingTypes';
import { repeatToLabel } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingEngine';

export const REPEAT_EMOJI: Record<BilabialRepeat, string> = {
  ma_ma: '🥁',
  pa_pa: '🎈',
  ba_ba: '🐻',
  mmm: '💤',
  watch: '👀',
};

export const REPEAT_LABEL: Record<BilabialRepeat, string> = {
  ma_ma: repeatToLabel('ma_ma'),
  pa_pa: repeatToLabel('pa_pa'),
  ba_ba: repeatToLabel('ba_ba'),
  mmm: repeatToLabel('mmm'),
  watch: 'Watch',
};

export const CORE_REPEATS: { repeat: BilabialRepeat; label: string }[] = [
  { repeat: 'ma_ma', label: 'MA MA' },
  { repeat: 'pa_pa', label: 'PA PA' },
  { repeat: 'ba_ba', label: 'BA BA' },
];

export const ROBOT_REPEATS: { repeat: BilabialRepeat; label: string }[] = [
  { repeat: 'ma_ma', label: 'MA MA' },
  { repeat: 'pa_pa', label: 'PA PA' },
  { repeat: 'mmm', label: 'MMM' },
];

export const TRAIN_RHYTHMS: { repeat: BilabialRepeat; label: string }[] = [
  { repeat: 'ma_ma', label: 'MA → MA' },
  { repeat: 'pa_pa', label: 'PA → PA' },
  { repeat: 'ba_ba', label: 'BA → BA' },
];
