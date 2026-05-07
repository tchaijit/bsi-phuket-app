'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePartnersStore } from '@/stores/partnersStore';
import MainLayout from '@/components/layout/MainLayout';
import PartnerForm from '@/components/partners/PartnerForm';
import MapContextMenu from '@/components/map/MapContextMenu';
import { CATEGORY_META, STATUS_META } from '@/data/constants';
import type { PartnerCategory, ContractStatus, Partner } from '@/types';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Dynamic import for MapView to prevent SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/dashboard/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const categoryFilters = usePartnersStore((state) => state.categoryFilters);
  const statusFilters = usePartnersStore((state) => state.statusFilters);
  const toggleCategoryFilter = usePartnersStore((state) => state.toggleCategoryFilter);
  const toggleStatusFilter = usePartnersStore((state) => state.toggleStatusFilter);
  const filteredPartners = usePartnersStore((state) => state.filteredPartners);
  const fetchPartners = usePartnersStore((state) => state.fetchPartners);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchPartners();
    }
  }, [isAuthenticated, router, fetchPartners]);

  if (!isAuthenticated) {
    return null;
  }

  const handleMapClick = (lat: number, lng: number, x: number, y: number) => {
    if (canEdit) {
      setContextMenu({ x, y, lat, lng });
    }
  };

  const handleAddPartner = () => {
    if (contextMenu) {
      setEditingPartner({
        id: '',
        lat: contextMenu.lat,
        lng: contextMenu.lng,
      } as Partner);
      setContextMenu(null);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <MainLayout>
      <div className="h-full flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            onMapClick={handleMapClick}
            enableClickToAdd={canEdit}
            clearTempMarker={contextMenu === null && editingPartner === null}
          />
        </div>

        {/* Filters Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Map Controls</h2>

          {/* Right-click Instruction */}
          {canEdit && (
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 text-white rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-green-800 text-sm mb-1">🖱️ Quick Add</p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    <strong>Right-click</strong> anywhere on the map to create a new partner at that location!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredPartners.length}</div>
            <div className="text-sm text-gray-600">Partners on map</div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="space-y-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={categoryFilters.has(key as PartnerCategory)}
                    onChange={() => toggleCategoryFilter(key as PartnerCategory)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm text-gray-700">{meta.label}</span>
                  <span className="ml-auto text-xs text-gray-500">{meta.icon}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <div className="space-y-2">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={statusFilters.has(key as ContractStatus)}
                    onChange={() => toggleStatusFilter(key as ContractStatus)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm text-gray-700">{meta.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <MapContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            lat={contextMenu.lat}
            lng={contextMenu.lng}
            onAddPartner={handleAddPartner}
            onClose={handleCloseContextMenu}
          />
        )}

        {/* Partner Form Modal */}
        {editingPartner && (
          <PartnerForm
            partner={editingPartner}
            onClose={() => setEditingPartner(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
