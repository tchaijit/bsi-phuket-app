'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X } from 'lucide-react';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapLocationPicker({
  initialLat = 7.8884,
  initialLng = 98.3826,
  onLocationSelect,
  onClose,
}: MapLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('location-picker-map').setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Create custom icon for the pin
    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="position: relative;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#EF4444" stroke="#DC2626" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="white"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add initial marker
    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.bindPopup(`<b>Selected Location</b><br>Lat: ${initialLat.toFixed(6)}<br>Lng: ${initialLng.toFixed(6)}`).openPopup();

    // Update marker on drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setSelectedCoords({ lat: position.lat, lng: position.lng });
      marker.setPopupContent(`<b>Selected Location</b><br>Lat: ${position.lat.toFixed(6)}<br>Lng: ${position.lng.toFixed(6)}`);
      marker.openPopup();
    });

    // Update marker on map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setSelectedCoords({ lat, lng });
      marker.setPopupContent(`<b>Selected Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);
      marker.openPopup();
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialLat, initialLng]);

  const handleConfirm = () => {
    onLocationSelect(selectedCoords.lat, selectedCoords.lng);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Pick Location from Map</h2>
              <p className="text-sm text-blue-100">Click on the map or drag the pin to select coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-lg p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Container */}
        <div id="location-picker-map" className="flex-1 min-h-[500px]" />

        {/* Coordinates Display & Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Latitude:</span>
                <span className="ml-2 text-lg font-bold text-gray-800">{selectedCoords.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Longitude:</span>
                <span className="ml-2 text-lg font-bold text-gray-800">{selectedCoords.lng.toFixed(6)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
