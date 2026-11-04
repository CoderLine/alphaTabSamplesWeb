import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'alphaTab + Next.js 16 (Turbopack)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
