'use client';

import { GameLayout } from '@/components/GameLayout';
import { NotebookUpload } from '@/components/NotebookUpload';
import Link from 'next/link';
import { useState } from 'react';

export default function NotebookTaskPage() {
  const [notebookDone, setNotebookDone] = useState(false);

  return (
    <GameLayout
      title="Farm Notebook Activity"
      instruction="Complete one of the activities below, then upload a photo."
      backHref="/farm-session-1"
    >
      <div className="flex-1 space-y-6 max-w-xl mx-auto">
        <div className="rounded-2xl bg-white p-6 border-4 border-farm-yellow shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 1</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Draw <strong>3 cows</strong> in your notebook.</li>
            <li>Write the number <strong>3</strong>.</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 border-4 border-farm-sky shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 2</h2>
          <p className="text-gray-700 mb-2">Write three words starting with <strong>C</strong>:</p>
          <p className="text-lg font-medium text-farm-green">cat, cow, cap</p>
          <p className="text-gray-600 mt-2">Then draw the objects.</p>
        </div>

        <NotebookUpload
          onComplete={() => setNotebookDone(true)}
        />

        {notebookDone && (
          <Link
            href="/farm-session-1/result"
            className="block w-full text-center rounded-2xl bg-farm-green text-white font-bold text-xl py-4"
          >
            See my result →
          </Link>
        )}
      </div>
    </GameLayout>
  );
}
