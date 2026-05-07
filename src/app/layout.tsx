import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'BSI Phuket Partnership Management',
  description: 'Manage partnerships, contracts, and strategic relationships in Phuket',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  );
}
