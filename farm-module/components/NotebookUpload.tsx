'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { triggerConfetti } from './Confetti';
import { ConfettiOnMount } from './Confetti';

export interface NotebookCheckResult {
  objects_detected: boolean;
  correct_count: boolean;
  c_words_present: boolean;
  feedback?: string;
}

export function NotebookUpload({
  onSuccess,
  onComplete,
}: {
  onSuccess?: (result: NotebookCheckResult) => void;
  onComplete?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<NotebookCheckResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !/\.(jpg|jpeg|png)$/i.test(f.name)) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/notebook-check', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      setResult(data);
      onSuccess?.(data);
      const correct = data.objects_detected && data.correct_count;
      if (correct) {
        triggerConfetti();
        onComplete?.();
      }
    } catch (err) {
      setResult({
        objects_detected: false,
        correct_count: false,
        c_words_present: false,
        feedback: 'Upload failed. Try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const isCorrect =
    result &&
    (result.objects_detected || result.correct_count || result.c_words_present);

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {!result ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full touch-target rounded-2xl bg-farm-sky text-white font-bold text-xl py-5 px-6 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            📷 Upload Photo
          </button>
          {preview && (
            <div className="rounded-2xl overflow-hidden border-4 border-gray-200">
              <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain bg-gray-100" />
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-4 bg-farm-green text-white font-bold text-lg disabled:opacity-70"
              >
                {uploading ? 'Checking...' : 'Check my notebook'}
              </button>
            </div>
          )}
        </>
      ) : (
        <motion.div
          className="rounded-2xl p-6 text-center border-4 border-farm-green bg-green-50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {isCorrect ? (
            <>
              <ConfettiOnMount />
              <p className="text-3xl font-bold text-farm-green">🎉 Great Job!</p>
              <p className="text-gray-700 mt-2">{result.feedback || 'Great drawing!'}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-amber-700">Let&apos;s try again!</p>
              <p className="text-gray-600 mt-2">{result.feedback || 'Draw 3 cows and write the number 3, or write three words starting with C.'}</p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
