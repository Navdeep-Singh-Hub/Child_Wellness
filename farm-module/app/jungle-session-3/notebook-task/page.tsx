'use client';

import { GameLayout } from '@/components/GameLayout';
import { NotebookUploadJungle } from '@/components/NotebookUploadJungle';
import Link from 'next/link';
import { useState } from 'react';

export default function JungleNotebookTaskPage() {
  const [notebookDone, setNotebookDone] = useState(false);

  return (
    <GameLayout
      title="Jungle Notebook Activity"
      instruction="Complete one of the activities below, then upload a photo."
      backHref="/jungle-session-3"
      theme="jungle"
    >
      <div className="flex-1 space-y-6 max-w-xl mx-auto">
        <div className="rounded-2xl bg-white p-6 border-4 border-jungle-green shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 1</h2>
          <p className="text-gray-700 mb-2">Write <strong>two rhyming jungle words</strong> and draw them.</p>
          <p className="text-lg font-medium text-jungle-green">Example: tree, bee</p>
        </div>
        <div className="rounded-2xl bg-white p-6 border-4 border-jungle-yellow shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 2</h2>
          <p className="text-gray-700 mb-2">Write a <strong>jungle word</strong> and mark the syllables.</p>
          <p className="text-lg font-medium text-jungle-green">Example: go-ril-la → 3</p>
          <p className="text-gray-600 mt-2">Then illustrate the word.</p>
        </div>

        <NotebookUploadJungle onComplete={() => setNotebookDone(true)} />

        {notebookDone && (
          <Link
            href="/jungle-session-3/result"
            className="block w-full text-center rounded-2xl bg-jungle-green text-white font-bold text-xl py-4"
          >
            See my result →
          </Link>
        )}
      </div>
    </GameLayout>
  );
}
