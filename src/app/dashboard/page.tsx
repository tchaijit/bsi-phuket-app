'use client';

import { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePartnersStore } from '@/stores/partnersStore';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import ContractExpiryChart from '@/components/dashboard/ContractExpiryChart';
import ZoneDistribution from '@/components/dashboard/ZoneDistribution';
import PartnerForm from '@/components/partners/PartnerForm';
import { Building2, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import type { Partner } from '@/types';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Dynamic import for MapView to prevent SSR issues with Leaflet
const MapView = dynamicImport(() => import('@/components/dashboard/MapView'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>,
});

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const partners = usePartnersStore((state) => state.partners);
  const fetchPartners = usePartnersStore((state) => state.fetchPartners);
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

  const activeContracts = partners.filter((p) => p.contract?.status === 'active').length;
  const expiringContracts = partners.filter((p) => p.contract?.status === 'expiring_soon').length;
  const totalValue = partners.reduce((sum, p) => sum + (p.contract?.value || 0), 0);
  const formattedValue = `฿${(totalValue / 1000000).toFixed(1)}M`;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Partners"
            value={partners.length}
            icon={Building2}
            color="blue"
          />
          <StatsCard
            title="Active Contracts"
            value={activeContracts}
            icon={FileText}
            color="green"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringContracts}
            icon={AlertCircle}
            color="yellow"
          />
          <StatsCard
            title="Total Contract Value"
            value={formattedValue}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContractExpiryChart />
          <ZoneDistribution />
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Partner Locations</h2>
          <div className="h-[500px]">
            <MapView onEditPartner={setEditingPartner} />
          </div>
        </div>
      </div>

      {/* Partner Form Modal */}
      {editingPartner && (
        <PartnerForm
          partner={editingPartner}
          onClose={() => setEditingPartner(null)}
        />
      )}
    </MainLayout>
  );
}
