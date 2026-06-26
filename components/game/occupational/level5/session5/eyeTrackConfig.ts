export type EyeTrackMode = 'horizontal' | 'vertical' | 'circular' | 'jump' | 'multi';

export interface EyeTrackConfig {
  mode: EyeTrackMode;
  logType: string;
  title: string;
  emoji: string;
  description: string;
  skills: string[];
  suitableFor: string;
  instruction: string;
  footerSubtext: string;
  skillTags: string[];
}

export const SIDE_EYE_TRACK: EyeTrackConfig = {
  mode: 'horizontal',
  logType: 'side-eye-track',
  title: 'Side Eye Track',
  emoji: '👁️',
  description: 'Drag your finger with the dot moving left to right! Build eye-hand tracking.',
  skills: ['Reading readiness'],
  suitableFor: 'Children learning finger tracking and reading preparation',
  instruction: 'Drag your finger with the dot!',
  footerSubtext: 'Stay on the dot for 3 seconds to finish the round!',
  skillTags: ['reading-readiness', 'eye-hand-coordination', 'horizontal-tracking'],
};

export const UP_DOWN_TRACK: EyeTrackConfig = {
  mode: 'vertical',
  logType: 'up-down-track',
  title: 'Up-Down Track',
  emoji: '⬆️',
  description: 'Drag your finger with the dot moving up and down! Practice vertical tracking.',
  skills: ['Line shifting'],
  suitableFor: 'Children building vertical finger tracking control',
  instruction: 'Follow the dot up and down with your finger!',
  footerSubtext: 'Keep your finger on the dot to advance!',
  skillTags: ['line-shifting', 'eye-hand-coordination', 'vertical-tracking'],
};

export const CIRCULAR_TRACK: EyeTrackConfig = {
  mode: 'circular',
  logType: 'circular-track',
  title: 'Circular Track',
  emoji: '⭕',
  description: 'Drag your finger around the circle with the dot! Strengthen smooth pursuit.',
  skills: ['Eye muscle strength'],
  suitableFor: 'Children practicing smooth circular finger tracking',
  instruction: 'Trace the circle with your finger on the dot!',
  footerSubtext: 'Stay close to the dot for 3 seconds!',
  skillTags: ['eye-hand-coordination', 'circular-tracking', 'smooth-pursuit'],
};

export const JUMP_TRACK: EyeTrackConfig = {
  mode: 'jump',
  logType: 'jump-track',
  title: 'Jump Track',
  emoji: '⚡',
  description: 'Drag your finger to each spot when the dot jumps! Build quick tracking.',
  skills: ['Visual jump control'],
  suitableFor: 'Children learning to track jumping targets with their finger',
  instruction: 'Move your finger to the dot each time it jumps!',
  footerSubtext: 'Stay on the dot for 3 seconds to pass the round!',
  skillTags: ['saccades', 'visual-jump-control', 'eye-hand-coordination'],
};

export const MULTI_DOT: EyeTrackConfig = {
  mode: 'multi',
  logType: 'multi-dot',
  title: 'Multi Dot',
  emoji: '⚫',
  description: 'Two dots take turns moving! Drag your finger on whichever dot is active.',
  skills: ['Focus switching'],
  suitableFor: 'Children learning to switch finger focus between moving targets',
  instruction: 'Follow the bright dot with your finger!',
  footerSubtext: 'Switch to the active dot and stay on it!',
  skillTags: ['focus-switching', 'alternating-attention', 'eye-hand-coordination'],
};
