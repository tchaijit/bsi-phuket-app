import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePartnersStore } from '../../stores/partnersStore';
import { CATEGORY_META, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../data/constants';
import type { Partner } from '../../types';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  onMapClick?: (lat: number, lng: number, x: number, y: number) => void;
  enableClickToAdd?: boolean;
  clearTempMarker?: boolean;
}

export default function MapView({ onMapClick, enableClickToAdd = false, clearTempMarker = false }: MapViewProps = {}) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const isRightClickActiveRef = useRef<boolean>(false);
  const filteredPartners = usePartnersStore((state) => state.filteredPartners);
  const selectPartner = usePartnersStore((state) => state.selectPartner);

  useEffect(() => {
    // Initialize map ONLY ONCE - prevent re-initialization
    if (mapRef.current) {
      return;
    }

    // Use same config as TestMap that works
    mapRef.current = L.map('map', {
      scrollWheelZoom: 'center',
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
    }).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add right-click handler if enabled
    if (enableClickToAdd && onMapClick) {
      const currentMap = mapRef.current;

      currentMap.on('contextmenu', (e: L.LeafletMouseEvent) => {
        e.originalEvent.preventDefault();

        // Disable interactions after contextmenu fires
        currentMap.dragging.disable();
        currentMap.scrollWheelZoom.disable();
        currentMap.doubleClickZoom.disable();
        currentMap.touchZoom.disable();
        currentMap.boxZoom.disable();
        currentMap.keyboard.disable();
        isRightClickActiveRef.current = true;

        const { lat, lng } = e.latlng;
        const { clientX, clientY } = e.originalEvent;

        // Remove previous temporary marker if exists
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
        }

        // Create pulsing green temporary marker
        const tempIcon = L.divIcon({
          className: 'temp-pin-marker',
          html: `<div style="
            background: #10B981;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Add temporary marker
        tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon })
          .addTo(currentMap);

        // Call the onMapClick handler with coordinates
        onMapClick(lat, lng, clientX, clientY);

        return false;
      });
    }

    // DON'T cleanup map to prevent re-initialization issues
    // Map will be cleaned up when component truly unmounts
  }, []);

  // Clear temporary marker when requested and re-enable map
  useEffect(() => {
    if (clearTempMarker) {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }

      // Reset right-click flag
      isRightClickActiveRef.current = false;

      // Re-enable all map interactions
      if (mapRef.current) {
        mapRef.current.dragging.enable();
        mapRef.current.scrollWheelZoom.enable();
        mapRef.current.doubleClickZoom.enable();
        mapRef.current.touchZoom.enable();
        mapRef.current.boxZoom.enable();
        mapRef.current.keyboard.enable();
      }
    }
  }, [clearTempMarker]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for filtered partners
    filteredPartners.forEach((partner) => {
      if (typeof partner.lat !== 'number' || typeof partner.lng !== 'number') return;

      const categoryMeta = CATEGORY_META[partner.category];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: ${categoryMeta.color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
        ">${categoryMeta.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([partner.lat, partner.lng], { icon })
        .bindPopup(createPopupContent(partner))
        .on('click', () => selectPartner(partner))
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [filteredPartners, selectPartner]);

  const createPopupContent = (partner: Partner): string => {
    const categoryMeta = CATEGORY_META[partner.category];
    let html = `
      <div style="min-width: 200px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${partner.name_en}
        </div>
    `;

    if (partner.name_th) {
      html += `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${partner.name_th}</div>`;
    }

    html += `
      <div style="margin-bottom: 8px;">
        <span style="background: ${categoryMeta.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
          ${categoryMeta.label}
        </span>
      </div>
    `;

    if (partner.contract) {
      html += `
        <div style="font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
          <div style="margin-bottom: 4px;"><strong>สัญญา:</strong> ${partner.contract.type}</div>
          ${partner.contract.end_date ? `<div><strong>หมดอายุ:</strong> ${partner.contract.end_date}</div>` : ''}
        </div>
      `;
    }

    if (partner.strategic_note) {
      html += `
        <div style="margin-top: 8px; padding: 6px; background: #fff8e1; border-left: 3px solid #fbc02d; font-size: 11px; border-radius: 3px;">
          💡 ${partner.strategic_note}
        </div>
      `;
    }

    html += `</div>`;
    return html;
  };

  return (
    <div className="h-full w-full">
      <div id="map" className="h-full w-full rounded-lg"></div>
    </div>
  );
}
