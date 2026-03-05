/**
 * JawAwarenessCrocodileGame
 * 
 * AAC Game: 5 rounds, each round the user must open their mouth on command.
 * Uses MediaPipe Face Landmarker (web) or falls back gracefully on native.
 * 
 * Design: Playful jungle/croc theme — deep greens, warm yellows, chunky rounded UI.
 * Child-friendly, high-contrast, accessible.
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 5;
const OPEN_COMMAND_DURATION_MS = 4000;   // how long the "OPEN" window lasts
const CLOSE_WAIT_DURATION_MS   = 2000;   // wait after success for user to close
const COUNTDOWN_SECONDS        = 3;      // countdown before each round
// Strict thresholds so we only show "open" when mouth is clearly open (MAR-style ratio)
const OPEN_RATIO_THRESHOLD     = 0.052;  // must exceed to switch closed→open (stricter)
const CLOSE_RATIO_THRESHOLD    = 0.038;  // below this = closed (hysteresis)
const CLOSED_FOR_NEXT_ROUND    = 0.034;  // must be below this (strict) to allow next round
const EMA_ALPHA                = 0.32;
const OPEN_HOLD_MS             = 350;    // mouth must stay open this long to count round success
const WAIT_FOR_CLOSED_MS       = 800;    // must be closed this long before next round
const WAIT_FOR_CLOSED_POLL_MS  = 150;
const WAIT_FOR_CLOSED_MAX_MS   = 6000;   // max wait then start anyway

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'idle'
  | 'countdown'
  | 'open_command'
  | 'round_success'
  | 'round_fail'
  | 'complete';

interface RoundResult {
  round: number;
  success: boolean;
}

// ─── MediaPipe loader (web only) ─────────────────────────────────────────────

let _faceLandmarker: any = null;
let _mpLoaded = false;
let _mpLoading = false;
let _mpCallbacks: Array<(ok: boolean) => void> = [];

async function ensureMediaPipe(): Promise<boolean> {
  if (Platform.OS !== 'web') return false;
  if (_mpLoaded) return !!_faceLandmarker;
  if (_mpLoading) {
    return new Promise(res => _mpCallbacks.push(res));
  }
  _mpLoading = true;
  try {
    const { FaceLandmarker, FilesetResolver } = await import(
      '@mediapipe/tasks-vision'
    );
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );
    _faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
    });
    _mpLoaded = true;
    _mpCallbacks.forEach(cb => cb(true));
    return true;
  } catch (e) {
    console.error('MediaPipe init failed', e);
    _mpLoaded = true;
    _mpCallbacks.forEach(cb => cb(false));
    return false;
  } finally {
    _mpLoading = false;
    _mpCallbacks = [];
  }
}

// ─── Face detection helpers ───────────────────────────────────────────────────

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** MAR-style mouth ratio: (vertical1 + vertical2) / (2 * width) — more accurate than single gap. */
function computeMouthRatio(landmarks: any[]): number {
  if (!landmarks || landmarks.length < 300) return 0;
  const left = landmarks[61], right = landmarks[291];
  if (!left || !right) return 0;
  const width = dist(left, right);
  if (width < 0.001) return 0;
  const p13 = landmarks[13], p14 = landmarks[14], p17 = landmarks[17], p18 = landmarks[18];
  if (p13 && p14 && p17 && p18) {
    const v1 = dist(p13, p17);
    const v2 = dist(p14, p18);
    return (v1 + v2) / (2 * width);
  }
  const upper = landmarks[13], lower = landmarks[18];
  if (!upper || !lower) return 0;
  return dist(upper, lower) / width;
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  onBack?: () => void;
  onComplete?: () => void;
};

export const JawAwarenessCrocodileGame: React.FC<Props> = ({
  onBack,
  onComplete,
}) => {
  const { width: SW, height: SH } = useWindowDimensions();
  const isWide = SW >= 700;

  // ── Phase & round state ──────────────────────────────────────────────────
  const [phase, setPhase]           = useState<Phase>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [countdown, setCountdown]   = useState(COUNTDOWN_SECONDS);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [mouthOpen, setMouthOpen]   = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mpReady, setMpReady]       = useState(false);
  const [openProgress, setOpenProgress] = useState(0); // 0-1
  const [landmarks, setLandmarks]   = useState<Array<{ x: number; y: number; z?: number }> | null>(null);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const phaseRef       = useRef<Phase>('idle');
  const mouthOpenRef   = useRef(false);
  const emaRef         = useRef(0);
  const openHoldStartRef = useRef<number | null>(null);
  const roundSuccessRef  = useRef(false);
  const processingRef    = useRef(false);
  const animFrameRef     = useRef<number | null>(null);
  const videoRef         = useRef<HTMLVideoElement | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitForClosedRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const closedSinceRef     = useRef<number>(0);
  const openHoldTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMpTs           = useRef(0);
  const previewContainerRef = useRef<View>(null);
  const previewContainerElRef = useRef<HTMLElement | null>(null);
  const overlayCanvasRef   = useRef<HTMLCanvasElement | null>(null);
  const previewVideoRef    = useRef<HTMLVideoElement | null>(null);

  // ── Animations ───────────────────────────────────────────────────────────
  const jawAnim    = useRef(new Animated.Value(0)).current;  // 0=closed 1=open
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const successAnim= useRef(new Animated.Value(0)).current;
  const bgAnim     = useRef(new Animated.Value(0)).current;

  // ── Sync phase ref ───────────────────────────────────────────────────────
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { mouthOpenRef.current = mouthOpen; }, [mouthOpen]);

  // ── MediaPipe setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Native fallback: just mark ready (could use VisionCamera here)
      setMpReady(true);
      return;
    }
    ensureMediaPipe().then(ok => setMpReady(ok));
  }, []);

  // ── Camera setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setCameraReady(true);
      return;
    }

    let active = true;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        // Create hidden video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0;';
        document.body.appendChild(video);
        await video.play();
        videoRef.current = video;
        if (active) setCameraReady(true);
      } catch (e: any) {
        if (!active) return;
        const msg = e?.name === 'NotAllowedError'
          ? 'Camera permission denied'
          : e?.message || 'Camera error';
        setCameraError(msg);
      }
    })();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, []);

  // ── Frame processing ─────────────────────────────────────────────────────
  const processFrame = useCallback(async () => {
    if (!_faceLandmarker || !videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;
    // Run detection during countdown, open phase, or round_success (to detect mouth closed for next round)
    const ph = phaseRef.current;
    if (ph !== 'countdown' && ph !== 'open_command' && ph !== 'round_success') return;

    const now = performance.now();
    if (now - lastMpTs.current < 80) return;
    lastMpTs.current = now;

    try {
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      if (!imageData?.data) return;

      const result = _faceLandmarker.detectForVideo(imageData, now);
      const lms = result?.faceLandmarks?.[0];
      setLandmarks(lms ?? null);
      const ratio = lms ? computeMouthRatio(lms) : 0;

      emaRef.current = EMA_ALPHA * ratio + (1 - EMA_ALPHA) * emaRef.current;
      const ema = emaRef.current;

      const wasOpen = mouthOpenRef.current;
      const isNowOpen = wasOpen
        ? ema > CLOSE_RATIO_THRESHOLD
        : ema > OPEN_RATIO_THRESHOLD;

      if (isNowOpen !== wasOpen) {
        setMouthOpen(isNowOpen);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!cameraReady || !mpReady || Platform.OS !== 'web') return;
    const id = setInterval(processFrame, 80);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [cameraReady, mpReady, processFrame]);

  // ── Inject video preview + overlay canvas (web) ───────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (phase === 'idle' || phase === 'complete' || !streamRef.current) return;

    const PREVIEW_ID = 'croc-preview-container';
    const tryInject = () => {
      let container: HTMLElement | null =
        document.getElementById(PREVIEW_ID) ||
        document.querySelector(`[data-native-id="${PREVIEW_ID}"]`) ||
        document.querySelector(`[nativeID="${PREVIEW_ID}"]`);
      if (!container) {
        const divs = document.querySelectorAll('div');
        for (let i = 0; i < divs.length; i++) {
          const div = divs[i];
          if (div.getAttribute('data-native-id') === PREVIEW_ID || div.getAttribute('nativeID') === PREVIEW_ID || (div as any).id === PREVIEW_ID) {
            container = div as HTMLElement;
            break;
          }
        }
      }
      if (!container || container.offsetWidth === 0) return false;

      if (!container.getAttribute('data-native-id')) container.setAttribute('data-native-id', PREVIEW_ID);
      previewContainerElRef.current = container;

      let video = container.querySelector('video[data-croc-preview]') as HTMLVideoElement;
      if (!video) {
        video = document.createElement('video');
        video.setAttribute('data-croc-preview', 'true');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1;background:#000;';
        container.appendChild(video);
        previewVideoRef.current = video;
      }
      if (streamRef.current) {
        video.srcObject = streamRef.current;
        video.play().catch(() => {});
      }

      let canvas = overlayCanvasRef.current;
      if (!canvas || !container.contains(canvas)) {
        canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;';
        container.appendChild(canvas);
        overlayCanvasRef.current = canvas;
      }
      return true;
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const scheduleInject = () => {
      if (tryInject()) return;
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        if (tryInject() || attempts > 60) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
        }
      }, 150);
    };
    const t1 = setTimeout(scheduleInject, 100);
    return () => {
      clearTimeout(t1);
      if (intervalId) clearInterval(intervalId);
    };
  }, [phase, cameraReady]);

  // ── Draw jaw landmarks on overlay canvas ───────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web' || !landmarks || !overlayCanvasRef.current || !previewContainerElRef.current) return;
    const canvas = overlayCanvasRef.current;
    const container = previewContainerElRef.current;
    const w = container.offsetWidth || 320;
    const h = container.offsetHeight || 240;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    const mouthIndices = [61, 291, 13, 14, 17, 18];
    mouthIndices.forEach((idx, i) => {
      const p = landmarks[idx];
      if (!p) return;
      const x = p.x * w;
      const y = p.y * h;
      ctx.beginPath();
      ctx.arc(x, y, i < 2 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i < 2 ? '#FFD166' : (mouthOpen ? '#40C057' : '#F4845F');
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    if (landmarks[13] && landmarks[17]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[13].x * w, landmarks[13].y * h);
      ctx.lineTo(landmarks[17].x * w, landmarks[17].y * h);
      ctx.strokeStyle = mouthOpen ? '#40C057' : '#F4845F';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (landmarks[14] && landmarks[18]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[14].x * w, landmarks[14].y * h);
      ctx.lineTo(landmarks[18].x * w, landmarks[18].y * h);
      ctx.strokeStyle = mouthOpen ? '#40C057' : '#F4845F';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [landmarks, mouthOpen]);

  // ── Game logic ───────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (intervalRef.current) { /* don't clear detection */ }
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (countdownRef.current){ clearInterval(countdownRef.current); countdownRef.current = null; }
    if (waitForClosedRef.current) { clearInterval(waitForClosedRef.current); waitForClosedRef.current = null; }
    if (openHoldTimeoutRef.current) { clearTimeout(openHoldTimeoutRef.current); openHoldTimeoutRef.current = null; }
  }, []);

  const startCountdown = useCallback((round: number) => {
    setPhase('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    roundSuccessRef.current = false;

    let c = COUNTDOWN_SECONDS;
    const id = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(id);
        startOpenPhase(round);
      }
    }, 1000);
    countdownRef.current = id;
  }, []); // eslint-disable-line

  const startOpenPhase = useCallback((round: number) => {
    setPhase('open_command');
    setOpenProgress(0);
    roundSuccessRef.current = false;
    openHoldStartRef.current = null;
    if (openHoldTimeoutRef.current) clearTimeout(openHoldTimeoutRef.current);
    openHoldTimeoutRef.current = null;
    setMouthOpen(false);
    mouthOpenRef.current = false;
    emaRef.current = 0;

    // Animate progress bar
    const startTs = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTs;
      const p = Math.min(elapsed / OPEN_COMMAND_DURATION_MS, 1);
      setOpenProgress(p);
      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);

    // Timeout: if not opened in time → fail
    timeoutRef.current = setTimeout(() => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (!roundSuccessRef.current) {
        handleRoundFail(round);
      }
    }, OPEN_COMMAND_DURATION_MS);
  }, []); // eslint-disable-line

  const handleRoundSuccess = useCallback((round: number) => {
    if (roundSuccessRef.current) return;
    roundSuccessRef.current = true;
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }

    setOpenProgress(1);
    setRoundResults(prev => [...prev, { round, success: true }]);
    setPhase('round_success');

    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.delay(CLOSE_WAIT_DURATION_MS),
    ]).start(() => {
      successAnim.setValue(0);
      if (round >= TOTAL_ROUNDS) {
        setPhase('complete');
        onComplete?.();
        return;
      }
      // Wait for mouth to be *actually* closed (EMA ratio below strict threshold)
      closedSinceRef.current = 0;
      const startWait = Date.now();
      waitForClosedRef.current = setInterval(() => {
        const ema = emaRef.current;
        const isClosedByRatio = ema < CLOSED_FOR_NEXT_ROUND;
        if (isClosedByRatio) {
          closedSinceRef.current = closedSinceRef.current || Date.now();
          if (Date.now() - closedSinceRef.current >= WAIT_FOR_CLOSED_MS) {
            if (waitForClosedRef.current) clearInterval(waitForClosedRef.current);
            waitForClosedRef.current = null;
            startCountdown(round + 1);
            setCurrentRound(round + 1);
          }
        } else {
          closedSinceRef.current = 0;
        }
        if (Date.now() - startWait >= WAIT_FOR_CLOSED_MAX_MS) {
          if (waitForClosedRef.current) clearInterval(waitForClosedRef.current);
          waitForClosedRef.current = null;
          startCountdown(round + 1);
          setCurrentRound(round + 1);
        }
      }, WAIT_FOR_CLOSED_POLL_MS) as unknown as ReturnType<typeof setInterval>;
    });
  }, [successAnim, onComplete]); // eslint-disable-line

  const handleRoundFail = useCallback((round: number) => {
    setRoundResults(prev => [...prev, { round, success: false }]);
    setPhase('round_fail');

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => {
      // Retry same round
      timeoutRef.current = setTimeout(() => {
        startCountdown(round);
        setCurrentRound(round);
      }, 1200);
    });
  }, [shakeAnim]); // eslint-disable-line

  // ── Watch mouth state during open phase (require open for OPEN_HOLD_MS) ───
  useEffect(() => {
    if (phaseRef.current !== 'open_command') return;
    if (mouthOpen && !roundSuccessRef.current) {
      if (!openHoldTimeoutRef.current) {
        openHoldTimeoutRef.current = setTimeout(() => {
          openHoldTimeoutRef.current = null;
          if (mouthOpenRef.current && !roundSuccessRef.current) {
            handleRoundSuccess(currentRound);
          }
        }, OPEN_HOLD_MS);
      }
    } else {
      if (openHoldTimeoutRef.current) {
        clearTimeout(openHoldTimeoutRef.current);
        openHoldTimeoutRef.current = null;
      }
    }
  }, [mouthOpen, currentRound, handleRoundSuccess]);

  // ── Jaw animation ────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.spring(jawAnim, {
      toValue: mouthOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [mouthOpen, jawAnim]);

  // Pulse when in open_command phase
  useEffect(() => {
    if (phase === 'open_command') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase, pulseAnim]);

  // ── Start game ────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (waitForClosedRef.current) clearInterval(waitForClosedRef.current);
    waitForClosedRef.current = null;
    if (openHoldTimeoutRef.current) clearTimeout(openHoldTimeoutRef.current);
    openHoldTimeoutRef.current = null;
    setRoundResults([]);
    setCurrentRound(1);
    setMouthOpen(false);
    mouthOpenRef.current = false;
    emaRef.current = 0;
    setLandmarks(null);
    startCountdown(1);
  }, []); // eslint-disable-line

  // ── Derived ───────────────────────────────────────────────────────────────
  const completedSuccessfully = roundResults.filter(r => r.success).length;
  const jawRotate = jawAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '35deg'] });
  const successScale = successAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.3, 1] });

  // ── Colors / sizes ────────────────────────────────────────────────────────
  const CROC_SIZE  = isWide ? 220 : 160;
  const CROC_HALF  = CROC_SIZE / 2;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      {/* Background jungle pattern */}
      <View style={styles.bgLeaves} pointerEvents="none">
        {['🌿','🍃','🌿','🍂','🌿','🍃','🌿'].map((l, i) => (
          <Text key={i} style={[styles.bgLeaf, { top: `${10 + i * 12}%`, left: `${(i * 17) % 90}%`, opacity: 0.12 }]}>{l}</Text>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <Pressable style={styles.backBtn} onPress={onBack} accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Croc Mouth 🐊</Text>
          <Text style={styles.headerSub}>Open your mouth with Croc!</Text>
        </View>
        {/* Round dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const res = roundResults.find(r => r.round === i + 1);
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  res?.success ? styles.dotSuccess :
                  res?.success === false ? styles.dotFail :
                  i + 1 === currentRound && phase !== 'idle' ? styles.dotActive :
                  styles.dotEmpty,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Video container with jaw coordinates overlay (web, when playing) */}
      {Platform.OS === 'web' && phase !== 'idle' && phase !== 'complete' && (
        <View
          ref={previewContainerRef}
          nativeID="croc-preview-container"
          {...(Platform.OS === 'web' ? { id: 'croc-preview-container', 'data-native-id': 'croc-preview-container' } as any : {})}
          style={styles.previewContainer}
          collapsable={false}
        >
          <View style={styles.previewPlaceholder} pointerEvents="none">
            <Text style={styles.previewPlaceholderText}>📷 Camera</Text>
          </View>
        </View>
      )}

      {/* Main content area */}
      <View style={styles.content}>

        {/* ── IDLE / Start screen ── */}
        {phase === 'idle' && (
          <View style={styles.centerBox}>
            <Text style={styles.bigCroc}>🐊</Text>
            <Text style={styles.idleTitle}>Ready to play?</Text>
            <Text style={styles.idleDesc}>
              Open your mouth wide when Croc opens his!{'\n'}
              Complete {TOTAL_ROUNDS} rounds to win! 🌟
            </Text>
            {cameraError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>📷</Text>
                <Text style={styles.errorText}>{cameraError}</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
                onPress={startGame}
                accessibilityLabel="Start game"
              >
                <Text style={styles.startBtnText}>Let's Go! 🎮</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === 'countdown' && (
          <View style={styles.centerBox}>
            <Text style={styles.roundLabel}>Round {currentRound} of {TOTAL_ROUNDS}</Text>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </View>
            <Text style={styles.countdownHint}>Get ready…</Text>
          </View>
        )}

        {/* ── OPEN COMMAND / ROUND FAIL ── */}
        {(phase === 'open_command' || phase === 'round_fail') && (
          <View style={styles.centerBox}>
            <Text style={styles.roundLabel}>Round {currentRound} of {TOTAL_ROUNDS}</Text>

            {/* Crocodile SVG-style with animated jaw */}
            <Animated.View style={[
              styles.crocWrapper,
              { transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] },
            ]}>
              {/* Body */}
              <View style={[styles.crocBody, { width: CROC_SIZE, height: CROC_HALF }]}>
                <Text style={[styles.crocBodyText, { fontSize: CROC_HALF * 0.7 }]}>🐊</Text>
              </View>
              {/* Animated upper jaw */}
              <Animated.View style={[
                styles.jawTop,
                {
                  width: CROC_SIZE * 0.7,
                  height: CROC_HALF * 0.6,
                  transform: [{ rotate: jawRotate }],
                  transformOrigin: 'bottom center',
                },
              ]}>
                <Text style={{ fontSize: CROC_HALF * 0.5 }}>🟢</Text>
              </Animated.View>
            </Animated.View>

            {/* Big instruction */}
            <View style={[styles.commandBubble, mouthOpen && styles.commandBubbleOpen]}>
              <Text style={[styles.commandText, mouthOpen && styles.commandTextOpen]}>
                {mouthOpen ? '😁 GREAT! Keep it open!' : '👄 OPEN YOUR MOUTH!'}
              </Text>
            </View>

            {/* Timer bar */}
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${(1 - openProgress) * 100}%` as any }]} />
            </View>

            {/* Status */}
            <View style={[styles.statusChip, mouthOpen ? styles.statusOpen : styles.statusClosed]}>
              <Text style={styles.statusText}>
                {mouthOpen ? '🟢 Mouth OPEN' : '🔴 Mouth CLOSED'}
              </Text>
            </View>

            {phase === 'round_fail' && (
              <View style={styles.failBanner}>
                <Text style={styles.failText}>⏰ Time's up! Try again!</Text>
              </View>
            )}
          </View>
        )}

        {/* ── ROUND SUCCESS ── */}
        {phase === 'round_success' && (
          <Animated.View style={[styles.centerBox, { transform: [{ scale: successScale }] }]}>
            <Text style={styles.successEmoji}>🌟</Text>
            <Text style={styles.successTitle}>
              {currentRound >= TOTAL_ROUNDS ? 'Last one!' : `Round ${currentRound} done!`}
            </Text>
            <Text style={styles.successMsg}>
              {['Amazing! 🎉', 'Fantastic! 🦸', 'You did it! 🙌', 'So good! ⭐', 'Keep going! 🚀'][currentRound - 1] ?? 'Great!'}
            </Text>
            <View style={styles.checkRow}>
              {Array.from({ length: currentRound }).map((_, i) => (
                <Text key={i} style={styles.checkMark}>✅</Text>
              ))}
              {Array.from({ length: TOTAL_ROUNDS - currentRound }).map((_, i) => (
                <Text key={i} style={styles.checkEmpty}>⬜</Text>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── COMPLETE ── */}
        {phase === 'complete' && (
          <View style={styles.centerBox}>
            <Text style={styles.confetti}>🎊🏆🎊</Text>
            <Text style={styles.completeTitle}>You did it!</Text>
            <Text style={styles.completeDesc}>
              All {TOTAL_ROUNDS} rounds complete!{'\n'}Your jaw is getting stronger! 💪
            </Text>
            <View style={styles.trophyRow}>
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <Text key={i} style={styles.trophyStar}>⭐</Text>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [styles.playAgainBtn, pressed && styles.playAgainBtnPressed]}
              onPress={startGame}
              accessibilityLabel="Play again"
            >
              <Text style={styles.playAgainText}>Play Again 🔄</Text>
            </Pressable>
            {onBack && (
              <Pressable style={styles.doneBtn} onPress={onBack}>
                <Text style={styles.doneBtnText}>Done ✓</Text>
              </Pressable>
            )}
          </View>
        )}

      </View>

      {/* Camera status pill (bottom) */}
      {Platform.OS === 'web' && phase !== 'idle' && phase !== 'complete' && (
        <View style={styles.cameraStatus}>
          <View style={[styles.cameraStatusDot, cameraReady && mpReady ? styles.cameraOn : styles.cameraOff]} />
          <Text style={styles.cameraStatusText}>
            {cameraReady && mpReady ? 'Camera active' : cameraError ? 'No camera' : 'Starting camera…'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const JUNGLE_GREEN   = '#1B4332';
const MID_GREEN      = '#2D6A4F';
const LIGHT_GREEN    = '#52B788';
const YELLOW         = '#FFD166';
const ORANGE         = '#F4845F';
const WHITE          = '#FAFDF6';
const CREAM          = '#F0FFF4';
const DARK_TEXT      = '#0D2818';
const SUCCESS_COLOR  = '#40C057';
const FAIL_COLOR     = '#FA5252';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  bgLeaves: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgLeaf: {
    position: 'absolute',
    fontSize: 60,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: JUNGLE_GREEN,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MID_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: YELLOW,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  headerSub: {
    fontSize: 12,
    color: LIGHT_GREEN,
    marginTop: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotEmpty: {
    backgroundColor: MID_GREEN,
    borderColor: LIGHT_GREEN,
  },
  dotActive: {
    backgroundColor: YELLOW,
    borderColor: YELLOW,
  },
  dotSuccess: {
    backgroundColor: SUCCESS_COLOR,
    borderColor: SUCCESS_COLOR,
  },
  dotFail: {
    backgroundColor: FAIL_COLOR,
    borderColor: FAIL_COLOR,
  },

  // ── Video preview (jaw coordinates overlay) ───────────────────────────────
  previewContainer: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 4 / 3,
    alignSelf: 'center',
    backgroundColor: '#0D2818',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: LIGHT_GREEN,
    zIndex: 5,
    position: 'relative',
    minHeight: 180,
  },
  previewPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  previewPlaceholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },

  // ── Content ──────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 2,
  },
  centerBox: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },

  // ── Idle ─────────────────────────────────────────────────────────────────
  bigCroc: {
    fontSize: 100,
    marginBottom: 12,
  },
  idleTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: JUNGLE_GREEN,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  idleDesc: {
    fontSize: 16,
    color: MID_GREEN,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  startBtn: {
    backgroundColor: YELLOW,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 50,
    borderBottomWidth: 5,
    borderBottomColor: '#D4A017',
    shadowColor: JUNGLE_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startBtnPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  startBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: JUNGLE_GREEN,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,

  // ── Countdown ────────────────────────────────────────────────────────────
  roundLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: MID_GREEN,
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countdownCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: JUNGLE_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: YELLOW,
    shadowColor: JUNGLE_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  countdownNumber: {
    fontSize: 70,
    fontWeight: '900',
    color: YELLOW,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  countdownHint: {
    fontSize: 18,
    color: MID_GREEN,
    marginTop: 20,
    fontWeight: '600',
  },

  // ── Croc ─────────────────────────────────────────────────────────────────
  crocWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  crocBody: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  crocBodyText: {
    textAlign: 'center',
  },
  jawTop: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // ── Command ───────────────────────────────────────────────────────────────
  commandBubble: {
    backgroundColor: JUNGLE_GREEN,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: MID_GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    minWidth: 260,
    alignItems: 'center',
  },
  commandBubbleOpen: {
    backgroundColor: SUCCESS_COLOR,
    borderColor: '#2F9E44',
  },
  commandText: {
    fontSize: 22,
    fontWeight: '900',
    color: YELLOW,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  commandTextOpen: {
    color: WHITE,
  },

  // ── Timer bar ─────────────────────────────────────────────────────────────
  timerBarBg: {
    width: '85%',
    height: 16,
    backgroundColor: '#D8F3DC',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: LIGHT_GREEN,
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 6,
  },

  // ── Status chip ───────────────────────────────────────────────────────────
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 8,
  },
  statusOpen: {
    backgroundColor: '#D3F9D8',
    borderWidth: 2,
    borderColor: SUCCESS_COLOR,
  },
  statusClosed: {
    backgroundColor: '#FFE3E3',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_TEXT,
  },

  // ── Fail banner ───────────────────────────────────────────────────────────
  failBanner: {
    backgroundColor: '#FFE3E3',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: FAIL_COLOR,
    marginTop: 8,
  },
  failText: {
    fontSize: 16,
    fontWeight: '800',
    color: FAIL_COLOR,
    textAlign: 'center',
  },

  // ── Round success ─────────────────────────────────────────────────────────
  successEmoji: {
    fontSize: 90,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: JUNGLE_GREEN,
    marginBottom: 6,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  successMsg: {
    fontSize: 20,
    color: MID_GREEN,
    fontWeight: '600',
    marginBottom: 20,
  },
  checkRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  checkMark: { fontSize: 28 },
  checkEmpty: { fontSize: 28 },

  // ── Complete ──────────────────────────────────────────────────────────────
  confetti: {
    fontSize: 56,
    marginBottom: 8,
    textAlign: 'center',
  },
  completeTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: JUNGLE_GREEN,
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  completeDesc: {
    fontSize: 17,
    color: MID_GREEN,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
  trophyRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 28,
  },
  trophyStar: { fontSize: 32 },
  playAgainBtn: {
    backgroundColor: YELLOW,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    borderBottomWidth: 5,
    borderBottomColor: '#D4A017',
    marginBottom: 14,
    shadowColor: JUNGLE_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  playAgainBtnPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: '900',
    color: JUNGLE_GREEN,
    fontFamily: Platform.OS === 'web' ? "'Fredoka One', cursive" : undefined,
  } as any,
  doneBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: MID_GREEN,
  },
  doneBtnText: {
    fontSize: 16,
    color: MID_GREEN,
    fontWeight: '700',
  },

  // ── Camera status ─────────────────────────────────────────────────────────
  cameraStatus: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27,67,50,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 20,
    gap: 8,
  },
  cameraStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cameraOn:  { backgroundColor: SUCCESS_COLOR },
  cameraOff: { backgroundColor: FAIL_COLOR },
  cameraStatusText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Error box ─────────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: '#FFF3F3',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: FAIL_COLOR,
    maxWidth: 320,
  },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorText: {
    color: FAIL_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default JawAwarenessCrocodileGame;