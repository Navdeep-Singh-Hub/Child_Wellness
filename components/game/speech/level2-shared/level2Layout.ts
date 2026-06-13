import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export const TABLET_MIN_WIDTH = 768;
export const LARGE_TABLET_MIN_WIDTH = 1024;

export type Level2Sizes = {
  isTablet: boolean;
  isLargeTablet: boolean;
  imageScale: number;
  choiceImage: number;
  heroImage: number;
  smallImage: number;
  zoneImage: number;
  avatarImage: number;
  tileMinHeight: number;
  tileMinWidthPct: `${number}%`;
  tileMaxWidthPct: `${number}%`;
  tileSmallMinWidthPct: `${number}%`;
  tileSmallMaxWidthPct: `${number}%`;
  tileWideMinWidthPct: `${number}%`;
  tileWideMaxWidthPct: `${number}%`;
  tilePadding: number;
  labelFontSize: number;
  choiceGap: number;
  playPadding: number;
};

export function getLevel2Sizes(screenWidth: number): Level2Sizes {
  const isTablet = screenWidth >= TABLET_MIN_WIDTH;
  const isLargeTablet = screenWidth >= LARGE_TABLET_MIN_WIDTH;

  if (isLargeTablet) {
    return {
      isTablet: true,
      isLargeTablet: true,
      imageScale: 2.2,
      choiceImage: 156,
      heroImage: 220,
      smallImage: 100,
      zoneImage: 76,
      avatarImage: 156,
      tileMinHeight: 220,
      tileMinWidthPct: '44%',
      tileMaxWidthPct: '48%',
      tileSmallMinWidthPct: '28%',
      tileSmallMaxWidthPct: '31%',
      tileWideMinWidthPct: '88%',
      tileWideMaxWidthPct: '94%',
      tilePadding: 20,
      labelFontSize: 21,
      choiceGap: 16,
      playPadding: 16,
    };
  }

  if (isTablet) {
    return {
      isTablet: true,
      isLargeTablet: false,
      imageScale: 1.9,
      choiceImage: 136,
      heroImage: 184,
      smallImage: 86,
      zoneImage: 64,
      avatarImage: 132,
      tileMinHeight: 196,
      tileMinWidthPct: '44%',
      tileMaxWidthPct: '48%',
      tileSmallMinWidthPct: '28%',
      tileSmallMaxWidthPct: '32%',
      tileWideMinWidthPct: '86%',
      tileWideMaxWidthPct: '92%',
      tilePadding: 18,
      labelFontSize: 20,
      choiceGap: 14,
      playPadding: 14,
    };
  }

  return {
    isTablet: false,
    isLargeTablet: false,
    imageScale: 1,
    choiceImage: 84,
    heroImage: 108,
    smallImage: 54,
    zoneImage: 42,
    avatarImage: 84,
    tileMinHeight: 132,
    tileMinWidthPct: '42%',
    tileMaxWidthPct: '48%',
    tileSmallMinWidthPct: '28%',
    tileSmallMaxWidthPct: '32%',
    tileWideMinWidthPct: '88%',
    tileWideMaxWidthPct: '95%',
    tilePadding: 14,
    labelFontSize: 17,
    choiceGap: 10,
    playPadding: 12,
  };
}

export function scaleLevel2ImageSize(baseSize: number, screenWidth: number): number {
  return Math.round(baseSize * getLevel2Sizes(screenWidth).imageScale);
}

export function useLevel2Layout() {
  const { width } = useWindowDimensions();
  const sizes = useMemo(() => getLevel2Sizes(width), [width]);
  return { width, sizes };
}
