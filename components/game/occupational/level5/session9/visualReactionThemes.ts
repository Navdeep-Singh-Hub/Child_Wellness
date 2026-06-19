import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type ReactionBackdropId = 'flash' | 'traffic' | 'pop' | 'synesthesia' | 'split';

export type ReactionCopy = {
  gameTitle: string;
  emoji: string;
  tagline: string;
  introBody: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  congrats: string;
  scoreLabel: string;
  rootBg: string;
  backdrop: ReactionBackdropId;
};

export type ReactionThemeBundle = { theme: Session2ThemeTokens; copy: ReactionCopy };

export const FLASH_TAP_THEME: Session2ThemeTokens = {
  sky: ['#0F172A', '#1E293B', '#334155', '#475569'],
  title: '#FEF08A', subtitle: '#FDE047', accent: '#FACC15', accentDark: '#EAB308',
  hudGlass: 'rgba(15,23,42,0.9)', hudBorder: 'rgba(250,204,21,0.35)', cue: '#FEF9C3',
};

export const FLASH_TAP_COPY: ReactionCopy = {
  gameTitle: 'Lightning Flash', emoji: '💡', tagline: 'Reflex Grid · Flash Response',
  introBody: 'A bright flash appears for a split second. Tap it as fast as you can before it vanishes!',
  chips: ['💡 Flash', '⚡ Reflex', '👆 Tap'], startLabel: 'Ready Reflexes', startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Lightning Reflex!', scoreLabel: 'HITS', rootBg: '#0F172A', backdrop: 'flash',
};

export const GO_STOP_THEME: Session2ThemeTokens = {
  sky: ['#14532D', '#166534', '#15803D', '#22C55E'],
  title: '#DCFCE7', subtitle: '#BBF7D0', accent: '#4ADE80', accentDark: '#22C55E',
  hudGlass: 'rgba(20,83,45,0.88)', hudBorder: 'rgba(74,222,128,0.35)', cue: '#F0FDF4',
};

export const GO_STOP_COPY: ReactionCopy = {
  gameTitle: 'Signal Control', emoji: '🚦', tagline: 'Traffic Arena · Inhibition',
  introBody: 'Green means GO — tap fast! Red means STOP — hold back and do not tap. Train your impulse control!',
  chips: ['🟢 Go', '🔴 Stop', '🧠 Control'], startLabel: 'Start Signals', startGradient: ['#4ADE80', '#22C55E', '#16A34A'],
  congrats: 'Signal Master!', scoreLabel: 'GOs', rootBg: '#14532D', backdrop: 'traffic',
};

export const SURPRISE_POP_THEME: Session2ThemeTokens = {
  sky: ['#7C2D12', '#9A3412', '#C2410C', '#EA580C'],
  title: '#FFEDD5', subtitle: '#FED7AA', accent: '#FB923C', accentDark: '#F97316',
  hudGlass: 'rgba(124,45,18,0.88)', hudBorder: 'rgba(251,146,60,0.4)', cue: '#FFF7ED',
};

export const SURPRISE_POP_COPY: ReactionCopy = {
  gameTitle: 'Pop Alert', emoji: '💥', tagline: 'Surprise Zone · Vigilance',
  introBody: 'Objects pop up at random times and places. Stay alert and tap each surprise before it disappears!',
  chips: ['💥 Pop', '👀 Alert', '👆 Tap'], startLabel: 'Stay Alert', startGradient: ['#FB923C', '#F97316', '#EA580C'],
  congrats: 'Alert Ace!', scoreLabel: 'POPS', rootBg: '#7C2D12', backdrop: 'pop',
};

export const SOUND_LIGHT_THEME: Session2ThemeTokens = {
  sky: ['#4C1D95', '#6B21A8', '#7E22CE', '#A855F7'],
  title: '#F3E8FF', subtitle: '#E9D5FF', accent: '#C084FC', accentDark: '#A855F7',
  hudGlass: 'rgba(76,29,149,0.88)', hudBorder: 'rgba(192,132,252,0.4)', cue: '#FAE8FF',
};

export const SOUND_LIGHT_COPY: ReactionCopy = {
  gameTitle: 'Synesthesia Lab', emoji: '🎵', tagline: 'Sound + Light · Multi-Sensory',
  introBody: 'Hear a sound, see a colored light. Tap only when the sound and color match together!',
  chips: ['🎵 Sound', '💡 Light', '🔗 Match'], startLabel: 'Enter Lab', startGradient: ['#C084FC', '#A855F7', '#9333EA'],
  congrats: 'Sense Sync Pro!', scoreLabel: 'MATCHES', rootBg: '#4C1D95', backdrop: 'synesthesia',
};

export const QUICK_CHOICE_THEME: Session2ThemeTokens = {
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA'],
  title: '#DBEAFE', subtitle: '#BFDBFE', accent: '#38BDF8', accentDark: '#0EA5E9',
  hudGlass: 'rgba(30,58,138,0.88)', hudBorder: 'rgba(56,189,248,0.35)', cue: '#F0F9FF',
};

export const QUICK_CHOICE_COPY: ReactionCopy = {
  gameTitle: 'Split Second', emoji: '⚡', tagline: 'Decision Dash · Quick Thinking',
  introBody: 'Two choices appear — listen for the target, then tap the right one before time runs out!',
  chips: ['⚡ Fast', '🍎 Pick', '⏱️ Timer'], startLabel: 'Go Quick', startGradient: ['#38BDF8', '#0EA5E9', '#0284C7'],
  congrats: 'Quick Thinker!', scoreLabel: 'PICKS', rootBg: '#1E3A8A', backdrop: 'split',
};

export const REACTION_THEMES: Record<string, ReactionThemeBundle> = {
  'flash-tap': { theme: FLASH_TAP_THEME, copy: FLASH_TAP_COPY },
  'go-stop': { theme: GO_STOP_THEME, copy: GO_STOP_COPY },
  'surprise-pop': { theme: SURPRISE_POP_THEME, copy: SURPRISE_POP_COPY },
  'sound-light': { theme: SOUND_LIGHT_THEME, copy: SOUND_LIGHT_COPY },
  'quick-choice': { theme: QUICK_CHOICE_THEME, copy: QUICK_CHOICE_COPY },
};

export function getReactionTheme(logType: string): ReactionThemeBundle {
  return REACTION_THEMES[logType] ?? REACTION_THEMES['flash-tap']!;
}
