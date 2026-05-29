import type { RhythmBeat } from '@/components/game/speech/motor-speech-timing/modules/motorSpeechTimingTypes';
import { rhythmToLabel } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingEngine';

export const RHYTHM_EMOJI: Record<RhythmBeat, string> = {
  ma_pause_ma: '🥁',
  pa_pause_pa: '🎵',
  aaa_pause_aaa: '😮',
  oo_pause_oo: '😗',
  watch: '👀',
};

export const RHYTHM_LABEL: Record<RhythmBeat, string> = {
  ma_pause_ma: rhythmToLabel('ma_pause_ma'),
  pa_pause_pa: rhythmToLabel('pa_pause_pa'),
  aaa_pause_aaa: rhythmToLabel('aaa_pause_aaa'),
  oo_pause_oo: rhythmToLabel('oo_pause_oo'),
  watch: 'Watch',
};

export const CORE_RHYTHMS: { rhythm: RhythmBeat; label: string }[] = [
  { rhythm: 'ma_pause_ma', label: 'MA … MA' },
  { rhythm: 'pa_pause_pa', label: 'PA … PA' },
  { rhythm: 'aaa_pause_aaa', label: 'AAA … AAA' },
];

export const TRAIN_RHYTHMS: { rhythm: RhythmBeat; label: string }[] = [
  { rhythm: 'ma_pause_ma', label: 'MA … MA' },
  { rhythm: 'pa_pause_pa', label: 'PA … PA' },
  { rhythm: 'oo_pause_oo', label: 'OO … OO' },
];
