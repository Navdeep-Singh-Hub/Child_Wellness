import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Special Education</h1>
      <p className="text-lg text-gray-600 mb-4">Level 2 · Sessions</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
        <Link
          href="/farm-session-1"
          className="rounded-2xl bg-farm-green text-white font-bold text-xl px-8 py-4 shadow-lg text-center"
        >
          Session 1 – Farm
        </Link>
        <Link
          href="/ocean-session-2"
          className="rounded-2xl bg-ocean-blue text-white font-bold text-xl px-8 py-4 shadow-lg text-center"
        >
          Session 2 – Ocean
        </Link>
        <Link
          href="/jungle-session-3"
          className="rounded-2xl bg-jungle-green text-white font-bold text-xl px-8 py-4 shadow-lg text-center"
        >
          Session 3 – Jungle
        </Link>
      </div>
    </div>
  );
}
