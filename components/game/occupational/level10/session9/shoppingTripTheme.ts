/**
 * OT Level 10 · Session 9 · Game 2 — Shopping Trip · "Market Quest"
 *
 * Coral + mint shopping palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SHOP_SHELL = {
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.35)',
  statLabel: '#FDBA74',
  statValue: '#ECFDF5',
  statBorder: 'rgba(253,186,116,0.45)',
  stageBorder: 'rgba(249,115,22,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDBA74',
  sparkleColor: '#F97316',
  glassBorder: 'rgba(249,115,22,0.35)',
  academyLabel: 'REAL-LIFE LAB',
  browse: '#94A3B8',
  buy: '#22C55E',
} as const;

export type AisleKind = 'produce' | 'bakery' | 'toys' | 'checkout' | 'cart';

export type ShoppingTripRound = {
  id: string;
  aisle: AisleKind;
  label: string;
  emoji: string;
  color: string;
  browse: Point & { radius: number };
  buy: Point & { radius: number };
  voiceBrowse: string;
  voiceBuy: string;
  buyCue: string;
};

export const SHOPPING_TRIP_THEME = {
  title: 'Shopping Trip',
  subtitle: 'Browse each store aisle — then complete checkout with calm posture, attention and a steady hold!',
  emoji: '🛒',
  hero: '🛍️',
  accent: '#F97316',
  accentMint: '#22C55E',
  glow: 'rgba(249,115,22,0.5)',
  bgGradient: ['#0F172A', '#7C2D12', '#14532D', '#1E3A8A'] as [string, string, string, string],
  decor: ['🛒', '🛍️', '🍎', '🥖', '🧸', '💳', '🧾', '⭐'],
  hintText: 'Browse each aisle — then checkout with steady body and attention!',
  positionCue: 'Face the camera so we can track your shopping adventure.',
  browseLabel: 'BROWSE AISLE!',
  buyLabel: 'CHECKOUT!',
  holdBrowseLabel: 'ITEM FOUND!',
  holdBuyLabel: 'CHECKOUT DONE!',
  voiceIntro:
    'Welcome to Shopping Trip! Each round you browse a store aisle — then complete checkout with calm posture and steady attention.',
  voiceComplete: 'Shopping trip complete! You finished every aisle like a real-life sensory champion!',
  congrats: 'Shopping Trip Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const st = (
  id: string,
  aisle: AisleKind,
  label: string,
  emoji: string,
  color: string,
  browse: Point,
  buy: Point,
  voiceBrowse: string,
  voiceBuy: string,
  buyCue: string,
): ShoppingTripRound => ({
  id,
  aisle,
  label,
  emoji,
  color,
  browse: { ...browse, radius: 0.105 },
  buy: { ...buy, radius: 0.1 },
  voiceBrowse,
  voiceBuy,
  buyCue,
});

export const SHOPPING_TRIP_ROUNDS: ShoppingTripRound[] = [
  st(
    'produce',
    'produce',
    'Produce Aisle',
    '🍎',
    '#22C55E',
    { x: 0.26, y: 0.4 },
    { x: 0.5, y: 0.5 },
    'BROWSE LEFT — find the produce aisle!',
    'CHECKOUT hold! Calm produce purchase!',
    'Produce aisle — great shopping!',
  ),
  st(
    'bakery',
    'bakery',
    'Bakery Shelf',
    '🥖',
    '#FBBF24',
    { x: 0.74, y: 0.36 },
    { x: 0.48, y: 0.52 },
    'BROWSE RIGHT — reach the bakery shelf!',
    'CHECKOUT hold! Steady bakery buy!',
    'Bakery done — wonderful focus!',
  ),
  st(
    'toys',
    'toys',
    'Toy Shelf',
    '🧸',
    '#F472B6',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — browse the toy shelf!',
    'CHECKOUT hold! Toy purchase calm!',
    'Toy shelf — smart shopper!',
  ),
  st(
    'checkout',
    'checkout',
    'Checkout Line',
    '💳',
    '#38BDF8',
    { x: 0.3, y: 0.65 },
    { x: 0.5, y: 0.46 },
    'BROWSE the checkout line below!',
    'CHECKOUT hold! Wait calmly in line!',
    'Checkout calm — steady body!',
  ),
  st(
    'cart',
    'cart',
    'Shopping Cart',
    '🛒',
    '#F97316',
    { x: 0.72, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final aisle — browse the shopping cart!',
    'CHECKOUT hold! Champion shopper!',
    'Cart complete — trip done!',
  ),
];
