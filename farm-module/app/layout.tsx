import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Special Education Level 2 | Sessions',
  description: 'Special Education Level 2: Farm, Ocean & Jungle sessions. Interactive games for children 4–7: sound recognition, rhyming, syllables, counting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-farm-sky/20 text-gray-900">
        {children}
      </body>
    </html>
  );
}
