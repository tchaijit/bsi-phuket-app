'use client';

import { useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';

interface MapContextMenuProps {
  x: number;
  y: number;
  lat: number;
  lng: number;
  onAddPartner: () => void;
  onClose: () => void;
}

export default function MapContextMenu({ x, y, lat, lng, onAddPartner, onClose }: MapContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] animate-scale-in"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl border-2 border-green-500 overflow-hidden min-w-[280px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="font-bold">สร้าง Partner ใหม่</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">📍 ตำแหน่งที่เลือก:</div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono font-semibold text-gray-800">{lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono font-semibold text-gray-800">{lng.toFixed(6)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              💡 <strong>คำแนะนำ:</strong> คลิกปุ่มด้านล่างเพื่อสร้าง Partner ใหม่ที่ตำแหน่งนี้
            </p>
          </div>

          <button
            onClick={onAddPartner}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <MapPin className="w-5 h-5" />
            เพิ่ม Partner ที่นี่
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
