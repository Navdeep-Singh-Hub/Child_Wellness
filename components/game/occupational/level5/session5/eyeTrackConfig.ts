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
  description: 'Follow the dot moving left to right with your eyes! Build reading readiness.',
  skills: ['Reading readiness'],
  suitableFor: 'Children learning eye tracking and reading preparation',
  instruction: 'Follow the dot with your eyes!',
  footerSubtext: 'Follow the dot moving left to right!',
  skillTags: ['reading-readiness', 'eye-tracking', 'horizontal-tracking'],
};

export const UP_DOWN_TRACK: EyeTrackConfig = {
  mode: 'vertical',
  logType: 'up-down-track',
  title: 'Up-Down Track',
  emoji: '⬆️',
  description: 'Follow the dot moving up and down with your eyes! Practice line shifting.',
  skills: ['Line shifting'],
  suitableFor: 'Children building vertical eye movement control',
  instruction: 'Follow the dot up and down!',
  footerSubtext: 'Watch the dot move from top to bottom!',
  skillTags: ['line-shifting', 'eye-tracking', 'vertical-tracking'],
};

export const CIRCULAR_TRACK: EyeTrackConfig = {
  mode: 'circular',
  logType: 'circular-track',
  title: 'Circular Track',
  emoji: '⭕',
  description: 'Follow the dot moving in a circle! Strengthen eye muscles.',
  skills: ['Eye muscle strength'],
  suitableFor: 'Children practicing smooth circular eye movements',
  instruction: 'Follow the dot around the circle!',
  footerSubtext: 'Keep your eyes on the dot as it circles!',
  skillTags: ['eye-muscle-strength', 'circular-tracking', 'smooth-pursuit'],
};

export const JUMP_TRACK: EyeTrackConfig = {
  mode: 'jump',
  logType: 'jump-track',
  title: 'Jump Track',
  emoji: '⚡',
  description: 'Watch the dot jump from spot to spot! Build visual jump control.',
  skills: ['Visual jump control'],
  suitableFor: 'Children learning saccadic eye movements',
  instruction: 'Follow the dot when it jumps!',
  footerSubtext: 'Track each new position with your eyes!',
  skillTags: ['saccades', 'visual-jump-control', 'eye-tracking'],
};

export const MULTI_DOT: EyeTrackConfig = {
  mode: 'multi',
  logType: 'multi-dot',
  title: 'Multi Dot',
  emoji: '⚫',
  description: 'Two dots take turns moving! Practice focus switching.',
  skills: ['Focus switching'],
  suitableFor: 'Children learning to alternate visual attention',
  instruction: 'Follow whichever dot is moving!',
  footerSubtext: 'Switch your focus between the two dots!',
  skillTags: ['focus-switching', 'alternating-attention', 'eye-tracking'],
};
