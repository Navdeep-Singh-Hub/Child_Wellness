/**
 * Musical Jungle Adventure — OT Level 3 Session 1 theme tokens.
 */

export const JUNGLE_CHARACTERS = {
  benny: { id: 'benny', name: 'Benny', role: 'Drum Bear', emoji: '🐻', instrument: 'drum' as const, color: '#D97706' },
  bella: { id: 'bella', name: 'Bella', role: 'Bell Bird', emoji: '🦜', instrument: 'bell' as const, color: '#0EA5E9' },
  charlie: { id: 'charlie', name: 'Charlie', role: 'Clap Monkey', emoji: '🐵', instrument: 'clap' as const, color: '#84CC16' },
} as const;

export const JUNGLE_GRADIENT: [string, string, string, string] = [
  '#ECFDF5',
  '#D1FAE5',
  '#6EE7B7',
  '#059669',
];

export const JUNGLE_SHELL = {
  gradient: JUNGLE_GRADIENT,
  backText: '#065F46',
  backBorder: 'rgba(5,150,105,0.25)',
  titleColor: '#064E3B',
  subtitleColor: '#047857',
  statLabel: '#059669',
  statValue: '#064E3B',
  statBorder: 'rgba(5,150,105,0.2)',
  playBorder: 'rgba(5,150,105,0.3)',
  playBg: 'rgba(255,255,255,0.4)',
  sparkleColor: '#FBBF24',
  accent: '#10B981',
  accentDark: '#047857',
  coinColor: '#F59E0B',
  leafColor: '#34D399',
};

export const GAME_THEMES = {
  beatMatch: {
    title: 'Beat Sync',
    subtitle: 'Tap when Benny drums — feel the jungle beat!',
    emoji: '🥁',
    drumBg: '#D97706',
    drumActive: '#B45309',
    hintText: 'Watch the pulse ring — tap right on the beat!',
    voiceIntro: 'Tap exactly when Benny beats the drum!',
    voiceComplete: 'You did it! Amazing rhythm!',
    congrats: 'Beat Sync Champion!',
  },
  stopGo: {
    title: 'Stop & Go',
    subtitle: 'Tap while music plays — freeze when it stops!',
    emoji: '⏸️',
    drumBg: '#7C3AED',
    drumActive: '#6D28D9',
    hintText: 'GO = tap! STOP = freeze your hands!',
    voiceIntro: 'Tap only while the jungle drums play. Freeze when silent!',
    voiceComplete: 'Great listening and control!',
    congrats: 'Stop & Go Star!',
  },
  copy: {
    title: 'Rhythm Echo',
    subtitle: 'Listen to the pattern, then repeat it!',
    emoji: '🔁',
    drumBg: '#2563EB',
    drumActive: '#1D4ED8',
    hintText: 'Listen carefully, then echo the beats!',
    voiceIntro: 'Listen to the rhythm pattern and repeat it back!',
    voiceComplete: 'Wonderful rhythm memory!',
    congrats: 'Rhythm Echo Master!',
  },
  loudSoft: {
    title: 'Loud & Soft',
    subtitle: 'BIG tap for loud, small tap for soft!',
    emoji: '🔊',
    drumBg: '#DC2626',
    drumActive: '#B91C1C',
    hintText: 'Loud drum = BIG tap. Soft bell = small tap!',
    voiceIntro: 'Match your tap size to the sound volume!',
    voiceComplete: 'Great force control!',
    congrats: 'Loud & Soft Pro!',
  },
  instrument: {
    title: 'Sound Match',
    subtitle: 'Which jungle friend made that sound?',
    emoji: '🎵',
    drumBg: '#059669',
    drumActive: '#047857',
    hintText: 'Listen, then pick Benny, Bella, or Charlie!',
    voiceIntro: 'Listen and find which friend made the sound!',
    voiceComplete: 'Sharp ears! Sound match complete!',
    congrats: 'Sound Detective!',
  },
} as const;
