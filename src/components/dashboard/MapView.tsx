'use client';

import { useEffect, useRef } from 'react';
import { usePartnersStore } from '../../stores/partnersStore';
import { CATEGORY_META, PARTNER_TYPE_META, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../data/constants';
import type { Partner } from '../../types';

interface MapViewProps {
  onMapClick?: (lat: number, lng: number, x: number, y: number) => void;
  onEditPartner?: (partner: Partner) => void;
  enableClickToAdd?: boolean;
  clearTempMarker?: boolean;
}

export default function MapView({ onMapClick, onEditPartner, enableClickToAdd = false, clearTempMarker = false }: MapViewProps = {}) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const tempMarkerRef = useRef<any>(null);
  const isRightClickActiveRef = useRef<boolean>(false);
  const LeafletRef = useRef<any>(null); // Store Leaflet library reference
  const relocatingPartnerRef = useRef<any>(null); // Store partner being relocated
  const onMapClickRef = useRef(onMapClick); // Store latest onMapClick callback
  const onEditPartnerRef = useRef(onEditPartner); // Store latest onEditPartner callback
  const filteredPartners = usePartnersStore((state) => state.filteredPartners);
  const selectPartner = usePartnersStore((state) => state.selectPartner);

  // Update refs when callbacks change
  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onEditPartnerRef.current = onEditPartner;
  }, [onMapClick, onEditPartner]);

  useEffect(() => {
    // Initialize map ONLY ONCE - prevent re-initialization
    if (mapRef.current) {
      return;
    }

    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Store Leaflet reference for use in other effects
      LeafletRef.current = L;

      // Fix for default marker icons in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Check if map container already has a Leaflet instance
      const container = L.DomUtil.get('map');
      if (container && (container as any)._leaflet_id) {
        // Container already initialized, remove it
        (container as any)._leaflet_id = null;
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
        if (onMapClickRef.current) {
          onMapClickRef.current(lat, lng, clientX, clientY);
        }

        return false;
      });
    }
    };

    initMap();

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
    if (!mapRef.current || !LeafletRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for filtered partners
    filteredPartners.forEach((partner) => {
      if (typeof partner.lat !== 'number' || typeof partner.lng !== 'number') return;

      const categoryMeta = CATEGORY_META[partner.category];
      const typeMeta = PARTNER_TYPE_META[partner.partner_type || 'partner'];

      // Use partner_type color for marker background
      const icon = LeafletRef.current.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: ${typeMeta.color};
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

      const marker = LeafletRef.current.marker([partner.lat, partner.lng], { icon })
        .bindPopup(createPopupContent(partner))
        .on('click', () => selectPartner(partner))
        .on('popupopen', () => {
          // Add event listener to Edit button when popup opens
          const editBtn = document.querySelector(`button.edit-partner-btn[data-partner-id="${partner.id}"]`);
          if (editBtn) {
            editBtn.addEventListener('click', () => {
              if (onEditPartnerRef.current) {
                onEditPartnerRef.current(partner);
              }
            });
          }
        })
        .on('contextmenu', (e: any) => {
          e.originalEvent.preventDefault();

          // Show custom context menu
          const menu = document.createElement('div');
          menu.className = 'leaflet-contextmenu';
          menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 180px;
          `;

          menu.innerHTML = `
            <div style="padding: 8px 12px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #eee;">
              <strong>${partner.name_en}</strong>
            </div>
            <div class="menu-item" style="padding: 8px 12px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
                 onmouseover="this.style.background='#f0f0f0'"
                 onmouseout="this.style.background='white'">
              📍 ย้ายตำแหน่ง
            </div>
          `;

          document.body.appendChild(menu);

          // Position menu at cursor
          const rect = mapRef.current.getContainer().getBoundingClientRect();
          menu.style.left = `${e.originalEvent.clientX}px`;
          menu.style.top = `${e.originalEvent.clientY}px`;

          // Handle menu click
          const menuItem = menu.querySelector('.menu-item');
          menuItem?.addEventListener('click', () => {
            document.body.removeChild(menu);
            startRelocation(partner, marker);
          });

          // Close menu on outside click
          const closeMenu = (evt: MouseEvent) => {
            if (!menu.contains(evt.target as Node)) {
              if (document.body.contains(menu)) {
                document.body.removeChild(menu);
              }
              document.removeEventListener('click', closeMenu);
            }
          };

          setTimeout(() => {
            document.addEventListener('click', closeMenu);
          }, 100);
        })
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [filteredPartners, selectPartner]);

  const startRelocation = (partner: Partner, marker: any) => {
    relocatingPartnerRef.current = { partner, marker };

    // Change cursor
    mapRef.current.getContainer().style.cursor = 'crosshair';

    // Show instruction
    alert('คลิกที่แผนที่เพื่อเลือกตำแหน่งใหม่สำหรับ ' + partner.name_en);

    // Add click handler
    const handleMapClick = async (e: any) => {
      const { lat, lng } = e.latlng;

      const confirmed = window.confirm(
        `ยืนยันย้ายตำแหน่ง ${partner.name_en}?\n\nตำแหน่งใหม่:\nLat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}`
      );

      if (confirmed) {
        try {
          const response = await fetch(`/api/partners/${partner.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
          });

          if (response.ok) {
            alert('อัพเดทตำแหน่งสำเร็จ!');
            window.location.reload();
          } else {
            alert('ไม่สามารถอัพเดทตำแหน่งได้');
          }
        } catch (error) {
          console.error('Update error:', error);
          alert('เกิดข้อผิดพลาดในการอัพเดท');
        }
      }

      // Clean up
      mapRef.current.off('click', handleMapClick);
      mapRef.current.getContainer().style.cursor = '';
      relocatingPartnerRef.current = null;
    };

    mapRef.current.on('click', handleMapClick);
  };

  const createPopupContent = (partner: Partner): string => {
    const categoryMeta = CATEGORY_META[partner.category];
    const typeMeta = PARTNER_TYPE_META[partner.partner_type || 'partner']; // Fallback to 'partner' if undefined
    let html = `
      <div style="min-width: 220px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${partner.name_en}
        </div>
    `;

    if (partner.name_th) {
      html += `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${partner.name_th}</div>`;
    }

    html += `
      <div style="margin-bottom: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
        <span style="background: ${typeMeta.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
          ${typeMeta.icon} ${typeMeta.label}
        </span>
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

    // Add Edit Detail button
    html += `
      <button
        class="edit-partner-btn"
        data-partner-id="${partner.id}"
        style="
          width: 100%;
          margin-top: 12px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        "
        onmouseover="this.style.background='linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(59, 130, 246, 0.4)';"
        onmouseout="this.style.background='linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.3)';"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit Detail
      </button>
    `;

    html += `</div>`;
    return html;
  };

  return (
    <div className="h-full w-full">
      <div id="map" className="h-full w-full rounded-lg"></div>
    </div>
  );
}
