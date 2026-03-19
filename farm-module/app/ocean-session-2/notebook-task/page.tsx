'use client';

import { GameLayout } from '@/components/GameLayout';
import { NotebookUploadOcean } from '@/components/NotebookUploadOcean';
import Link from 'next/link';
import { useState } from 'react';

export default function OceanNotebookTaskPage() {
  const [notebookDone, setNotebookDone] = useState(false);

  return (
    <GameLayout
      title="Ocean Notebook Activity"
      instruction="Complete one of the activities below, then upload a photo."
      backHref="/ocean-session-2"
      theme="ocean"
    >
      <div className="flex-1 space-y-6 max-w-xl mx-auto">
        <div className="rounded-2xl bg-white p-6 border-4 border-ocean-blue shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 1</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Draw <strong>5 fish</strong> in your notebook.</li>
            <li>Write the number <strong>5</strong>.</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 border-4 border-ocean-coral shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Option 2</h2>
          <p className="text-gray-700 mb-2">Write <strong>3 rhyming ocean words</strong>.</p>
          <p className="text-lg font-medium text-ocean-blue">Example: fish, dish, wish</p>
          <p className="text-gray-600 mt-2">Then draw pictures of them.</p>
        </div>

        <NotebookUploadOcean onComplete={() => setNotebookDone(true)} />

        {notebookDone && (
          <Link
            href="/ocean-session-2/result"
            className="block w-full text-center rounded-2xl bg-ocean-green text-white font-bold text-xl py-4"
          >
            See my result →
          </Link>
        )}
      </div>
    </GameLayout>
  );
}
