/**
 * Cross-platform microphone level (0–1) for voice-activation games.
 * Web: Web Audio API analyser. Native: expo-av Recording metering.
 */

import { releaseAudioForMic } from '@/utils/releaseAudioForMic';
import { Audio as ExpoAudio, type RecordingStatus } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const POLL_MS = 50;
const SMOOTHING = 0.35;
const NATIVE_RELEASE_MS = Platform.OS === 'android' ? 400 : 150;

const METERING_RECORD_OPTIONS: ExpoAudio.RecordingOptions = {
  ...ExpoAudio.RecordingOptionsPresets.LOW_QUALITY,
  isMeteringEnabled: true,
};

let nativeRecordingBusy = false;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function smooth(prev: number, next: number) {
  return prev * (1 - SMOOTHING) + next * SMOOTHING;
}

/** Map dBFS to 0–1 (breath uses wider quiet range) */
function meteringToLevel(db: number, breath = false) {
  if (!Number.isFinite(db) || db <= -160) return 0;
  const minDb = breath ? -62 : -55;
  const maxDb = breath ? -10 : -8;
  const raw = clamp01((db - minDb) / (maxDb - minDb));
  return breath ? clamp01(raw * 1.35) : raw;
}

function applyMetering(
  db: number,
  sensitivity: number,
  levelRef: { current: number },
  setLevel: (n: number) => void,
  breath = false,
) {
  const normalized = meteringToLevel(db, breath) * sensitivity;
  levelRef.current = smooth(levelRef.current, clamp01(normalized));
  setLevel(levelRef.current);
}

export type VoiceLevelStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export interface UseVoiceLevelOptions {
  enabled?: boolean;
  sensitivity?: number;
  /** Softer mapping + time-domain RMS; disables noise suppression on web (better for breath) */
  variant?: 'default' | 'breath';
  /** When false, call start() from a button click (required for browser mic permission) */
  autoStart?: boolean;
}

export interface UseVoiceLevelResult {
  level: number;
  status: VoiceLevelStatus;
  error: string | null;
  start: () => Promise<boolean>;
  stop: () => void;
  calibrateBaseline: () => void;
}

export function useVoiceLevel(options: UseVoiceLevelOptions = {}): UseVoiceLevelResult {
  const variant = options.variant ?? 'default';
  const isBreath = variant === 'breath';
  const { enabled = true, sensitivity = isBreath ? 2.1 : 1.2, autoStart = true } = options;

  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<VoiceLevelStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const levelRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const startGenRef = useRef(0);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  const recordingRef = useRef<ExpoAudio.Recording | null>(null);

  const stopWeb = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    analyserRef.current = null;
    dataRef.current = null;
  }, []);

  const stopNative = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const rec = recordingRef.current;
    recordingRef.current = null;

    if (rec) {
      try {
        const st = await rec.getStatusAsync();
        if (st.canRecord || st.isRecording) {
          await rec.stopAndUnloadAsync();
        }
      } catch {
        try {
          await rec.stopAndUnloadAsync();
        } catch {
          /* ignore */
        }
      }
    }

    nativeRecordingBusy = false;
    await new Promise((resolve) => setTimeout(resolve, NATIVE_RELEASE_MS));
  }, []);

  const stop = useCallback(async () => {
    stopWeb();
    await stopNative();
    startedRef.current = false;
    levelRef.current = 0;
    setLevel(0);
    setStatus('idle');
  }, [stopWeb, stopNative]);

  const calibrateBaseline = useCallback(() => {
    /* Reserved */
  }, []);

  const onRecordingStatus = useCallback(
    (st: RecordingStatus) => {
      if (!st.isRecording) return;
      const db = typeof st.metering === 'number' ? st.metering : -160;
      applyMetering(db, sensitivity, levelRef, setLevel, isBreath);
    },
    [sensitivity, isBreath],
  );

  const startWeb = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setError('Microphone not supported in this browser');
      setStatus('error');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: isBreath
          ? {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
      });
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) {
        setError('Web Audio not supported');
        setStatus('error');
        return false;
      }
      const ctx = new Ctx();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = isBreath ? 2048 : 512;
      analyser.smoothingTimeConstant = isBreath ? 0.22 : 0.4;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.fftSize);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const tick = () => {
        if (!analyserRef.current || !dataRef.current) return;
        let boosted = 0;
        if (isBreath) {
          analyserRef.current.getByteTimeDomainData(dataRef.current);
          let sumSq = 0;
          for (let i = 0; i < dataRef.current.length; i++) {
            const v = (dataRef.current[i] - 128) / 128;
            sumSq += v * v;
          }
          const rms = Math.sqrt(sumSq / dataRef.current.length);
          boosted = clamp01(rms * sensitivity * 4.2);
        } else {
          analyserRef.current.getByteFrequencyData(dataRef.current);
          let sum = 0;
          for (let i = 0; i < dataRef.current.length; i++) sum += dataRef.current[i];
          const avg = sum / dataRef.current.length / 255;
          boosted = clamp01(avg * sensitivity * 2.2);
        }
        levelRef.current = smooth(levelRef.current, boosted);
        setLevel(levelRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      setStatus('active');
      setError(null);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Microphone permission denied';
      setError(msg);
      setStatus('denied');
      return false;
    }
  }, [sensitivity, isBreath]);

  const tryCreateRecording = useCallback(
    async (gen: number, withMetering: boolean): Promise<ExpoAudio.Recording | null> => {
      if (startGenRef.current !== gen) return null;

      const recordOptions: ExpoAudio.RecordingOptions = withMetering
        ? METERING_RECORD_OPTIONS
        : { ...ExpoAudio.RecordingOptionsPresets.LOW_QUALITY };

      const { recording } = await ExpoAudio.Recording.createAsync(
        recordOptions,
        (st) => onRecordingStatus(st),
        POLL_MS,
      );

      if (startGenRef.current !== gen) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          /* ignore */
        }
        return null;
      }

      return recording;
    },
    [onRecordingStatus],
  );

  const startNative = useCallback(
    async (gen: number): Promise<boolean> => {
      if (startGenRef.current !== gen) return false;

      try {
        await releaseAudioForMic();
        if (startGenRef.current !== gen) return false;

        const perm = await ExpoAudio.requestPermissionsAsync();
        if (!perm.granted) {
          setError('Microphone permission is required for voice games');
          setStatus('denied');
          return false;
        }

        if (nativeRecordingBusy) {
          await stopNative();
        }
        if (startGenRef.current !== gen) return false;

        nativeRecordingBusy = true;

        let recording: ExpoAudio.Recording | null = null;
        try {
          recording = await tryCreateRecording(gen, true);
        } catch (firstErr) {
          console.warn('[useVoiceLevel] metering record failed, retrying:', firstErr);
          await stopNative();
          nativeRecordingBusy = true;
          if (startGenRef.current !== gen) return false;
          recording = await tryCreateRecording(gen, false);
        }

        if (!recording) return false;

        recordingRef.current = recording;

        pollRef.current = setInterval(async () => {
          try {
            const rec = recordingRef.current;
            if (!rec) return;
            const st = await rec.getStatusAsync();
            if (!st.isRecording) return;
            const db = typeof st.metering === 'number' ? st.metering : -160;
            applyMetering(db, sensitivity, levelRef, setLevel, isBreath);
          } catch {
            /* ignore */
          }
        }, POLL_MS);

        setStatus('active');
        setError(null);
        return true;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Could not start microphone';
        console.warn('[useVoiceLevel] startNative failed:', msg);
        setError(msg);
        setStatus('error');
        await stopNative();
        return false;
      }
    },
    [sensitivity, isBreath, stopNative, tryCreateRecording],
  );

  const start = useCallback(async (): Promise<boolean> => {
    const gen = ++startGenRef.current;
    startedRef.current = false;
    await stop();
    if (startGenRef.current !== gen) return false;

    setStatus('requesting');
    setError(null);

    const ok = Platform.OS === 'web' ? await startWeb() : await startNative(gen);

    if (startGenRef.current !== gen) return false;

    if (!ok) {
      startedRef.current = false;
      return false;
    }

    startedRef.current = true;
    return true;
  }, [startWeb, startNative, stop]);

  useEffect(() => {
    if (!enabled) {
      void stop();
      return;
    }

    if (!autoStart) {
      return () => {
        startGenRef.current += 1;
        void stop();
      };
    }

    const delay = Platform.OS === 'web' ? 100 : 900;
    const t = setTimeout(() => {
      void start();
    }, delay);

    return () => {
      clearTimeout(t);
      startGenRef.current += 1;
      void stop();
    };
  }, [enabled, autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  return { level, status, error, start, stop, calibrateBaseline };
}
