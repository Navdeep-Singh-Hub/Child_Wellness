import type { DragMotionMode } from '@/components/game/occupational/level5/session3/session3Pacing';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type DragTrackGameConfig = {
  theme: Session2ThemeTokens;
  motion: DragMotionMode;
  emoji: string;
  title: string;
  tagline: string;
  introBody: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  targetEmoji: string;
  targetBg: string;
  fingerColor: string;
  tetherColor: string;
  trailColor: string;
  ttsIntro: string;
  ttsCue: string;
  ttsSuccess: string;
  ttsComplete: string;
  congrats: string;
  logType: string;
  skillTags: string[];
};

export const ROCKET_DRAG: DragTrackGameConfig = {
  theme: { sky: ['#0F172A', '#1E3A8A', '#312E81', '#4C1D95'], title: '#E0E7FF', subtitle: '#A5B4FC', accent: '#818CF8', accentDark: '#6366F1', hudGlass: 'rgba(15,23,42,0.8)', hudBorder: 'rgba(129,140,248,0.4)', cue: '#C7D2FE' },
  motion: 'horizontal', emoji: '🚀', title: 'Rocket Drag', tagline: 'Space Lane · Smooth Pursuit',
  introBody: 'Drag your glow puck to stay on the rocket as it sweeps across the stars. Hold steady for 3 seconds!',
  chips: ['👆 Drag', '🚀 Track', '✨ Hold'], startLabel: 'Launch', startGradient: ['#818CF8', '#6366F1', '#4F46E5'],
  targetEmoji: '🚀', targetBg: '#4F46E5', fingerColor: '#A5B4FC', tetherColor: 'rgba(129,140,248,0.55)', trailColor: '#C7D2FE',
  ttsIntro: 'Drag your finger to follow the rocket across space!', ttsCue: 'Stay on the rocket!', ttsSuccess: 'Great tracking!', ttsComplete: 'Stellar drag tracking!', congrats: 'Space Tracker!',
  logType: 'drag-rocket', skillTags: ['drag-tracking', 'smooth-pursuit', 'visual-motor'],
};

export const TRAIN_TRACK: DragTrackGameConfig = {
  theme: { sky: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24'], title: '#78350F', subtitle: '#92400E', accent: '#F59E0B', accentDark: '#D97706', hudGlass: 'rgba(255,255,255,0.88)', hudBorder: 'rgba(245,158,11,0.45)', cue: '#92400E' },
  motion: 'orbit', emoji: '🚂', title: 'Train Track', tagline: 'Rail Loop · Circular Pursuit',
  introBody: 'The train chugs around the track. Drag your finger on the engine and keep up as it loops!',
  chips: ['🚂 Loop', '👆 Drag', '🎯 Stay'], startLabel: 'All Aboard', startGradient: ['#F59E0B', '#D97706', '#B45309'],
  targetEmoji: '🚂', targetBg: '#D97706', fingerColor: '#FCD34D', tetherColor: 'rgba(245,158,11,0.5)', trailColor: '#FDE68A',
  ttsIntro: 'Follow the train around the track!', ttsCue: 'Keep on the train!', ttsSuccess: 'On track!', ttsComplete: 'Master conductor!', congrats: 'Track Master!',
  logType: 'drag-train', skillTags: ['circular-tracking', 'drag-control', 'motor-planning'],
};

export const COMET_CHASE: DragTrackGameConfig = {
  theme: { sky: ['#020617', '#0F172A', '#1E1B4B', '#312E81'], title: '#E9D5FF', subtitle: '#C4B5FD', accent: '#A78BFA', accentDark: '#8B5CF6', hudGlass: 'rgba(15,23,42,0.82)', hudBorder: 'rgba(167,139,250,0.4)', cue: '#DDD6FE' },
  motion: 'figure8', emoji: '☄️', title: 'Comet Chase', tagline: 'Night Sky · Figure-8 Path',
  introBody: 'A comet traces a figure-eight through the cosmos. Drag to match its glowing path!',
  chips: ['☄️ Curve', '👀 Watch', '👆 Drag'], startLabel: 'Blast Off', startGradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
  targetEmoji: '☄️', targetBg: '#7C3AED', fingerColor: '#C4B5FD', tetherColor: 'rgba(167,139,250,0.5)', trailColor: '#EDE9FE',
  ttsIntro: 'Chase the comet along its path!', ttsCue: 'Follow the comet!', ttsSuccess: 'Cosmic!', ttsComplete: 'Comet champion!', congrats: 'Comet Catcher!',
  logType: 'drag-comet', skillTags: ['figure-eight-tracking', 'complex-pursuit', 'visual-motor'],
};

export const RIVER_BOAT: DragTrackGameConfig = {
  theme: { sky: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9'], title: '#0E7490', subtitle: '#0891B2', accent: '#06B6D4', accentDark: '#0891B2', hudGlass: 'rgba(255,255,255,0.85)', hudBorder: 'rgba(6,182,212,0.4)', cue: '#155E75' },
  motion: 'vertical', emoji: '⛵', title: 'River Boat', tagline: 'Waterway · Vertical Track',
  introBody: 'A little boat bobs up and down the river. Drag your finger to ride along with it!',
  chips: ['⛵ Float', '👆 Drag', '🌊 Flow'], startLabel: 'Set Sail', startGradient: ['#22D3EE', '#06B6D4', '#0891B2'],
  targetEmoji: '⛵', targetBg: '#0891B2', fingerColor: '#67E8F9', tetherColor: 'rgba(6,182,212,0.45)', trailColor: '#A5F3FC',
  ttsIntro: 'Follow the boat up and down the river!', ttsCue: 'Stay on the boat!', ttsSuccess: 'Smooth sailing!', ttsComplete: 'River captain!', congrats: 'River Captain!',
  logType: 'drag-river', skillTags: ['vertical-tracking', 'drag-pursuit', 'rhythm-control'],
};

export const LIGHTNING_DRAG: DragTrackGameConfig = {
  theme: { sky: ['#1E293B', '#334155', '#475569', '#64748B'], title: '#F8FAFC', subtitle: '#CBD5E1', accent: '#FACC15', accentDark: '#EAB308', hudGlass: 'rgba(30,41,59,0.85)', hudBorder: 'rgba(250,204,21,0.35)', cue: '#FEF08A' },
  motion: 'zigzag', emoji: '⚡', title: 'Lightning Drag', tagline: 'Storm Chase · Zigzag Path',
  introBody: 'Lightning zigzags across the storm clouds. Drag fast and stay locked on the bolt!',
  chips: ['⚡ Fast', '👆 Drag', '🌩️ React'], startLabel: 'Enter Storm', startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  targetEmoji: '⚡', targetBg: '#EAB308', fingerColor: '#FDE047', tetherColor: 'rgba(250,204,21,0.55)', trailColor: '#FEF9C3',
  ttsIntro: 'Follow the lightning bolt!', ttsCue: 'Stay on the bolt!', ttsSuccess: 'Zap!', ttsComplete: 'Storm rider!', congrats: 'Storm Rider!',
  logType: 'drag-lightning', skillTags: ['zigzag-tracking', 'fast-pursuit', 'reaction-timing'],
};
