/**
 * Level 6 — per-child settings store (neutral-face calibration baseline + mirror preview toggle).
 *
 * Persists via expo-secure-store on native and localStorage on web, mirroring the
 * existing pattern in utils/profileCache.ts so we don't add any new dependency.
 */

import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const MIRROR_KEY = 'level6_mirror_preview_enabled';
const CALIBRATION_KEY = 'level6_calibration_baseline';
const CALIBRATION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface Level6Calibration {
  baseline: number; // child's neutral jawRatio (typically ~0.08–0.14)
  updatedAt: number;
}

async function readRaw(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeRaw(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* persistence is best-effort */
  }
}

export async function getMirrorPreviewEnabled(): Promise<boolean> {
  const raw = await readRaw(MIRROR_KEY);
  if (raw === null) return true;
  return raw === 'true';
}

export async function setMirrorPreviewEnabled(value: boolean): Promise<void> {
  await writeRaw(MIRROR_KEY, value ? 'true' : 'false');
}

export async function getLevel6Calibration(): Promise<Level6Calibration | null> {
  const raw = await readRaw(CALIBRATION_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Level6Calibration;
    if (
      !data ||
      typeof data.baseline !== 'number' ||
      !Number.isFinite(data.baseline) ||
      typeof data.updatedAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - data.updatedAt > CALIBRATION_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setLevel6Calibration(baseline: number): Promise<void> {
  if (!Number.isFinite(baseline)) return;
  const safe = Math.max(0.04, Math.min(0.2, baseline));
  const payload: Level6Calibration = { baseline: safe, updatedAt: Date.now() };
  await writeRaw(CALIBRATION_KEY, JSON.stringify(payload));
}

/**
 * React hook that exposes the persisted Level 6 settings with optimistic
 * setters. Defaults are returned immediately so first render is never blocked.
 */
export function useLevel6Settings(): {
  mirrorPreviewEnabled: boolean;
  setMirrorPreview: (v: boolean) => Promise<void>;
  calibration: Level6Calibration | null;
  saveCalibration: (baseline: number) => Promise<void>;
  ready: boolean;
} {
  const [mirrorPreviewEnabled, setMirror] = useState(true);
  const [calibration, setCalibration] = useState<Level6Calibration | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [mirror, cal] = await Promise.all([
        getMirrorPreviewEnabled(),
        getLevel6Calibration(),
      ]);
      if (cancelled) return;
      setMirror(mirror);
      setCalibration(cal);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMirrorPreview = useCallback(async (v: boolean) => {
    setMirror(v);
    await setMirrorPreviewEnabled(v);
  }, []);

  const saveCalibration = useCallback(async (baseline: number) => {
    if (!Number.isFinite(baseline)) return;
    const safe = Math.max(0.04, Math.min(0.2, baseline));
    const next: Level6Calibration = { baseline: safe, updatedAt: Date.now() };
    setCalibration(next);
    await setLevel6Calibration(safe);
  }, []);

  return { mirrorPreviewEnabled, setMirrorPreview, calibration, saveCalibration, ready };
}
