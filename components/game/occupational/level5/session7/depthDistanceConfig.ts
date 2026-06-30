export type DepthMode = 'near-far' | 'zoom' | 'falling' | 'shrinking' | 'layers';

export interface DepthGameConfig {
  mode: DepthMode;
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

export const NEAR_VS_FAR: DepthGameConfig = {
  mode: 'near-far',
  logType: 'near-vs-far',
  title: 'Near vs Far',
  emoji: '📏',
  description:
    'Stand at the yellow point! Tap the object closer to you or farther away from that spot.',
  skills: ['Distance judgment'],
  suitableFor: 'Children learning distance perception from a fixed viewpoint',
  instruction: 'Judge distance from the yellow point!',
  footerSubtext: 'Near = closer to you · Far = farther from you',
  skillTags: ['distance-judgment', 'spatial-awareness', 'size-perception'],
};

export const ZOOM_TOUCH: DepthGameConfig = {
  mode: 'zoom',
  logType: 'zoom-touch',
  title: 'Zoom Touch',
  emoji: '🔍',
  description: 'Watch the object grow bigger! Tap when it looks close enough.',
  skills: ['Depth awareness'],
  suitableFor: 'Children learning how size relates to distance',
  instruction: 'Tap when the object is big!',
  footerSubtext: 'Wait for it to grow, then tap!',
  skillTags: ['depth-awareness', 'size-scaling', 'timing'],
};

export const FALLING_OBJECTS: DepthGameConfig = {
  mode: 'falling',
  logType: 'falling-objects',
  title: 'Falling Objects',
  emoji: '🍎',
  description: 'Catch the object before it hits the ground! Build prediction skills.',
  skills: ['Prediction'],
  suitableFor: 'Children practicing intercepting moving targets',
  instruction: 'Catch it before it lands!',
  footerSubtext: 'Tap the falling object in time!',
  skillTags: ['prediction', 'intercept-timing', 'hand-eye-coordination'],
};

export const DEPTH_SHRINKING_TARGET: DepthGameConfig = {
  mode: 'shrinking',
  logType: 'depth-shrinking-target',
  title: 'Shrinking Target',
  emoji: '🎯',
  description: 'Tap the target before it shrinks away! Build precision.',
  skills: ['Precision'],
  suitableFor: 'Children learning to act before targets get too small',
  instruction: 'Tap before it gets too small!',
  footerSubtext: 'The target keeps shrinking!',
  skillTags: ['precision', 'shrinking-target', 'timing'],
};

export const THREE_LAYER_TAP: DepthGameConfig = {
  mode: 'layers',
  logType: '3-layer-tap',
  title: '3-Layer Tap',
  emoji: '📚',
  description: 'Three layers overlap! Tap only the front layer.',
  skills: ['Visual layering'],
  suitableFor: 'Children learning foreground vs background',
  instruction: 'Tap the front circle!',
  footerSubtext: 'Find the circle in front!',
  skillTags: ['visual-layering', 'foreground-selection', 'depth-cues'],
};
