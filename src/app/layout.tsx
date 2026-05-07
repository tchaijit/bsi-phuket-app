import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
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
