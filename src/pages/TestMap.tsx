import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TestMap() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    console.log('🚀 TestMap component mounted');

    if (!mapRef.current) {
      console.log('🗺️ Creating Leaflet map...');

      const map = L.map('test-map').setView([7.8804, 98.3923], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      console.log('✅ Map created successfully');

      // Add right-click handler
      map.on('contextmenu', (e: L.LeafletMouseEvent) => {
        console.log('🖱️ RIGHT-CLICK DETECTED!!!', e.latlng);
        alert(`Right-clicked at: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        e.originalEvent.preventDefault();
        return false;
      });

      console.log('✅ Right-click handler attached');

      mapRef.current = map;
    }

    return () => {
      console.log('🧹 Cleaning up map');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', padding: 0, margin: 0 }}>
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderBottom: '2px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🧪 Right-Click Test Page</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          ⚠️ Open Console (F12) and RIGHT-CLICK on the map below
        </p>
      </div>
      <div id="test-map" style={{ width: '100%', height: 'calc(100vh - 100px)' }}></div>
    </div>
  );
}
