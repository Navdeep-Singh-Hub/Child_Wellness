import { type RefObject } from 'react';
import { Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { rasterizeStrokesToPngBase64, type StrokeLike } from './rasterizeStrokesWeb';

/**
 * Rasterize the drawing container to PNG base64 (no data: prefix).
 * The wrapped view should use collapsable={false} on Android and a solid background for contrast.
 */
export async function captureDrawingViewToBase64(
  ref: RefObject<View | null>
): Promise<string | null> {
  if (!ref.current) return null;
  try {
    const out = await captureRef(ref.current, {
      format: 'png',
      quality: 0.92,
      result: 'base64',
    });
    if (typeof out !== 'string') return null;
    return out.replace(/^data:image\/\w+;base64,/, '');
  } catch (e) {
    console.warn('[captureDrawing]', Platform.OS, e);
    return null;
  }
}

/**
 * Prefer view capture on native; on **web**, stroke rasterization (view-shot often fails on RN Web).
 */
export async function captureDrawingForAi(
  ref: RefObject<View | null>,
  strokes: StrokeLike[]
): Promise<string | null> {
  if (Platform.OS === 'web') {
    const fromStrokes = strokes?.length ? rasterizeStrokesToPngBase64(strokes) : null;
    if (fromStrokes) return fromStrokes;
    return captureDrawingViewToBase64(ref);
  }

  const fromView = await captureDrawingViewToBase64(ref);
  if (fromView) return fromView;
  return null;
}
