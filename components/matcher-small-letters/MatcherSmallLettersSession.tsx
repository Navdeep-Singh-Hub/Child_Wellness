import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';
import { GameCardGrip } from '@/components/level1-grip-session/GameCardGrip';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SessionConfig = {
  number: number;
  title: string;
  letters: string[];
};

const ALL = 'abcdefghijklmnopqrstuvwxyz'.split('');
const SESSIONS: SessionConfig[] = [
  { number: 1, title: 'Easy Strokes (i, l)', letters: ['i', 'l'] },
  { number: 2, title: 'Easy Strokes (t, i)', letters: ['t', 'i'] },
  { number: 3, title: 'Curves (c, o)', letters: ['c', 'o'] },
  { number: 4, title: 'Curves (a)', letters: ['a'] },
  { number: 5, title: 'Mixed (u, n)', letters: ['u', 'n'] },
  { number: 6, title: 'Mixed (m, h, r)', letters: ['m', 'h', 'r'] },
  { number: 7, title: 'Complex (b, d)', letters: ['b', 'd'] },
  { number: 8, title: 'Complex (p, q, g)', letters: ['p', 'q', 'g'] },
  { number: 9, title: 'Practice a–m', letters: 'abcdefghijklm'.split('') },
  { number: 10, title: 'Full a–z', letters: ALL },
];

const TOTAL_STEPS = 5;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function IntroGame({
  letters,
  onBack,
  onComplete,
  currentStep,
}: {
  letters: string[];
  onBack: () => void;
  onComplete: () => void;
  currentStep: number;
}) {
  const [idx, setIdx] = useState(0);
  const current = letters[idx];

  const next = () => {
    try {
      Speech.stop();
      Speech.speak(current, { rate: 0.85, pitch: 1.05 });
    } catch {}
    if (idx < letters.length - 1) setIdx((v) => v + 1);
    else setTimeout(onComplete, 500);
  };

  return (
    <GameContainerGrip
      title="Game 1: Letter Introduction"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      mascot="🔤"
      mascotHint="Listen and watch lowercase letters."
      onBack={onBack}
    >
      <View style={styles.center}>
        <Text style={styles.bigLetter}>{current}</Text>
        <Text style={styles.counter}>
          {idx + 1}/{letters.length}
        </Text>
        <Pressable style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>{idx < letters.length - 1 ? 'Next' : 'Done'}</Text>
        </Pressable>
      </View>
    </GameContainerGrip>
  );
}

function RecognitionGame({
  letters,
  onBack,
  onComplete,
  currentStep,
}: {
  letters: string[];
  onBack: () => void;
  onComplete: () => void;
  currentStep: number;
}) {
  const rounds = Math.max(4, Math.min(6, letters.length + 2));
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const target = letters[round % letters.length];
  const options = useMemo(() => {
    const pool = ALL.filter((x) => x !== target);
    return shuffle([target, ...shuffle(pool).slice(0, 3)]);
  }, [target]);

  useEffect(() => {
    try {
      Speech.stop();
      Speech.speak(`Tap letter ${target}`, { rate: 0.85, pitch: 1.05 });
    } catch {}
  }, [target]);

  const tap = (pick: string) => {
    if (pick !== target) {
      setFeedback('Try again');
      return;
    }
    if (round === rounds - 1) {
      setFeedback('Great!');
      setTimeout(onComplete, 450);
      return;
    }
    setFeedback('Correct');
    setTimeout(() => {
      setFeedback('');
      setRound((r) => r + 1);
    }, 350);
  };

  return (
    <GameContainerGrip
      title="Game 2: Letter Recognition"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      mascot="🔍"
      mascotHint={`Tap letter ${target}`}
      onBack={onBack}
    >
      <Text style={styles.prompt}>Tap letter {target}</Text>
      <Text style={styles.counter}>Round {round + 1}/{rounds}</Text>
      {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
      <View style={styles.options}>
        {options.map((o) => (
          <Pressable key={o} onPress={() => tap(o)} style={styles.optionBtn}>
            <Text style={styles.optionText}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameContainerGrip>
  );
}

function WritingGame({
  letters,
  onBack,
  onComplete,
  currentStep,
  title,
}: {
  letters: string[];
  onBack: () => void;
  onComplete: () => void;
  currentStep: number;
  title: string;
}) {
  const [idx, setIdx] = useState(0);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const expected = letters[idx % letters.length];
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);

  const verify = useCallback(async () => {
    setChecking(true);
    setMsg('');
    const b64 = await captureDrawingForAi(shotRef, strokes);
    if (!b64) {
      setChecking(false);
      setMsg('Could not capture drawing. Try again.');
      return;
    }
    const result = await validateLetterImage(b64, expected);
    setChecking(false);
    if (!result.ok) {
      setMsg(result.message || 'Validation failed. Try again.');
      return;
    }
    if (!isLetterValidationPass(result)) {
      setMsg(`Detected "${result.detectedLetter ?? '?'}" (${result.confidence ?? 0}%). Try "${expected}".`);
      return;
    }

    if (idx < letters.length - 1) {
      setIdx((v) => v + 1);
      setMsg('Correct! Next letter.');
      setStrokes([]);
      canvasRef.current?.clear();
    } else {
      setMsg('Great work!');
      setTimeout(onComplete, 350);
    }
  }, [expected, idx, letters.length, onComplete, strokes]);

  return (
    <GameContainerGrip
      title={title}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      mascot="✍️"
      mascotHint="Keep strokes thin and follow the lowercase shape."
      onBack={onBack}
    >
      <Text style={styles.prompt}>
        Write: <Text style={styles.expected}>{expected}</Text> ({idx + 1}/{letters.length})
      </Text>
      <View style={styles.writeRow}>
        <View style={styles.guideCard}>
          <Text style={styles.guideLabel}>Guide</Text>
          <Text style={styles.guideLetter}>{expected}</Text>
        </View>
        <View style={styles.canvasCard}>
          <Text style={styles.guideLabel}>Draw</Text>
          <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={7}
              canvasColor="#FFFFFF"
              randomColors={false}
              onStrokeEnd={(s) => setStrokes(s)}
            />
          </View>
        </View>
      </View>
      {!!msg && <Text style={styles.feedback}>{msg}</Text>}
      <View style={styles.rowActions}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => {
            setStrokes([]);
            setMsg('');
            canvasRef.current?.clear();
          }}
        >
          <Text style={styles.secondaryBtnText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={verify} disabled={checking}>
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Check</Text>}
        </Pressable>
      </View>
    </GameContainerGrip>
  );
}

function PhotoTask({
  letters,
  onBack,
  onComplete,
  currentStep,
}: {
  letters: string[];
  onBack: () => void;
  onComplete: (ok: boolean) => void;
  currentStep: number;
}) {
  const [target] = useState(() => letters[Math.floor(Math.random() * letters.length)] || 'a');
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const toBase64 = async (uri: string): Promise<{ b64: string; mimeType: string } | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
      return {
        b64: data.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: blob.type || 'image/jpeg',
      };
    } catch {
      return null;
    }
  };

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to upload task image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhoto(uri);
    setBusy(true);
    setMsg('');

    try {
      const encoded = await toBase64(uri);
      if (!encoded) {
        setMsg('Could not read selected image.');
        return;
      }
      const result = await validateLetterImage(encoded.b64, target, encoded.mimeType);
      if (!result.ok) {
        setMsg(result.message || 'Validation failed. Try another photo.');
        return;
      }
      if (!isLetterValidationPass(result)) {
        setMsg(`Detected "${result.detectedLetter ?? '?'}" (${result.confidence ?? 0}%). Try "${target}" again.`);
        return;
      }
      setMsg(`Great! "${target}" matched.`);
      onComplete(true);
    } catch (e: any) {
      setMsg(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <GameContainerGrip
      title="AI Task: Photo Upload"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      mascot="📷"
      mascotHint={`Write "${target}" on paper and upload photo.`}
      onBack={onBack}
    >
      <Text style={styles.prompt}>Write lowercase "{target}" on paper and upload.</Text>
      {photo ? <Image source={{ uri: photo }} style={styles.preview} resizeMode="contain" /> : null}
      {!!msg && <Text style={styles.feedback}>{msg}</Text>}
      <Pressable style={styles.primaryBtn} onPress={pick} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Upload Photo</Text>}
      </Pressable>
    </GameContainerGrip>
  );
}

export function MatcherSmallLettersSession({
  sessionNumber,
  onExit,
}: {
  sessionNumber: number;
  onExit?: () => void;
}) {
  const config = SESSIONS.find((s) => s.number === sessionNumber) || SESSIONS[0];
  const [step, setStep] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  const advance = useCallback(() => {
    setDoneCount((c) => Math.min(c + 1, TOTAL_STEPS));
    setStep((s) => Math.min(s + 1, 6));
  }, []);

  if (step === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable style={styles.backHeaderBtn} onPress={onExit}>
            <Ionicons name="arrow-back" size={24} color="#0EA5E9" />
            <Text style={styles.backHeaderText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Matcher: Small Letters</Text>
          <Text style={styles.subtitle}>
            Session {config.number}: {config.title}
          </Text>
          <Text style={styles.subtitle}>Letters: {config.letters.join(', ')}</Text>
          <GameCardGrip icon="🔤" title="Game 1: Introduction" description="See and hear lowercase letters" onPress={() => setStep(1)} isLocked={false} />
          <GameCardGrip icon="🔍" title="Game 2: Recognition" description="Tap the asked lowercase letter" onPress={() => setStep(2)} isLocked={false} />
          <GameCardGrip icon="✍️" title="Game 3: Tracing" description="Trace lowercase with thin strokes" onPress={() => setStep(3)} isLocked={false} />
          <GameCardGrip icon="📝" title="Game 4: Copy Writing" description="Copy from guide + AI check" onPress={() => setStep(4)} isLocked={false} />
          <GameCardGrip icon="📷" title="AI Task: Upload" description="Write on paper and upload photo" onPress={() => setStep(5)} isLocked={false} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Session Complete</Text>
          <Text style={styles.subtitle}>
            Session {config.number}: {config.title}
          </Text>
          <Text style={styles.subtitle}>Completed: {doneCount}/{TOTAL_STEPS}</Text>
          <ConfettiEffect />
          {onExit ? (
            <Pressable style={styles.primaryBtn} onPress={onExit}>
              <Text style={styles.primaryBtnText}>Back to sessions</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const back = () => setStep(0);
  return (
    <View style={styles.safe}>
      {step === 1 && <IntroGame letters={config.letters} currentStep={1} onBack={back} onComplete={advance} />}
      {step === 2 && <RecognitionGame letters={config.letters} currentStep={2} onBack={back} onComplete={advance} />}
      {step === 3 && <WritingGame letters={config.letters} currentStep={3} onBack={back} onComplete={advance} title="Game 3: Tracing" />}
      {step === 4 && <WritingGame letters={config.letters} currentStep={4} onBack={back} onComplete={advance} title="Game 4: Copy Writing" />}
      {step === 5 && <PhotoTask letters={config.letters} currentStep={5} onBack={back} onComplete={() => advance()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EFF9FF' },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#0369A1', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#0C4A6E', textAlign: 'center' },
  backHeaderBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  backHeaderText: { fontSize: 16, fontWeight: '700', color: '#0369A1' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  bigLetter: { fontSize: 150, fontWeight: '900', color: '#0EA5E9', lineHeight: 160 },
  counter: { fontSize: 14, fontWeight: '700', color: '#0C4A6E' },
  prompt: { fontSize: 20, fontWeight: '700', color: '#0C4A6E', textAlign: 'center' },
  expected: { fontSize: 28, fontWeight: '900', color: '#0284C7' },
  feedback: { fontSize: 14, color: '#0C4A6E', textAlign: 'center', marginTop: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 14 },
  optionBtn: { width: 82, height: 82, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#BAE6FD', alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: 42, color: '#0369A1', fontWeight: '900' },
  writeRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  guideCard: { flex: 1, backgroundColor: '#E0F2FE', borderRadius: 16, borderWidth: 2, borderColor: '#BAE6FD', padding: 10 },
  canvasCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#BAE6FD', padding: 10 },
  guideLabel: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#0C4A6E', marginBottom: 4 },
  guideLetter: { fontSize: 92, lineHeight: 100, textAlign: 'center', color: '#0284C7', fontWeight: '900' },
  captureWrap: { width: '100%', height: 240, backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden' },
  rowActions: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  primaryBtn: { backgroundColor: '#0284C7', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', minWidth: 140, alignSelf: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#E0F2FE', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', minWidth: 100, alignSelf: 'center' },
  secondaryBtnText: { color: '#0369A1', fontSize: 16, fontWeight: '800' },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#F8FAFC', marginTop: 10 },
});

